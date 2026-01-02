import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { analyzeJobMatch } from '@/lib/gemini';
import { extractTextFromFile } from '@/lib/pdfParser';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check evaluation limit
    if (user.evaluations_used >= user.evaluations_limit) {
      return NextResponse.json(
        { error: 'Evaluation limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    const cvFile = formData.get('cvFile');
    const jobLink = formData.get('jobLink');
    const jobDescription = formData.get('jobDescription');
    const jobLocation = formData.get('jobLocation');
    const homeLocation = formData.get('homeLocation');
    const workSchedule = formData.get('workSchedule');
    const grossSalary = parseFloat(formData.get('grossSalary'));
    const dailyTransportCost = parseFloat(formData.get('dailyTransportCost'));
    const benefitsString = formData.get('benefits');
    const language = formData.get('language') || 'pt-BR';
    
    // Parse benefits
    let benefits = [];
    try {
      if (benefitsString && benefitsString.trim() !== '' && benefitsString !== 'undefined') {
        benefits = JSON.parse(benefitsString);
      }
    } catch (e) {
      console.error('Error parsing benefits:', e.message, 'String:', benefitsString);
      benefits = [];
    }
    
    // Validate benefits array
    if (!Array.isArray(benefits)) {
      benefits = [];
    }
    
    // Calculate total benefits
    const totalBenefits = benefits.reduce((sum, b) => sum + (parseFloat(b.value) || 0), 0);
    
    if (!cvFile || !jobDescription) {
      return NextResponse.json(
        { error: 'CV and job description are required' },
        { status: 400 }
      );
    }
    
    // Extract CV text
    let cvText;
    try {
      cvText = await extractTextFromFile(cvFile);
      
      // Validate CV text
      if (!cvText || cvText.trim().length < 50) {
        return NextResponse.json(
          { error: language === 'pt-BR' 
            ? 'O currículo está vazio ou não pôde ser lido. Por favor, verifique o arquivo e tente novamente.' 
            : 'The CV is empty or could not be read. Please check the file and try again.' },
          { status: 400 }
        );
      }
      
      console.log('CV extracted successfully, length:', cvText.length);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to extract text from CV. Please ensure the file is a valid PDF or TXT file.' },
        { status: 400 }
      );
    }
    
    // Analyze with Gemini
    let analysis;
    try {
      // Get user settings for desired salary and position
      const db = await getDatabase();
      const userSettings = await db.collection('user_settings').findOne({ user_id: user.user_id });
      
      const desiredSalary = userSettings?.desired_salary || null;
      const desiredPosition = userSettings?.desired_position || null;
      
      analysis = await analyzeJobMatch(cvText, jobDescription, dailyTransportCost, desiredSalary, desiredPosition, language);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return NextResponse.json(
        { error: 'Failed to analyze job match. Please try again.' },
        { status: 500 }
      );
    }
    
    // Calculate net value using monthly transport cost from analysis
    const monthlyTransportCost = analysis.monthly_transport_cost || 0;
    const netValue = grossSalary - monthlyTransportCost;
    const netValueWithBenefits = netValue + totalBenefits;
    
    // Save evaluation
    const db = await getDatabase();
    const evaluation = {
      evaluation_id: uuidv4(),
      user_id: user.user_id,
      job_link: jobLink,
      job_location: jobLocation,
      home_location: homeLocation,
      work_schedule_input: workSchedule,
      gross_salary: grossSalary,
      daily_transport_cost: dailyTransportCost,
      monthly_transport_cost: monthlyTransportCost,
      benefits: benefits,
      total_benefits: totalBenefits,
      work_schedule: analysis.work_schedule,
      net_value: netValue,
      net_value_with_benefits: netValueWithBenefits,
      score: analysis.score,
      analysis: analysis.analysis,
      cover_letter: analysis.cover_letter,
      email_draft: analysis.email_draft,
      created_at: new Date(),
    };
    
    await db.collection('evaluations').insertOne(evaluation);
    
    // Update user evaluation count
    await db.collection('users').updateOne(
      { user_id: user.user_id },
      { $inc: { evaluations_used: 1 } }
    );
    
    return NextResponse.json({
      score: analysis.score,
      analysis: analysis.analysis,
      cover_letter: analysis.cover_letter,
      email_draft: analysis.email_draft,
      work_schedule: analysis.work_schedule,
      monthly_transport_cost: monthlyTransportCost,
      total_benefits: totalBenefits,
      net_value: netValue,
      net_value_with_benefits: netValueWithBenefits,
      evaluations_used: user.evaluations_used + 1,
      evaluations_limit: user.evaluations_limit,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

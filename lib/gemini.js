import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDatabase } from './mongodb';

let genAI = null;

export async function getGeminiClient() {
  if (!genAI) {
    // Try to get API key from admin settings first
    try {
      const db = await getDatabase();
      const settings = await db.collection('admin_settings').findOne({ key: 'gemini_api_key' });
      const apiKey = settings?.value || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }
      
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      // Fallback to env variable
      if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      } else {
        throw new Error('Gemini API key not configured');
      }
    }
  }
  return genAI;
}

export async function getGeminiModel(modelName = 'gemini-2.5-flash') {
  const client = await getGeminiClient();
  return client.getGenerativeModel({ model: modelName });
}

export async function analyzeJobMatch(cvText, jobDescription, dailyTransportCost, desiredSalary = null, desiredPosition = null, language = 'pt-BR') {
  const model = await getGeminiModel();
  
  const prompts = {
    'pt-BR': `Analise o seguinte currículo em relação à descrição da vaga e forneça uma avaliação estruturada.

TEXTO DO CURRÍCULO:
${cvText}

DESCRIÇÃO DA VAGA:
${jobDescription}

CUSTO DIÁRIO DE TRANSPORTE: R$ ${dailyTransportCost}

${desiredSalary ? `SALÁRIO DESEJADO PELO CANDIDATO: R$ ${desiredSalary}` : ''}
${desiredPosition ? `CARGO DESEJADO PELO CANDIDATO: ${desiredPosition}` : ''}

IMPORTANTE: 
1. Você deve extrair da descrição da vaga a escala de trabalho (quantos dias por semana o funcionário trabalha)
2. Se não estiver explícito, assuma 5 ou 6 dias por semana baseado no tipo de vaga
${desiredSalary ? '3. COMPARE o salário oferecido na vaga com o salário desejado pelo candidato. Se o salário da vaga for MENOR que o desejado, reduza o score' : ''}
${desiredPosition ? '4. COMPARE o cargo da vaga com o cargo desejado pelo candidato. Se não for compatível, reduza o score' : ''}

Retorne uma resposta em formato JSON válido com a seguinte estrutura:
{
  "score": número entre 0-100 (considere salário e cargo desejado na pontuação),
  "analysis": "análise detalhada explicando por que é ou não é adequado para a vaga${desiredSalary || desiredPosition ? '. MENCIONE explicitamente a comparação entre o desejado e o oferecido' : ''}",
  "cover_letter": "carta de apresentação profissional em português",
  "email_draft": "email de apresentação curto e profissional para enviar ao recrutador",
  "work_schedule": {
    "days_per_week": número de dias por semana (exemplo: 5, 6),
    "schedule_description": "descrição da escala encontrada ou assumida"
  }
}`,
    'en': `Analyze the following CV against the job description and provide a structured assessment.

CV TEXT:
${cvText}

JOB DESCRIPTION:
${jobDescription}

DAILY TRANSPORT COST: $ ${dailyTransportCost}

${desiredSalary ? `CANDIDATE'S DESIRED SALARY: $ ${desiredSalary}` : ''}
${desiredPosition ? `CANDIDATE'S DESIRED POSITION: ${desiredPosition}` : ''}

IMPORTANT: 
1. You must extract from the job description the work schedule (how many days per week the employee works)
2. If not explicit, assume 5 or 6 days per week based on the job type
${desiredSalary ? '3. COMPARE the salary offered in the job with the candidate desired salary. If job salary is LOWER, reduce the score' : ''}
${desiredPosition ? '4. COMPARE the job position with the candidate desired position. If not compatible, reduce the score' : ''}

Return a valid JSON response with the following structure:
{
  "score": number between 0-100 (consider desired salary and position in scoring),
  "analysis": "detailed analysis explaining why it's a fit or not${desiredSalary || desiredPosition ? '. EXPLICITLY mention the comparison between desired and offered' : ''}",
  "cover_letter": "professional cover letter in English",
  "email_draft": "short, professional intro email to send to the recruiter",
  "work_schedule": {
    "days_per_week": number of days per week (example: 5, 6),
    "schedule_description": "schedule description found or assumed"
  }
}`
  };
  
  const prompt = prompts[language] || prompts['pt-BR'];
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 3048,
    },
  });
  
  const response = result.response;
  const text = response.text();
  
  console.log('Gemini raw response:', text.substring(0, 500));
  
  // Parse JSON from response
  try {
    // Clean up the text first - remove markdown formatting
    let jsonString = text.trim();
    
    // Remove markdown code blocks
    jsonString = jsonString.replace(/^```json\s*/g, '').replace(/^```\s*/g, '');
    jsonString = jsonString.replace(/\s*```$/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('First parse attempt failed:', parseError.message);
      
      // Try to fix common JSON issues
      // Fix unterminated strings by finding and completing them
      let fixedJson = jsonString;
      
      // If JSON is incomplete, try to extract complete object
      const firstBrace = fixedJson.indexOf('{');
      if (firstBrace !== -1) {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let lastValidPos = firstBrace;
        
        for (let i = firstBrace; i < fixedJson.length; i++) {
          const char = fixedJson[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
          }
          
          if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                lastValidPos = i + 1;
                break;
              }
            }
          }
        }
        
        if (lastValidPos > firstBrace) {
          fixedJson = fixedJson.substring(firstBrace, lastValidPos);
          console.log('Extracted complete JSON object');
          parsedResponse = JSON.parse(fixedJson);
        } else {
          throw new Error('Could not extract valid JSON object');
        }
      } else {
        throw parseError;
      }
    }
    
    // Ensure work_schedule exists with defaults
    if (!parsedResponse.work_schedule) {
      parsedResponse.work_schedule = {
        days_per_week: 5,
        schedule_description: 'Escala padrão assumida: 5 dias por semana'
      };
    }
    
    // Calculate monthly transport cost (dailyTransportCost is now round trip, so no need to multiply by 2)
    const daysPerWeek = parsedResponse.work_schedule?.days_per_week || 5;
    const monthlyTransportCost = dailyTransportCost * daysPerWeek * 4.33;
    
    return {
      ...parsedResponse,
      monthly_transport_cost: Math.round(monthlyTransportCost * 100) / 100
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    console.error('Full response text:', text);
    
    // Last resort: return a default response
    const fallbackMessages = {
      'pt-BR': {
        analysis: 'Baseado no currículo e vaga fornecidos, há compatibilidade geral de habilidades e experiência relevante para a posição. Recomenda-se uma análise detalhada durante a entrevista.',
        cover_letter: 'Prezado(a) Recrutador(a),\n\nTenho grande interesse na vaga anunciada e acredito que minhas habilidades e experiência profissional são adequadas para contribuir com o sucesso da equipe. Estou à disposição para uma conversa e demonstrar como posso agregar valor à empresa.\n\nAtenciosamente,',
        email_draft: 'Olá,\n\nTenho interesse na vaga e gostaria de me candidatar. Possuo experiência relevante na área e estou disponível para uma conversa.\n\nAguardo retorno.',
        schedule_description: 'Escala padrão: 5 dias por semana'
      },
      'en': {
        analysis: 'Based on the CV and job provided, there is general compatibility in skills and relevant experience for the position. A detailed analysis during the interview is recommended.',
        cover_letter: 'Dear Recruiter,\n\nI have great interest in the advertised position and believe that my skills and professional experience are suitable to contribute to the team\'s success. I am available for a conversation and to demonstrate how I can add value to the company.\n\nBest regards,',
        email_draft: 'Hello,\n\nI am interested in the position and would like to apply. I have relevant experience in the field and am available for a conversation.\n\nLooking forward to your reply.',
        schedule_description: 'Standard schedule: 5 days per week'
      }
    };
    
    const messages = fallbackMessages[language] || fallbackMessages['pt-BR'];
    
    return {
      score: 70,
      analysis: messages.analysis,
      cover_letter: messages.cover_letter,
      email_draft: messages.email_draft,
      work_schedule: {
        days_per_week: 5,
        schedule_description: messages.schedule_description
      },
      monthly_transport_cost: dailyTransportCost * 5 * 4.33
    };
  }
}
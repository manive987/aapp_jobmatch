import axios from 'axios';
import { getGeminiModel } from './gemini';

// Regex patterns para extração
const patterns = {
  salary: [
    /R\$\s*[\d.,]+(?:\s*(?:a|até)\s*R\$\s*[\d.,]+)?/gi,
    /salário:\s*R?\$?\s*[\d.,]+/gi,
    /remuneração:\s*R?\$?\s*[\d.,]+/gi,
    /[\d.,]+\s*(?:reais|BRL)/gi,
  ],
  location: [
    /(?:localização|local|cidade|endereço):\s*([^,\n]+)/gi,
    /([A-ZÀÁÂÃÉÊÍÓÔÕÚÇ][a-zàáâãéêíóôõúç]+(?:\s+[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ][a-zàáâãéêíóôõúç]+)*)\s*[-–]\s*[A-Z]{2}/g,
    /(?:em|in)\s+([A-ZÀÁÂÃÉÊÍÓÔÕÚÇ][a-zàáâãéêíóôõúç]+(?:\s+[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ][a-zàáâãéêíóôõúç]+)*)\s*[-–,]/g,
  ],
  workSchedule: [
    /\d+\s*[xX×]\s*\d+/g,
    /(?:escala|jornada):\s*(\d+\s*[xX×]\s*\d+)/gi,
    /(?:de|das)\s+(?:segunda|seg)\s+(?:a|até)\s+(?:sexta|sex)/gi,
    /segunda\s*(?:a|à)\s*(?:sexta|sábado|domingo)/gi,
  ],
  benefits: [
    /vale\s+(?:refeição|alimentação|transporte|cultura)/gi,
    /plano\s+(?:de\s+)?(?:saúde|odontológico|dental)/gi,
    /seguro\s+de\s+vida/gi,
    /gympass|academia/gi,
    /auxílio\s+(?:creche|educação|home\s*office)/gi,
    /participação\s+nos\s+lucros|PLR/gi,
  ]
};

// Extract using Perplexity API
export async function extractWithPerplexity(url, jobDescription) {
  try {
    const prompt = `Analyze this job posting and extract structured information:

URL: ${url}
Content: ${jobDescription.substring(0, 2000)}

Extract and return ONLY a JSON object with:
{
  "jobLocation": "city, state",
  "grossSalary": number (monthly salary in local currency, just the number),
  "workSchedule": "format like 6x1, 5x2, etc",
  "benefits": [{"name": "benefit name", "value": estimated_monthly_value_number}]
}

If any field cannot be determined, use null. Return ONLY the JSON, no explanations.`;

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a precise data extraction assistant. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Perplexity extraction error:', error.message);
    return null;
  }
}

// Extract using Gemini AI
export async function extractWithGemini(jobDescription) {
  try {
    const model = await getGeminiModel();
    
    const prompt = `Analyze this job posting and extract structured information. Return ONLY a valid JSON object.

Job Description:
${jobDescription.substring(0, 3000)}

Extract:
{
  "jobLocation": "city, state or country",
  "grossSalary": number (monthly salary, just the number without currency symbol),
  "workSchedule": "format like 6x1, 5x2, etc. If mentions 'segunda a sexta' use '5x2', 'segunda a sábado' use '6x1'",
  "benefits": [
    {"name": "benefit name", "value": estimated_monthly_value_as_number}
  ]
}

If any field is not found, use null. Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        topK: 20,
        maxOutputTokens: 1024,
      },
    });

    const text = result.response.text();
    
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let jsonString = jsonMatch[0];
      
      // Clean up common issues
      jsonString = jsonString
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      return JSON.parse(jsonString);
    }
    
    return null;
  } catch (error) {
    console.error('Gemini extraction error:', error.message);
    return null;
  }
}

// Extract using Regex patterns
export function extractWithRegex(text) {
  const extracted = {
    jobLocation: null,
    grossSalary: null,
    workSchedule: null,
    benefits: []
  };

  // Extract salary
  for (const pattern of patterns.salary) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Get first match and extract number
      const salaryText = matches[0];
      const numbers = salaryText.match(/[\d.,]+/g);
      if (numbers && numbers.length > 0) {
        // Convert to number (handle Brazilian format)
        const cleanNumber = numbers[0].replace(/\./g, '').replace(',', '.');
        extracted.grossSalary = parseFloat(cleanNumber);
        break;
      }
    }
  }

  // Extract location
  for (const pattern of patterns.location) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      extracted.jobLocation = matches[0].replace(/^(localização|local|cidade|endereço|em|in):\s*/i, '').trim();
      break;
    }
  }

  // Extract work schedule
  for (const pattern of patterns.workSchedule) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const schedule = matches[0];
      if (/\d+\s*[xX×]\s*\d+/.test(schedule)) {
        extracted.workSchedule = schedule.replace(/\s+/g, '').toLowerCase();
        break;
      } else if (/segunda\s*(?:a|à)\s*sexta/i.test(schedule)) {
        extracted.workSchedule = '5x2';
        break;
      } else if (/segunda\s*(?:a|à)\s*sábado/i.test(schedule)) {
        extracted.workSchedule = '6x1';
        break;
      }
    }
  }

  // Extract benefits
  const benefitSet = new Set();
  for (const pattern of patterns.benefits) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const benefitName = match.trim();
        if (!benefitSet.has(benefitName.toLowerCase())) {
          benefitSet.add(benefitName.toLowerCase());
          
          // Estimate values for common benefits (Brazil context)
          let estimatedValue = 0;
          const lowerBenefit = benefitName.toLowerCase();
          
          if (lowerBenefit.includes('refeição') || lowerBenefit.includes('alimentação')) {
            estimatedValue = 500;
          } else if (lowerBenefit.includes('transporte')) {
            estimatedValue = 200;
          } else if (lowerBenefit.includes('saúde')) {
            estimatedValue = 300;
          } else if (lowerBenefit.includes('odonto') || lowerBenefit.includes('dental')) {
            estimatedValue = 100;
          } else if (lowerBenefit.includes('seguro')) {
            estimatedValue = 50;
          } else if (lowerBenefit.includes('gympass') || lowerBenefit.includes('academia')) {
            estimatedValue = 80;
          } else if (lowerBenefit.includes('auxílio')) {
            estimatedValue = 200;
          }
          
          extracted.benefits.push({
            name: benefitName,
            value: estimatedValue
          });
        }
      });
    }
  }

  return extracted;
}

// Main extraction function - tries multiple methods
export async function extractJobDetails(url, htmlContent, jobDescription) {
  console.log('Starting intelligent job extraction...');
  
  // Method 1: Regex extraction (fast, basic)
  const regexData = extractWithRegex(htmlContent + ' ' + jobDescription);
  console.log('Regex extracted:', regexData);

  // Method 2: Gemini extraction (intelligent, reliable)
  let geminiData = null;
  try {
    geminiData = await extractWithGemini(jobDescription);
    console.log('Gemini extracted:', geminiData);
  } catch (error) {
    console.error('Gemini extraction failed:', error);
  }

  // Method 3: Perplexity extraction (online, can search for additional context)
  let perplexityData = null;
  try {
    perplexityData = await extractWithPerplexity(url, jobDescription);
    console.log('Perplexity extracted:', perplexityData);
  } catch (error) {
    console.error('Perplexity extraction failed:', error);
  }

  // Merge results with priority: Perplexity > Gemini > Regex
  const merged = {
    jobLocation: perplexityData?.jobLocation || geminiData?.jobLocation || regexData.jobLocation || '',
    grossSalary: perplexityData?.grossSalary || geminiData?.grossSalary || regexData.grossSalary || '',
    workSchedule: perplexityData?.workSchedule || geminiData?.workSchedule || regexData.workSchedule || '',
    benefits: []
  };

  // Merge benefits from all sources
  const benefitsMap = new Map();
  
  [...(regexData.benefits || []), ...(geminiData?.benefits || []), ...(perplexityData?.benefits || [])]
    .forEach(benefit => {
      if (benefit.name) {
        const key = benefit.name.toLowerCase().trim();
        if (!benefitsMap.has(key) || benefit.value > (benefitsMap.get(key)?.value || 0)) {
          benefitsMap.set(key, benefit);
        }
      }
    });
  
  merged.benefits = Array.from(benefitsMap.values());
  
  // Ensure at least one empty benefit if none found
  if (merged.benefits.length === 0) {
    merged.benefits = [{ name: '', value: '' }];
  }

  console.log('Final merged data:', merged);
  return merged;
}

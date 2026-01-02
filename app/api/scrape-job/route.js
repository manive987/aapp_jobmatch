import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { extractJobDetails } from '@/lib/jobExtractor';

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch job page');
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove unwanted elements first
    $('script, style, nav, header, footer, .menu, .navbar, .sidebar, .advertisement, .ads').remove();
    
    let jobDescription = '';
    
    // Try to extract job description from common selectors
    const selectors = [
      '.job-description',
      '#job-description', 
      '[class*="job-description"]',
      '[class*="JobDescription"]',
      '[class*="description"]',
      '[id*="description"]',
      '.vacancy-description',
      '.vaga-descricao',
      'article',
      '.content',
      'main',
      '.job-details',
      '.vacancy-details',
      '[class*="details"]',
      '[class*="vacancy"]',
      '[class*="job"]',
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        let text = element.text().trim();
        // Remove excessive whitespace
        text = text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n');
        if (text.length > 150) {
          jobDescription = text;
          break;
        }
      }
    }
    
    // If no description found with selectors, try meta tags
    if (!jobDescription || jobDescription.length < 100) {
      const metaDescription = $('meta[name="description"]').attr('content') ||
                             $('meta[property="og:description"]').attr('content');
      if (metaDescription && metaDescription.length > 100) {
        jobDescription = metaDescription;
      }
    }
    
    // Last resort: get body text
    if (!jobDescription || jobDescription.length < 100) {
      const bodyText = $('body').text()
        .replace(/\s+/g, ' ')
        .trim();
      
      if (bodyText.length > 100) {
        jobDescription = bodyText;
      }
    }
    
    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract job description from this URL. The page might be protected or require authentication. Please paste the description manually.' },
        { status: 400 }
      );
    }
    
    // Clean up the text
    jobDescription = jobDescription
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    // Limit to reasonable size (first 8000 chars for better context)
    if (jobDescription.length > 8000) {
      jobDescription = jobDescription.substring(0, 8000) + '...';
    }
    
    // INTELLIGENT EXTRACTION using Regex, Gemini, and Perplexity
    let extractedData = {
      jobLocation: '',
      grossSalary: '',
      workSchedule: '',
      benefits: [{ name: '', value: '' }]
    };
    
    try {
      console.log('Starting intelligent extraction...');
      extractedData = await extractJobDetails(url, html, jobDescription);
      console.log('Extraction completed:', extractedData);
    } catch (extractError) {
      console.error('Extraction error:', extractError);
      // Continue with default empty values
    }
    
    return NextResponse.json({
      jobDescription,
      ...extractedData,
      success: true
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details. The page might be protected or unavailable. Please paste the description manually.' },
      { status: 500 }
    );
  }
}
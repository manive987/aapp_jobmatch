const pdfParse = require('pdf-parse');
import { getGeminiModel } from './gemini';
import sharp from 'sharp';

export async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
  }
}

export async function extractTextFromImage(buffer, fileType) {
  try {
    // Convert image to base64
    let processedBuffer = buffer;
    let mimeType = fileType;
    
    // Convert to JPEG if needed for better compatibility
    if (fileType.includes('webp') || fileType.includes('heic')) {
      processedBuffer = await sharp(buffer)
        .jpeg({ quality: 90 })
        .toBuffer();
      mimeType = 'image/jpeg';
    }
    
    const base64Image = processedBuffer.toString('base64');
    
    // Use Gemini Vision to extract text from image
    const model = await getGeminiModel();
    
    const prompt = `Extract all text from this image of a CV/Resume. 
Return ONLY the extracted text, preserving the structure and formatting as much as possible.
Do not add any comments or explanations, just the raw text from the image.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      },
      prompt
    ]);

    const response = result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image. Please ensure the file is a valid image.');
  }
}

export async function extractTextFromFile(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Check if it's an image
  if (fileType.includes('image') || 
      fileName.endsWith('.jpg') || 
      fileName.endsWith('.jpeg') || 
      fileName.endsWith('.png') || 
      fileName.endsWith('.webp') ||
      fileName.endsWith('.heic')) {
    return await extractTextFromImage(buffer, fileType);
  }
  
  // Check if it's a PDF
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(buffer);
  }
  
  // Check if it's a text file
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }
  
  throw new Error('Unsupported file type. Please upload PDF, TXT, JPG, PNG, or WEBP files.');
}

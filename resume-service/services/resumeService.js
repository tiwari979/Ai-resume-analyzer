const pdfParse = require('pdf-parse');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:3003';

// In-memory store (replace with MongoDB in production)
const resumeStore = new Map();

const processResume = async ({ filename, buffer }) => {
  console.log(`[resume-service] Parsing PDF: ${filename}`);

  // Step 1: Extract text from PDF
  let extractedText = '';
  try {
    const pdfData = await pdfParse(buffer);
    extractedText = pdfData.text;
  } catch (parseErr) {
    console.error('[resume-service] PDF parsing failed:', parseErr.message);
    throw new Error('Failed to parse PDF. Please ensure it is a valid, text-based PDF.');
  }

  if (!extractedText.trim()) {
    throw new Error('Could not extract text from PDF. It may be image-based (scanned). Please use a text-based PDF.');
  }

  console.log(`[resume-service] Extracted ${extractedText.length} characters. Calling ai-service...`);

  // Step 2: Send extracted text to AI service for analysis
  let analysisResult;
  try {
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/analyze`,
      { text: extractedText, filename },
      { timeout: 30000 }
    );
    analysisResult = aiResponse.data.analysis;
  } catch (aiErr) {
    console.error('[resume-service] AI service call failed:', aiErr.message);
    throw new Error('AI analysis service is unavailable. Please try again later.');
  }

  // Step 3: Store and return result
  const resume = {
    id: uuidv4(),
    filename,
    uploadedAt: new Date().toISOString(),
    textLength: extractedText.length,
    analysis: analysisResult,
  };

  resumeStore.set(resume.id, resume);

  return resume;
};

const getResumeById = async (id) => {
  return resumeStore.get(id) || null;
};

const getAllResumes = async () => {
  return Array.from(resumeStore.values()).sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
};

module.exports = { processResume, getResumeById, getAllResumes };

/**
 * AI Analysis Service
 * 
 * PRIMARY:  Uses Anthropic Claude API for deep, unique per-resume analysis
 * FALLBACK: Rule-based NLP if no API key is set (still useful for demos)
 * 
 * Set ANTHROPIC_API_KEY in your .env or docker-compose environment to enable
 * real AI analysis. Every resume gets a completely unique, intelligent response.
 */

const axios = require('axios');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-haiku-20241022'; // Fast + cheap, perfect for this use case

// ============================================================
// CLAUDE API ANALYSIS (Primary - requires API key)
// ============================================================

const analyzeWithClaude = async (text, filename) => {
  const prompt = `You are an expert technical recruiter and career coach with 15+ years of experience reviewing resumes for top tech companies like Google, Amazon, and Microsoft.

Analyze the following resume text and provide a detailed, personalized assessment. Be specific — reference actual content from the resume, not generic advice.

RESUME TEXT:
"""
${text.slice(0, 12000)}
"""

Respond ONLY with a valid JSON object (no markdown, no explanation outside JSON) in exactly this structure:

{
  "score": <number 0-100, be precise and honest>,
  "experienceLevel": "<one of: Fresher, Junior, Mid Level, Senior, Lead/Principal>",
  "yearsOfExperience": <number or null if not mentioned>,
  "skills": {
    "languages": ["<only skills actually mentioned in resume>"],
    "frontend": ["<only skills actually mentioned>"],
    "backend": ["<only skills actually mentioned>"],
    "databases": ["<only skills actually mentioned>"],
    "devops": ["<only skills actually mentioned>"],
    "ml_ai": ["<only skills actually mentioned>"],
    "tools": ["<only skills actually mentioned>"]
  },
  "topSkills": ["<top 8 most impressive/relevant skills from this specific resume>"],
  "detectedSections": ["<sections actually present: education, experience, projects, skills, certifications, contact, summary, achievements>"],
  "strengths": [
    "<specific strength 1 based on actual resume content>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "suggestions": [
    "<specific, actionable improvement based on what IS and ISN'T in this resume>",
    "<another specific suggestion>",
    "<another>",
    "<another>"
  ],
  "atsScore": <number 0-100, how well this resume would pass ATS systems>,
  "summary": "<3-4 sentence personalized summary mentioning specific things from their resume — their actual role/field, key skills they have, their level, and top 2 suggestions. Do NOT be generic.>",
  "careerInsight": "<1-2 sentences about what kind of roles this person is best suited for based on their actual skill set>",
  "missingSkills": ["<important skills missing for their apparent career path>"],
  "scoreBreakdown": {
    "skillsScore": <0-40>,
    "experienceScore": <0-30>,
    "formattingScore": <0-15>,
    "atsScore": <0-15>
  }
}

Rules:
- Only list skills that are ACTUALLY present in the resume text
- Suggestions must be SPECIFIC to this resume, not generic advice
- Score honestly — a weak resume should score 20-40, a strong one 75-90
- The summary MUST mention specific things from their actual resume`;

  const response = await axios.post(
    ANTHROPIC_API_URL,
    {
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const rawText = response.data.content[0].text.trim();

  // Strip markdown code fences if present
  const jsonStr = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error('[ai-service] Failed to parse Claude response:', jsonStr.slice(0, 300));
    throw new Error('Claude returned malformed JSON');
  }

  // Normalize — ensure all expected fields exist
  return {
    filename,
    analysisTimestamp: new Date().toISOString(),
    engine: 'claude-ai',
    model: MODEL,
    score: Math.min(100, Math.max(0, parsed.score || 50)),
    experienceLevel: parsed.experienceLevel || 'Unknown',
    yearsOfExperience: parsed.yearsOfExperience || null,
    skills: parsed.skills || {},
    topSkills: (parsed.topSkills || []).slice(0, 10),
    totalSkillsDetected: Object.values(parsed.skills || {}).flat().length,
    detectedSections: parsed.detectedSections || [],
    strengths: parsed.strengths || [],
    suggestions: parsed.suggestions || [],
    missingSkills: parsed.missingSkills || [],
    atsScore: parsed.atsScore || null,
    careerInsight: parsed.careerInsight || '',
    scoreBreakdown: parsed.scoreBreakdown || null,
    summary: parsed.summary || 'Analysis complete.',
  };
};

// ============================================================
// RULE-BASED FALLBACK (when no API key)
// ============================================================

const SKILL_KEYWORDS = {
  languages: ['javascript','typescript','python','java','c++','c#','go','rust','ruby','php','swift','kotlin','scala','r','matlab','bash','shell'],
  frontend:  ['react','angular','vue','next.js','nuxt','svelte','html','css','sass','tailwind','bootstrap','webpack','vite','redux','graphql'],
  backend:   ['node.js','express','django','flask','fastapi','spring','laravel','rails','asp.net','nestjs','koa','rest api','microservices'],
  databases: ['mysql','postgresql','mongodb','redis','sqlite','oracle','cassandra','dynamodb','elasticsearch','firebase','supabase'],
  devops:    ['docker','kubernetes','aws','azure','gcp','jenkins','github actions','gitlab ci','terraform','ansible','nginx','linux','ci/cd','helm'],
  ml_ai:     ['machine learning','deep learning','tensorflow','pytorch','scikit-learn','nlp','computer vision','pandas','numpy','keras','llm'],
  tools:     ['git','jira','postman','figma','agile','scrum','vs code','linux','bash'],
};

const SECTION_PATTERNS = {
  education: /education|university|college|degree|bachelor|master|phd|b\.tech|m\.tech/i,
  experience: /experience|work history|employment|career/i,
  projects: /projects?|portfolio/i,
  certifications: /certif|license/i,
  contact: /contact|email|phone|linkedin|github/i,
  skills: /skills|technologies|tech stack/i,
  summary: /summary|objective|profile|about/i,
  achievements: /achievement|award|honor|recognition/i,
};

const analyzeWithRules = (text, filename) => {
  const lower = text.toLowerCase();

  const skills = {};
  for (const [cat, kws] of Object.entries(SKILL_KEYWORDS)) {
    const found = kws.filter(k => lower.includes(k));
    if (found.length) skills[cat] = found;
  }

  const detectedSections = Object.entries(SECTION_PATTERNS)
    .filter(([, p]) => p.test(text)).map(([s]) => s);

  const allSkills = Object.values(skills).flat();
  const totalSkills = allSkills.length;

  let score = 0;
  score += Math.min(totalSkills * 3, 40);
  score += detectedSections.length * 5;
  if (text.length > 500) score += 10;
  if (text.length > 1000) score += 10;
  score = Math.min(score, 100);

  const expMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s+)?experience/i);
  const yearsOfExperience = expMatch ? parseInt(expMatch[1]) : null;

  let experienceLevel = 'Fresher';
  if (yearsOfExperience >= 8) experienceLevel = 'Senior';
  else if (yearsOfExperience >= 3) experienceLevel = 'Mid Level';
  else if (yearsOfExperience >= 1) experienceLevel = 'Junior';

  const suggestions = [];
  if (!detectedSections.includes('contact')) suggestions.push('Add clear contact information (email, LinkedIn, GitHub).');
  if (!detectedSections.includes('projects')) suggestions.push('Add a Projects section with descriptions and technologies used.');
  if (!detectedSections.includes('certifications')) suggestions.push('Consider adding relevant certifications.');
  if (!skills.devops) suggestions.push('Adding DevOps skills (Docker, Kubernetes, CI/CD) can boost your profile.');
  if (score < 40) suggestions.push('Expand your resume with more technical skills and detailed descriptions.');
  if (score >= 70) suggestions.push('Quantify your achievements with numbers and metrics for more impact.');

  return {
    filename,
    analysisTimestamp: new Date().toISOString(),
    engine: 'rule-based',
    model: 'keyword-matching',
    score,
    experienceLevel,
    yearsOfExperience,
    skills,
    topSkills: allSkills.slice(0, 10),
    totalSkillsDetected: totalSkills,
    detectedSections,
    strengths: totalSkills > 10 ? ['Strong technical skill set detected'] : [],
    suggestions,
    missingSkills: [],
    atsScore: null,
    careerInsight: '',
    scoreBreakdown: null,
    summary: `This resume scored ${score}/100 using rule-based analysis. ${totalSkills} skills detected across ${Object.keys(skills).length} categories. Add an ANTHROPIC_API_KEY for deep AI-powered analysis.`,
  };
};

// ============================================================
// MAIN EXPORT — auto-selects engine
// ============================================================

const analyzeResumeText = async (text, filename = 'resume.pdf') => {
  if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    console.log(`[ai-service] Using Claude AI (${MODEL}) for analysis`);
    try {
      return await analyzeWithClaude(text, filename);
    } catch (err) {
      console.error(`[ai-service] Claude API failed: ${err.message}. Falling back to rule-based.`);
      return analyzeWithRules(text, filename);
    }
  } else {
    console.log('[ai-service] No ANTHROPIC_API_KEY set — using rule-based fallback');
    return analyzeWithRules(text, filename);
  }
};

module.exports = { analyzeResumeText };

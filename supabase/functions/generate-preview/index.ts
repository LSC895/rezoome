import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per minute per IP

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

// Retry logic for Gemini API with exponential backoff
async function callGeminiWithRetry(url: string, body: any, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) return response;
      
      if (response.status === 429 && i < maxRetries) {
        const waitTime = 1000 * (2 ** i);
        console.log(`Rate limited (429), retrying in ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      
      if (response.status >= 500 && i < maxRetries) {
        console.log(`Server error ${response.status}, retrying...`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries) throw error;
      console.log(`Network error, retrying...`, error);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

// Extract keywords from job description
function extractKeywords(text: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your', 'i', 'me', 'my', 'he', 'she', 'him', 'her', 'who', 'which', 'what', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'about', 'after', 'before', 'between', 'into', 'through', 'during', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'any', 'well', 'work', 'working', 'experience', 'years', 'year', 'team', 'ability', 'strong', 'looking', 'seeking', 'role', 'position', 'including', 'etc', 'including']);
  
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s\-\/\+\#\.]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
  // Also extract multi-word phrases
  const phrases: string[] = [];
  const phrasePatterns = [
    /\b(machine learning|deep learning|data science|data engineering|software engineer|full stack|front end|back end|devops|cloud computing|project management|product management|business analysis|data analysis|web development|mobile development|api development|database management|system design|agile methodology|scrum master|ci\/cd|version control|unit testing|integration testing)\b/gi,
    /\b(react\.?js?|node\.?js?|vue\.?js?|angular\.?js?|next\.?js?|express\.?js?|spring boot|ruby on rails|django|flask|asp\.net|\.net core)\b/gi,
    /\b(aws|azure|gcp|google cloud|amazon web services|microsoft azure)\b/gi,
    /\b(python|javascript|typescript|java|c\+\+|c#|ruby|go|rust|kotlin|swift|php|scala)\b/gi,
    /\b(sql|nosql|mongodb|postgresql|mysql|redis|elasticsearch|dynamodb|cassandra)\b/gi,
    /\b(docker|kubernetes|terraform|jenkins|github actions|gitlab ci|ansible|puppet|chef)\b/gi,
  ];
  
  phrasePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      phrases.push(...matches.map(m => m.toLowerCase()));
    }
  });
  
  return [...new Set([...words, ...phrases])];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please wait a moment before trying again.',
          retry_after: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000))
          },
          status: 429 
        }
      );
    }
    
    console.log(`Request from IP: ${clientIP}, remaining: ${rateLimit.remaining}`);

    const { master_cv_data, job_description, template = 'modern', include_cover_letter = false } = await req.json();

    if (!job_description || !master_cv_data) {
      throw new Error('Missing required fields: job_description and master_cv_data');
    }

    console.log('Generating preview with template:', template);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Extract JD keywords for analysis
    const jdKeywords = extractKeywords(job_description);
    console.log('Extracted JD keywords:', jdKeywords.length);

    // Build structured context from master CV data
    const structuredContext = {
      contact: {
        name: master_cv_data.full_name,
        email: master_cv_data.email,
        phone: master_cv_data.phone,
        location: master_cv_data.location,
        linkedin: master_cv_data.linkedin_url,
        github: master_cv_data.github_url,
        portfolio: master_cv_data.portfolio_url
      },
      summary: master_cv_data.professional_summary,
      experience: master_cv_data.work_experience,
      skills: master_cv_data.technical_skills,
      education: master_cv_data.education,
      projects: master_cv_data.projects,
      certifications: master_cv_data.certifications,
      achievements: master_cv_data.achievements
    };

    // STRICT ATS-OPTIMIZED RESUME PROMPT
    const systemPrompt = `You are an expert ATS resume writer specializing in resumes for FRESHERS and ACTIVE JOB SEEKERS.

Your job: Create a job-tailored, ATS-optimized, ready-to-upload resume.

=== STRICT OUTPUT FORMAT (DO NOT DEVIATE) ===

${master_cv_data.full_name || 'CANDIDATE NAME'}
${master_cv_data.email || ''} | ${master_cv_data.phone || ''} | ${master_cv_data.location || ''}
${master_cv_data.linkedin_url ? master_cv_data.linkedin_url : ''}

SUMMARY
• 2-3 lines describing strengths, domain knowledge, and career intent aligned with this job.

KEY SKILLS
• Skill A | Skill B | Skill C | Skill D | Skill E | Skill F
(List 8-12 skills that DIRECTLY match the job requirements, separated by | )

EXPERIENCE
[Job Title] — [Company Name] | [Start Date] - [End Date]
• Action verb → task → measurable result
• Action verb → responsibility → quantified improvement
• Action verb → tool used → specific outcome
• JD keywords inserted naturally

(Repeat for each relevant position, max 3-4 positions)

PROJECTS
[Project Name]
• One-line explanation of what it does
• Technologies/Tools used: [list]
• Result/Impact: [measurable outcome if available]

(Include 2-3 projects, REQUIRED for freshers)

EDUCATION
[Degree Name], [Institution Name], [Year]
• Relevant coursework or achievements if applicable

CERTIFICATIONS (if any)
• Certification Name - Issuing Organization

=== CRITICAL RULES ===

1. FORMAT:
   - ATS-safe text ONLY: NO tables, NO icons, NO graphics, NO columns
   - Single column layout
   - Clear section headers in ALL CAPS
   - One empty line between sections
   - Consistent bullet points using •

2. BULLET POINTS (Action → Impact → Result):
   - Start EVERY bullet with STRONG action verb: Led, Engineered, Optimized, Delivered, Built, Developed, Implemented, Designed, Created, Launched
   - QUANTIFY when possible: percentages, numbers, dollar amounts, time saved
   
   GOOD EXAMPLES:
   • Developed REST API handling 10,000+ daily requests with 99.9% uptime
   • Reduced page load time by 40% through code optimization and caching
   • Led team of 5 developers to deliver e-commerce platform 2 weeks ahead of schedule
   
   BAD EXAMPLES (NEVER USE):
   • Responsible for coding
   • Helped with projects
   • Worked on various tasks

3. KEYWORD OPTIMIZATION:
   - Extract 15-20 keywords from the job description
   - Naturally integrate them in Summary, Skills, and Experience
   - Use exact phrases from JD when applicable

4. TAILORING:
   - Prioritize experiences most relevant to THIS job
   - Reorder bullets to highlight job-relevant achievements first
   - Do NOT invent fake experience or skills
   - Only include skills the candidate actually has

5. LENGTH:
   - 1 page for freshers or <5 years experience
   - Keep it concise and impactful

=== JOB DESCRIPTION ===
${job_description}

=== CANDIDATE DATA ===
${JSON.stringify(structuredContext, null, 2)}

Generate the resume NOW. Output ONLY the resume text following the exact format above:`;

    console.log('Calling Gemini API for resume...');
    const startTime = Date.now();

    const geminiResponse = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 3000,
        }
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      if (geminiResponse.status === 429) {
        throw new Error('Rate limits exceeded, please try again in a few seconds.');
      }
      throw new Error(`AI service temporarily unavailable. Please try again.`);
    }

    const geminiData = await geminiResponse.json();
    const generatedResume = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedResume) {
      throw new Error('Failed to generate resume. Please try again.');
    }

    const resumeGenTime = Date.now() - startTime;
    console.log(`Resume generated in ${resumeGenTime}ms, length: ${generatedResume.length}`);

    // Generate cover letter if requested
    let coverLetter = null;
    if (include_cover_letter) {
      console.log('Generating cover letter...');
      
      const coverLetterPrompt = `Generate a professional, compelling cover letter for this job application.

CANDIDATE: ${master_cv_data.full_name}
EMAIL: ${master_cv_data.email}
PHONE: ${master_cv_data.phone}

JOB DESCRIPTION:
${job_description}

CANDIDATE BACKGROUND:
Summary: ${master_cv_data.professional_summary}
Key Skills: ${JSON.stringify(master_cv_data.technical_skills)}
Recent Experience: ${JSON.stringify(master_cv_data.work_experience?.slice(0, 2) || [])}

=== COVER LETTER REQUIREMENTS ===
1. Professional format with date
2. 3-4 paragraphs:
   - Opening: Hook with enthusiasm for the role + 1 key qualification
   - Body (1-2 paragraphs): 2-3 specific achievements that match job requirements
   - Closing: Call to action + availability
3. Match keywords from job description
4. Show genuine interest in the company/role
5. Keep it under 400 words
6. Professional but personable tone

Output ONLY the cover letter text:`;

      const coverLetterResponse = await callGeminiWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: coverLetterPrompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1500,
          }
        }
      );

      if (coverLetterResponse.ok) {
        const coverLetterData = await coverLetterResponse.json();
        coverLetter = coverLetterData.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Cover letter generated');
      }
    }

    // Calculate ATS analysis with matched/missing skills
    const resumeTextLower = generatedResume.toLowerCase();
    const cvSkills: string[] = [];
    
    // Extract skills from CV data
    if (master_cv_data.technical_skills) {
      if (Array.isArray(master_cv_data.technical_skills)) {
        cvSkills.push(...master_cv_data.technical_skills.map((s: string) => s.toLowerCase()));
      } else if (typeof master_cv_data.technical_skills === 'object') {
        Object.values(master_cv_data.technical_skills).forEach((category: any) => {
          if (Array.isArray(category)) {
            cvSkills.push(...category.map((s: string) => s.toLowerCase()));
          }
        });
      }
    }

    // Analyze keyword matching
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    jdKeywords.forEach(keyword => {
      const isInResume = resumeTextLower.includes(keyword.toLowerCase());
      const isSkill = keyword.length > 2 && /^[a-z\+\#\.\-\/]+$/i.test(keyword);
      
      if (isInResume) {
        if (isSkill && keyword.length > 3) {
          matchedSkills.push(keyword);
        }
        matchedKeywords.push(keyword);
      } else {
        if (isSkill && keyword.length > 3) {
          missingSkills.push(keyword);
        }
        missingKeywords.push(keyword);
      }
    });

    // Calculate match score
    const totalRelevantKeywords = matchedKeywords.length + missingKeywords.length;
    const matchPercentage = totalRelevantKeywords > 0 
      ? Math.round((matchedKeywords.length / totalRelevantKeywords) * 100)
      : 75;
    
    const atsScore = Math.min(98, Math.max(65, matchPercentage));

    // Build ATS analysis response
    const atsAnalysis = {
      match_score: `${atsScore}%`,
      matched_skills: [...new Set(matchedSkills)].slice(0, 15),
      missing_skills: [...new Set(missingSkills)].slice(0, 10),
      missing_keywords: [...new Set(missingKeywords)].slice(0, 8),
      reasoning: atsScore >= 85 
        ? "Excellent match! Your resume aligns well with the job requirements."
        : atsScore >= 70 
        ? "Good match. Consider adding missing skills if you have experience with them."
        : "Moderate match. Focus on highlighting more relevant experience."
    };

    const totalTime = Date.now() - startTime;
    console.log(`Total generation time: ${totalTime}ms`);

    return new Response(
      JSON.stringify({
        resume: {
          content: generatedResume,
          cover_letter: coverLetter,
          ats_score: atsScore,
          template: template,
          ats_analysis: atsAnalysis
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-preview:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate resume. Please try again.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

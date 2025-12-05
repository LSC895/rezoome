import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
        console.log(`Rate limited (429), retrying in ${waitTime}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      
      if (response.status >= 500 && i < maxRetries) {
        console.log(`Server error ${response.status}, retrying... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries) throw error;
      console.log(`Network error, retrying... (attempt ${i + 1}/${maxRetries}):`, error);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

// Extract keywords from job description
function extractKeywords(text: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your', 'i', 'me', 'my', 'he', 'she', 'him', 'her', 'who', 'which', 'what', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'about', 'after', 'before', 'between', 'into', 'through', 'during', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'any', 'well', 'work', 'working', 'experience', 'years', 'year', 'team', 'ability', 'strong', 'looking', 'seeking', 'role', 'position', 'including', 'etc']);
  
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s\-\/\+\#\.]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
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
    const { job_description, template = 'modern', include_cover_letter = false } = await req.json();

    if (!job_description) {
      throw new Error('Missing required field: job_description');
    }

    console.log('Generating content with template:', template);
    console.log('Include cover letter:', include_cover_letter);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Fetch structured master CV data from database
    const { data: masterCVData, error: cvError } = await supabaseClient
      .from('master_cv_data')
      .select('*')
      .single();

    if (cvError || !masterCVData) {
      console.error('Failed to fetch master CV data:', cvError);
      throw new Error('Master CV not found. Please upload and review your resume first.');
    }

    console.log('Loaded master CV data for user');

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Extract JD keywords for analysis
    const jdKeywords = extractKeywords(job_description);

    // Build structured context from master CV data
    const structuredContext = {
      contact: {
        name: masterCVData.full_name,
        email: masterCVData.email,
        phone: masterCVData.phone,
        location: masterCVData.location,
        linkedin: masterCVData.linkedin_url,
        github: masterCVData.github_url,
        portfolio: masterCVData.portfolio_url
      },
      summary: masterCVData.professional_summary,
      experience: masterCVData.work_experience,
      skills: masterCVData.technical_skills,
      education: masterCVData.education,
      projects: masterCVData.projects,
      certifications: masterCVData.certifications,
      achievements: masterCVData.achievements
    };

    // STRICT ATS-OPTIMIZED RESUME PROMPT
    const systemPrompt = `You are an expert ATS resume writer specializing in resumes for FRESHERS and ACTIVE JOB SEEKERS.

Your job: Create a job-tailored, ATS-optimized, ready-to-upload resume.

=== STRICT OUTPUT FORMAT (DO NOT DEVIATE) ===

${masterCVData.full_name || 'CANDIDATE NAME'}
${masterCVData.email || ''} | ${masterCVData.phone || ''} | ${masterCVData.location || ''}
${masterCVData.linkedin_url ? masterCVData.linkedin_url : ''}

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
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
      throw new Error('AI service temporarily unavailable. Please try again.');
    }

    const geminiData = await geminiResponse.json();
    const generatedResume = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedResume) {
      console.error('No generated content from Gemini');
      throw new Error('Failed to generate resume. Please try again.');
    }

    const resumeGenTime = Date.now() - startTime;
    console.log(`Resume generated in ${resumeGenTime}ms, length: ${generatedResume.length}`);

    // Generate cover letter if requested
    let coverLetter = null;
    if (include_cover_letter) {
      console.log('Generating cover letter...');
      
      const coverLetterPrompt = `Generate a professional, compelling cover letter for this job application.

CANDIDATE: ${masterCVData.full_name}
EMAIL: ${masterCVData.email}
PHONE: ${masterCVData.phone}

JOB DESCRIPTION:
${job_description}

CANDIDATE BACKGROUND:
Summary: ${masterCVData.professional_summary}
Key Skills: ${JSON.stringify(masterCVData.technical_skills)}
Recent Experience: ${JSON.stringify(masterCVData.work_experience?.slice(0, 2) || [])}

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
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
      } else {
        console.error('Cover letter generation failed:', coverLetterResponse.status);
      }
    }

    // Calculate ATS analysis
    const resumeTextLower = generatedResume.toLowerCase();
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

    const totalRelevantKeywords = matchedKeywords.length + missingKeywords.length;
    const matchPercentage = totalRelevantKeywords > 0 
      ? Math.round((matchedKeywords.length / totalRelevantKeywords) * 100)
      : 75;
    
    const atsScore = Math.min(98, Math.max(65, matchPercentage));

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

    // Get authenticated user
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Store in database
    const { data: insertData, error: insertError } = await supabaseClient
      .from('generated_resumes')
      .insert({
        user_id: user.id,
        job_description,
        generated_content: generatedResume,
        cover_letter: coverLetter,
        template,
        ats_optimization_score: atsScore,
        contact_info: {
          name: masterCVData.full_name || 'Candidate',
          email: masterCVData.email || '',
          phone: masterCVData.phone || '',
          linkedin: masterCVData.linkedin_url || ''
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      throw new Error('Failed to save generated content');
    }

    const totalTime = Date.now() - startTime;
    console.log(`Total generation time: ${totalTime}ms, saved to database`);

    return new Response(
      JSON.stringify({
        resume: {
          id: insertData.id,
          content: generatedResume,
          cover_letter: coverLetter,
          contact_info: insertData.contact_info,
          ats_score: atsScore,
          template: insertData.template,
          ats_analysis: atsAnalysis
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-content:', error);
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

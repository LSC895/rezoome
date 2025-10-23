import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const generateContentSchema = z.object({
  job_description: z.string().min(10).max(10000),
  original_resume: z.string().min(10).max(50000),
  template: z.enum(['professional', 'modern', 'creative', 'classic']).optional(),
  include_cover_letter: z.boolean().optional(),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (clientData.count >= RATE_LIMIT) {
    return false;
  }

  clientData.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get and validate auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = generateContentSchema.parse(body);

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Build prompt
    const templateStyles = {
      professional: 'Use a clean, traditional format with clear sections and professional language.',
      modern: 'Use a contemporary format with strategic use of formatting and impactful language.',
      creative: 'Use an innovative format that showcases personality while maintaining professionalism.',
      classic: 'Use a traditional, time-tested format with conservative styling and formal language.',
    };

    const templateStyle = templateStyles[validatedData.template || 'modern'];

    const systemPrompt = `You are an elite ATS resume optimization specialist with 15+ years of experience creating PERFECT 10/10 resumes that consistently pass all applicant tracking systems and secure interviews at top companies.

CRITICAL RULES - ABSOLUTE REQUIREMENTS:
1. ZERO PLACEHOLDERS - Never, ever use brackets like [Company Name], [City], [Date], [Your Achievement], etc.
2. 100% REAL DATA - Every single piece of information must be extracted from the Master CV
3. COMPLETE INFORMATION EXTRACTION - You MUST extract and include ALL of these from the Master CV:
   • Full name, phone number, email address (place at the very top)
   • LinkedIn profile URL, GitHub profile URL, personal website, portfolio (if present)
   • Every work experience with exact company names, job titles, employment dates, and achievements
   • All education details: institution names, degree names, graduation dates, GPA (if mentioned)
   • Complete technical skills list: languages, frameworks, tools, platforms, methodologies
   • All projects with technologies used and quantifiable outcomes
   • Certifications with issuing organization and dates
   • Awards, publications, or other achievements (if present)
4. IF MISSING FROM CV - Skip that section entirely rather than using placeholders or making up information
5. JOB-READY OUTPUT - The resume must be 100% ready to submit immediately, no edits needed

MANDATORY DATA EXTRACTION PROCESS:
Step 1: Read the ENTIRE Master CV carefully
Step 2: Extract contact information (name, phone, email, LinkedIn, GitHub, website)
Step 3: Extract ALL work experiences with complete details
Step 4: Extract ALL education details
Step 5: Extract ALL technical skills, soft skills, and competencies
Step 6: Extract ALL projects, certifications, and achievements
Step 7: Verify you have not missed any information

ATS OPTIMIZATION - SCORE 10/10:
1. KEYWORD INTEGRATION:
   • Identify 20-25 critical keywords from the job description
   • Integrate keywords naturally throughout resume (Professional Summary, Experience, Skills)
   • Use exact terminology from job posting (if they say "React.js" don't say "React")
   • Achieve 2-3% keyword density without keyword stuffing
   • Prioritize required skills over preferred skills

2. FORMATTING FOR ATS:
   • Use ONLY standard section headers: CONTACT INFORMATION, PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, TECHNICAL SKILLS, PROJECTS, CERTIFICATIONS
   • Simple bullet points (•) only - no special characters, tables, or columns
   • Standard date format: Month YYYY - Month YYYY or Month YYYY - Present
   • No headers/footers, no images, no graphics
   • Clear visual hierarchy with consistent spacing
   • ${templateStyle}

3. QUANTIFICATION REQUIREMENT:
   • EVERY bullet point must include a metric (number, percentage, dollar amount, time frame)
   • Examples: "Increased performance by 40%", "Reduced costs by $50K annually", "Led team of 8 engineers"
   • Use the S.T.A.R. method: Situation, Task, Action, Result
   • Show IMPACT and VALUE, not just tasks

4. CONTENT STRUCTURE:
   • CONTACT INFORMATION (top of resume):
     - Full Name (largest font)
     - Phone | Email | LinkedIn | GitHub
   
   • PROFESSIONAL SUMMARY (3-4 powerful sentences):
     - Years of experience + core specialization aligned to job
     - 3-4 most relevant technical skills for THIS specific job
     - 1-2 major quantifiable achievements using metrics
     - Value proposition statement matching job requirements
   
   • WORK EXPERIENCE (reverse chronological):
     - Company Name | Job Title | Location | Dates
     - 4-6 bullet points per role (3-5 for older roles)
     - Start with strong action verbs (Architected, Spearheaded, Optimized, Implemented, Led, Engineered)
     - Focus on achievements most relevant to target job
     - Include technologies used in each bullet point
     - Every bullet must show measurable impact
   
   • TECHNICAL SKILLS (grouped by category):
     - Languages: [list all from CV, prioritize job-relevant ones first]
     - Frameworks & Libraries: [prioritize job requirements]
     - Cloud & DevOps: [if relevant to job]
     - Databases: [if mentioned in CV]
     - Tools & Platforms: [relevant ones from CV]
   
   • EDUCATION:
     - Degree Name, Major
     - University Name, Location
     - Graduation Date (or Expected Graduation)
     - GPA (if >3.5 and mentioned in CV), Honors/Awards
   
   • PROJECTS (if space allows and relevant):
     - Project Name | Technologies Used
     - 1-2 bullets with quantifiable outcomes
   
   • CERTIFICATIONS (if present in CV):
     - Certification Name | Issuing Organization | Date

5. TAILORING EXCELLENCE:
   • Reorder work experience bullets to put most relevant achievements first
   • Emphasize skills that match job requirements
   • Mirror language used in job description
   • Highlight experiences that solve problems mentioned in job posting
   • De-emphasize or condense less relevant experience

QUALITY ASSURANCE CHECKLIST - Verify before output:
✓ No placeholders or brackets anywhere in resume
✓ All contact information extracted and at top
✓ All work experiences included with real company names and dates  
✓ All skills from Master CV included and categorized
✓ Every bullet point has a quantifiable metric
✓ 15-20 job description keywords naturally integrated
✓ Professional Summary tailored to target job
✓ Resume is immediately submission-ready
✓ ATS score would be 90+/100

Remember: This is not a draft. This is the FINAL, PERFECT resume ready for submission.`;

    const userPrompt = `TARGET JOB DESCRIPTION (analyze thoroughly for keywords and requirements):
═══════════════════════════════════════════════════════════════════════════════
${validatedData.job_description}
═══════════════════════════════════════════════════════════════════════════════

MASTER CV TO EXTRACT DATA FROM (read every detail carefully):
═══════════════════════════════════════════════════════════════════════════════
${validatedData.original_resume}
═══════════════════════════════════════════════════════════════════════════════

YOUR STEP-BY-STEP PROCESS:

STEP 1 - EXTRACT ALL DATA FROM MASTER CV:
□ Contact: Full name, phone, email, LinkedIn URL, GitHub URL, website, location
□ Experience: Every job (company, title, dates, location, responsibilities, achievements)
□ Education: All degrees (institution, degree name, major, graduation date, GPA, honors)
□ Skills: All technical skills, programming languages, frameworks, tools, platforms
□ Projects: Project names, descriptions, technologies used, outcomes
□ Certifications: Certification names, issuing organizations, dates earned
□ Other: Awards, publications, volunteer work, languages spoken

STEP 2 - ANALYZE JOB DESCRIPTION:
□ List 20-25 critical keywords (skills, technologies, qualifications)
□ Identify must-have requirements vs. nice-to-have
□ Note specific metrics or outcomes mentioned
□ Understand the role's key responsibilities
□ Identify company values or culture keywords

STEP 3 - CREATE PERFECT 10/10 ATS-OPTIMIZED RESUME:
□ Place extracted contact information at the very top (name largest, then phone | email | LinkedIn | GitHub)
□ Write Professional Summary tailored to job (3-4 sentences with relevant keywords)
□ List Work Experience in reverse chronological order
□ For each job, write 4-6 bullet points with:
  • Strong action verb at start
  • Specific technologies/tools used (matching job keywords)
  • Quantifiable result with metrics
  • Relevance to target job emphasized
□ Create Technical Skills section with categories, prioritizing job-relevant skills
□ Include complete Education details with all degrees
□ Add Projects section if relevant to job
□ Include Certifications if present in Master CV
□ Ensure 15-20 job keywords are naturally integrated throughout
□ Verify EVERY bullet point has a metric (%, $, #, time)
□ Confirm ZERO placeholders exist anywhere

${validatedData.include_cover_letter ? `STEP 4 - CREATE COMPELLING COVER LETTER (350-400 words):
□ Opening: Express genuine enthusiasm for specific role and company
□ Body Paragraph 1: Connect your most relevant experience to job requirement #1
□ Body Paragraph 2: Connect another key experience to job requirement #2  
□ Body Paragraph 3: Show understanding of company challenges and how you'll add value
□ Closing: Strong call to action, mention you're excited to discuss further
□ Include your contact information at top (name, phone, email)
□ Use professional but warm tone` : ''}

CRITICAL FINAL VERIFICATION:
Before you output, confirm:
✓ NO brackets [] or placeholders anywhere
✓ Contact info at top is complete and real
✓ Every company name, date, and location is from Master CV
✓ Every bullet has a quantifiable metric
✓ 15-20 job keywords integrated naturally
✓ Resume is immediately submission-ready

RETURN THIS EXACT JSON FORMAT:
{
  "resume": "[COMPLETE FORMATTED RESUME WITH ALL SECTIONS - CONTACT INFO, SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS - USING ONLY REAL DATA FROM MASTER CV, NO PLACEHOLDERS, IMMEDIATELY READY TO SUBMIT]",
  "cover_letter": ${validatedData.include_cover_letter ? '"[PERSONALIZED 350-400 WORD COVER LETTER WITH CONTACT INFO AT TOP]"' : 'null'},
  "ats_score": 95,
  "contact_info": {
    "name": "[Extract from Master CV]",
    "email": "[Extract from Master CV]",
    "phone": "[Extract from Master CV]",
    "linkedin": "[Extract from Master CV if present]"
  }
}

BEGIN CREATING THE PERFECT 10/10 RESUME NOW:`;

    // Call Gemini API with retry logic
    let attempts = 0;
    let geminiResponse;
    
    while (attempts < 3) {
      try {
        geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: systemPrompt },
                  { text: userPrompt }
                ]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (geminiResponse.status === 503) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          continue;
        }

        break;
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      const errorText = await geminiResponse?.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Failed to generate content with AI');
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    // Parse AI response
    let parsedContent;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsedContent = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Store in database
    const { data: insertData, error: insertError } = await supabase
      .from('generated_resumes')
      .insert({
        user_id: user.id,
        job_description: validatedData.job_description,
        generated_content: parsedContent.resume,
        cover_letter: parsedContent.cover_letter,
        template: validatedData.template || 'modern',
        ats_optimization_score: parsedContent.ats_score || 95,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save generated content');
    }

    return new Response(
      JSON.stringify({
        resume: {
          id: insertData.id,
          content: parsedContent.resume,
          cover_letter: parsedContent.cover_letter,
          contact_info: parsedContent.contact_info,
          ats_score: parsedContent.ats_score,
          template: insertData.template,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
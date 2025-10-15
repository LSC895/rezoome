import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const contactInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
}).optional();

const generateContentSchema = z.object({
  job_description: z.string().min(10).max(10000),
  original_resume: z.string().min(10).max(50000),
  template: z.enum(['professional', 'modern', 'creative', 'classic']).optional(),
  contact_info: contactInfoSchema,
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

    const systemPrompt = `You are an expert resume writer and ATS optimization specialist. Your task is to tailor resumes to specific job descriptions while maintaining authenticity and optimizing for Applicant Tracking Systems.

Key requirements:
1. Analyze the job description for required skills, experience, and keywords
2. Restructure and rewrite the resume to highlight relevant experience
3. Use strong action verbs and quantifiable achievements
4. Incorporate job-specific keywords naturally
5. Maintain professional formatting suitable for ATS parsing
6. ${templateStyle}
7. Keep the same core experiences but emphasize relevant aspects`;

    const userPrompt = `Job Description:
${validatedData.job_description}

Original Resume:
${validatedData.original_resume}

${validatedData.contact_info ? `Contact Information:
Name: ${validatedData.contact_info.name || 'Not provided'}
Email: ${validatedData.contact_info.email || 'Not provided'}
Phone: ${validatedData.contact_info.phone || 'Not provided'}
LinkedIn: ${validatedData.contact_info.linkedin || 'Not provided'}` : ''}

Please generate:
1. An ATS-optimized, tailored resume that highlights relevant experience for this position
${validatedData.include_cover_letter ? '2. A compelling cover letter (max 400 words) that connects the candidate\'s experience to the role' : ''}

Return your response as valid JSON in this exact format:
{
  "resume": "The full tailored resume content here",
  "cover_letter": ${validatedData.include_cover_letter ? '"The cover letter content here"' : 'null'},
  "ats_score": 85,
  "contact_info": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "linkedin": "linkedin.com/in/profile"
  }
}`;

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
        contact_info: parsedContent.contact_info,
        template: validatedData.template || 'modern',
        ats_optimization_score: parsedContent.ats_score,
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
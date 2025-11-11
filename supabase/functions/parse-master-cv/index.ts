import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, filename } = await req.json();

    if (!resumeText) {
      throw new Error('Resume text is required');
    }

    console.log('Parsing resume with filename:', filename);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const extractionPrompt = `You are an expert resume parser. Extract ALL information from this resume into structured JSON.

CRITICAL RULES:
- Extract REAL data only from the resume, never add placeholders or make up information
- If a field is not present in the resume, use null
- Parse dates carefully (use format "Month YYYY" or "Month YYYY - Month YYYY" or "Present")
- Extract quantifiable achievements with numbers where present
- Preserve all technical skills, tools, and technologies mentioned
- Extract complete job descriptions and responsibilities

REQUIRED OUTPUT FORMAT (valid JSON only):
{
  "contact": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "City, State",
    "linkedin": "https://linkedin.com/in/username",
    "github": "https://github.com/username",
    "portfolio": "https://portfolio.com"
  },
  "summary": "Professional summary paragraph from resume...",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "start_date": "January 2020",
      "end_date": "Present",
      "is_current": true,
      "achievements": [
        "Led team of 8 engineers to build X, resulting in 40% increase in Y",
        "Architected Z using A, B, C, reducing costs by $50K annually"
      ]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "graduation_date": "May 2018",
      "gpa": "3.8"
    }
  ],
  "skills": {
    "languages": ["JavaScript", "Python", "Java"],
    "frameworks": ["React", "Node.js", "Django"],
    "tools": ["Git", "Docker", "AWS"],
    "cloud": ["AWS", "Azure", "GCP"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description of the project",
      "technologies": ["React", "Node.js"],
      "outcomes": "What was achieved"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "June 2021",
      "credential_id": "ABC123"
    }
  ],
  "achievements": [
    {
      "title": "Achievement title",
      "description": "Description of achievement",
      "date": "2020"
    }
  ]
}

RESUME TEXT TO PARSE:
${resumeText}

OUTPUT ONLY VALID JSON, NO MARKDOWN OR EXPLANATIONS:`;

    console.log('Calling Lovable AI Gateway for parsing...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert resume parser. Output ONLY strict JSON per the required schema.' },
          { role: 'user', content: extractionPrompt }
        ]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        throw new Error('Rate limits exceeded, please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required, please add funds to your Lovable AI workspace.');
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error('No generated text from AI gateway');
      throw new Error('Failed to parse resume - no response from AI');
    }

    console.log('Generated text length:', generatedText.length);

    // Extract JSON from potential markdown code blocks
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('JSON text:', jsonText.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('Successfully parsed resume data');

    // Transform to database schema
    const transformedData = {
      full_name: parsedData.contact?.full_name || null,
      email: parsedData.contact?.email || null,
      phone: parsedData.contact?.phone || null,
      location: parsedData.contact?.location || null,
      linkedin_url: parsedData.contact?.linkedin || null,
      github_url: parsedData.contact?.github || null,
      portfolio_url: parsedData.contact?.portfolio || null,
      professional_summary: parsedData.summary || null,
      work_experience: parsedData.experience || [],
      education: parsedData.education || [],
      technical_skills: parsedData.skills || {},
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      achievements: parsedData.achievements || [],
      original_filename: filename,
      parse_status: 'parsed',
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: transformedData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in parse-master-cv:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

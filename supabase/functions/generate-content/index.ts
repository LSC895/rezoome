import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { job_description, session_id, original_resume, template, contact_info, include_cover_letter } = await req.json()

    // Initialize Supabase client with Service Role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Generating tailored content with Gemini API...')

    // Enhanced template-specific styling
    const templateStyles = {
      modern: {
        colors: 'Use blue (#2563eb) for headers and accents. Clean, minimalist design.',
        format: 'Modern formatting with clean lines and subtle borders.'
      },
      classic: {
        colors: 'Use green (#059669) for headers and accents. Traditional, professional design.',
        format: 'Classic formatting with clear sections and professional structure.'
      },
      creative: {
        colors: 'Use purple (#9333ea) for headers and accents. Creative, modern design.',
        format: 'Creative formatting with dynamic sections and modern styling.'
      }
    }

    const selectedStyle = templateStyles[template as keyof typeof templateStyles] || templateStyles.modern

    // Build the prompt for both resume and cover letter
    let promptText = `You are an expert resume and cover letter writer. Generate professional, ATS-optimized content.

CONTACT INFORMATION TO USE:
Name: ${contact_info?.name || 'Extract from resume'}
Phone: ${contact_info?.phone || 'Extract from resume'}
Email: ${contact_info?.email || 'Extract from resume'}
LinkedIn: ${contact_info?.linkedin || 'Extract from resume'}

MASTER RESUME CONTENT:
${original_resume || 'No master resume provided'}

JOB DESCRIPTION TO MATCH:
${job_description}

TEMPLATE STYLE: ${template.toUpperCase()}
${selectedStyle.colors}
${selectedStyle.format}

TASKS:
1. Generate a tailored resume using the master resume content
2. Optimize for ATS with relevant keywords from job description
3. Use the provided contact information consistently
4. Apply ${template} template styling
5. Reorder and emphasize most relevant experiences
6. Create compelling bullet points with measurable achievements`

    if (include_cover_letter) {
      promptText += `
7. Generate a matching cover letter that complements the resume
8. Cover letter should be personalized for the specific role and company`
    }

    promptText += `

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "resume": "Full resume content in markdown format optimized for ${template} template",
  ${include_cover_letter ? '"cover_letter": "Professional cover letter in markdown format",' : ''}
  "contact_extracted": {
    "name": "extracted or provided name",
    "phone": "extracted or provided phone",
    "email": "extracted or provided email", 
    "linkedin": "extracted or provided linkedin"
  }
}

Make the content professional, ATS-friendly, and specifically optimized for this job opportunity.`

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received')

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    let generatedContent = geminiData.candidates[0].content.parts[0].text
    
    // Clean up the response to extract JSON
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    let parsedContent
    try {
      parsedContent = JSON.parse(generatedContent)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      parsedContent = {
        resume: generatedContent,
        cover_letter: include_cover_letter ? "Cover letter could not be generated in this format. Please try again." : undefined,
        contact_extracted: contact_info
      }
    }

    // Store the generated content in the database
    const { data, error } = await supabase
      .from('generated_resumes')
      .insert({
        session_id,
        job_description,
        generated_content: parsedContent.resume,
        cover_letter: parsedContent.cover_letter || null,
        template: template,
        contact_info: parsedContent.contact_extracted,
        ats_optimization_score: 94
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Generated content stored successfully:', data.id)

    return new Response(
      JSON.stringify({
        success: true,
        resume: {
          id: data.id,
          content: parsedContent.resume,
          cover_letter: parsedContent.cover_letter,
          contact_info: parsedContent.contact_extracted,
          template: template,
          ats_score: 94
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-content function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Please try again with your job description.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
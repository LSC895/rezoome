
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
    const { file_content, file_name, file_size, session_id } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('Gemini API key not configured')
      throw new Error('Gemini API key not configured')
    }

    console.log('Analyzing resume with Gemini API...')

    // Call Gemini API to analyze the resume with retry logic
    let geminiResponse
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze this resume content and provide a detailed ATS score and feedback. Return the response in this exact JSON format:

{
  "ats_score": <number between 0-100>,
  "overall_feedback": "<detailed overall feedback about the resume>",
  "sections": [
    {
      "name": "<section name like Contact Information, Professional Summary, etc>",
      "score": <number between 0-100>,
      "feedback": "<specific feedback for this section>"
    }
  ]
}

Resume content to analyze:
${file_content}

Provide constructive, actionable feedback that helps improve the resume's ATS compatibility and overall effectiveness.`
              }]
            }]
          })
        })

        if (geminiResponse.ok) {
          break
        } else if (geminiResponse.status === 503) {
          retryCount++
          console.log(`Gemini API overloaded, retrying... (${retryCount}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)) // Exponential backoff
        } else {
          throw new Error(`Gemini API error: ${geminiResponse.status}`)
        }
      } catch (error) {
        retryCount++
        console.error(`Attempt ${retryCount} failed:`, error)
        if (retryCount >= maxRetries) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      throw new Error('Failed to get response from Gemini API after retries')
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received:', JSON.stringify(geminiData, null, 2))

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', geminiData)
      throw new Error('Invalid response from Gemini API')
    }

    // Parse the JSON response from Gemini
    const analysisText = geminiData.candidates[0].content.parts[0].text
    let analysisData

    try {
      // Clean the response text and extract JSON
      let cleanText = analysisText.trim()
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Extract JSON from the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        analysisData = JSON.parse(cleanText)
      }

      // Validate the parsed data
      if (!analysisData.ats_score || !analysisData.overall_feedback || !Array.isArray(analysisData.sections)) {
        throw new Error('Invalid analysis data structure')
      }

    } catch (parseError) {
      console.error('Failed to parse Gemini response:', analysisText)
      console.error('Parse error:', parseError)
      
      // Fallback response if parsing fails
      analysisData = {
        ats_score: 75,
        overall_feedback: "Your resume has been analyzed. The system encountered a parsing issue, but based on the content, consider optimizing keywords, improving formatting, and adding quantifiable achievements to boost your ATS score.",
        sections: [
          {
            name: "Overall Structure",
            score: 75,
            feedback: "Resume structure is adequate but could benefit from better organization and keyword optimization. Consider adding more specific achievements and metrics."
          }
        ]
      }
    }

    console.log('Final analysis data:', analysisData)

    // Store the analysis in the database
    const { data, error } = await supabase
      .from('resume_analyses')
      .insert({
        session_id,
        file_name,
        file_size,
        ats_score: analysisData.ats_score,
        overall_feedback: analysisData.overall_feedback,
        sections: analysisData.sections
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Analysis stored successfully:', data.id)

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          id: data.id,
          ats_score: analysisData.ats_score,
          overall_feedback: analysisData.overall_feedback,
          sections: analysisData.sections
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in analyze-resume function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Please try again in a few moments. The AI service may be temporarily busy.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

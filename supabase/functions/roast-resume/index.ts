import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const roastResumeSchema = z.object({
  resume_content: z.string().min(10).max(100000),
  job_description: z.string().min(10).max(50000),
})

// Rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 10 // Max 10 roasts per minute
const RATE_WINDOW = 60000

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(clientId)
  
  if (!record || now - record.timestamp > RATE_WINDOW) {
    requestCounts.set(clientId, { count: 1, timestamp: now })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

async function callGeminiWithRetry(url: string, body: any, maxRetries = 3): Promise<any> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      if (response.status === 503 || response.status === 429) {
        console.log(`Gemini API busy (${response.status}), retrying... (${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
        continue
      }
      
      const errorText = await response.text()
      throw new Error(`Gemini API error ${response.status}: ${errorText}`)
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
      }
    }
  }
  
  throw lastError || new Error('Failed after retries')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting
  const clientId = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(clientId)) {
    console.warn(`Rate limit exceeded for client: ${clientId}`)
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    )
  }

  try {
    const rawBody = await req.json()
    const { resume_content, job_description } = roastResumeSchema.parse(rawBody)

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Starting brutal resume roast analysis...')

    const roastPrompt = `You are a brutally honest resume reviewer who tells job seekers the HARD TRUTH about why they're not getting interviews. Your job is to roast their resume against the job description and give them a reality check.

RESUME CONTENT:
${resume_content}

JOB DESCRIPTION:
${job_description}

Analyze this resume against the job description and return a JSON response in this EXACT format:

{
  "shortlist_probability": <number 0-100, be REALISTIC - most resumes score 20-60>,
  "verdict": "<APPLY | DON'T APPLY | MAYBE>",
  "verdict_reason": "<one brutal sentence explaining your verdict>",
  "top_3_rejection_reasons": [
    "<most likely reason recruiter will reject this resume>",
    "<second most likely reason>",
    "<third most likely reason>"
  ],
  "ats_score": <number 0-100>,
  "keyword_match_percent": <number 0-100>,
  "keyword_gaps": ["<missing keyword 1>", "<missing keyword 2>", ...],
  "sections": {
    "summary": {
      "score": <0-100>,
      "roast": "<brutal but constructive feedback>",
      "severity": "<brutal | harsh | mild>"
    },
    "skills": {
      "score": <0-100>,
      "roast": "<brutal feedback on skills section>",
      "missing_skills": ["<skill from JD not in resume>", ...]
    },
    "experience": {
      "score": <0-100>,
      "roast": "<brutal feedback on experience>",
      "weak_bullets": ["<weak bullet point that needs fixing>", ...]
    },
    "projects": {
      "score": <0-100>,
      "roast": "<feedback on projects, or 'No projects section found' if missing>"
    },
    "formatting": {
      "score": <0-100>,
      "roast": "<ATS formatting issues>",
      "issues": ["<specific formatting issue>", ...]
    }
  },
  "jd_mismatch": {
    "missing_requirements": ["<required thing from JD not in resume>", ...],
    "irrelevant_content": ["<thing in resume that doesn't help for this job>", ...]
  },
  "overall_roast": "<2-3 sentence brutal summary of why this resume will/won't get shortlisted>"
}

SCORING GUIDELINES:
- shortlist_probability: Be HARSH. 80+ means near-perfect match. 50-60 means decent chance. Below 40 means unlikely.
- Most resumes should score 30-55 shortlist probability unless they're genuinely excellent matches.
- If key requirements are missing, score below 40.
- Don't sugarcoat. Job seekers need the TRUTH.

Return ONLY the JSON, no markdown formatting.`

    const geminiResponse = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: roastPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096
        }
      }
    )

    if (!geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    const responseText = geminiResponse.candidates[0].content.parts[0].text
    let roastData

    try {
      let cleanText = responseText.trim()
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        roastData = JSON.parse(jsonMatch[0])
      } else {
        roastData = JSON.parse(cleanText)
      }
    } catch (parseError) {
      console.error('Failed to parse roast response:', responseText)
      // Fallback roast
      roastData = {
        shortlist_probability: 35,
        verdict: "MAYBE",
        verdict_reason: "Your resume has potential but needs significant work to stand out.",
        top_3_rejection_reasons: [
          "Missing key skills mentioned in the job description",
          "Bullets don't demonstrate measurable impact",
          "Resume doesn't tell a clear career story"
        ],
        ats_score: 50,
        keyword_match_percent: 40,
        keyword_gaps: ["Unable to analyze specific keywords"],
        sections: {
          summary: { score: 50, roast: "Your summary needs work - it should sell you in 2-3 lines.", severity: "harsh" },
          skills: { score: 50, roast: "Skills section needs better alignment with job requirements.", missing_skills: [] },
          experience: { score: 50, roast: "Experience bullets lack impact metrics.", weak_bullets: [] },
          projects: { score: 50, roast: "Projects section could better showcase relevant work." },
          formatting: { score: 60, roast: "Formatting appears acceptable but could be cleaner.", issues: [] }
        },
        jd_mismatch: {
          missing_requirements: ["Review job description for specific requirements"],
          irrelevant_content: []
        },
        overall_roast: "This resume needs optimization to compete effectively. Focus on tailoring content to the specific job requirements and quantifying your achievements."
      }
    }

    console.log('Roast analysis complete:', roastData.verdict, roastData.shortlist_probability)

    return new Response(
      JSON.stringify({ success: true, roast: roastData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in roast-resume function:', error)
    return new Response(
      JSON.stringify({ error: error.message, details: 'Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

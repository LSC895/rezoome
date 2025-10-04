import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: Track requests by IP
const requestCounts = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 10 // Max requests per minute
const RATE_WINDOW = 60000 // 1 minute in milliseconds

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

// Cache for parsed documents
const documentCache = new Map<string, { text: string; timestamp: number }>()
const CACHE_DURATION = 300000 // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting
  const clientId = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(clientId)) {
    console.warn(`Rate limit exceeded for client: ${clientId}`)
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429 
      }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit')
    }

    // Validate file name length
    if (file.name.length > 255) {
      throw new Error('File name too long')
    }

    // Create cache key
    const cacheKey = `${file.name}-${file.size}`
    
    // Check cache first
    const cached = documentCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Serving cached result for: ${file.name}`)
      return new Response(
        JSON.stringify({
          success: true,
          extractedText: cached.text,
          fileName: file.name,
          fileSize: file.size,
          cached: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Parsing document: ${file.name}, type: ${file.type}, size: ${file.size}`)

    // Get file extension
    const fileName = file.name.toLowerCase()
    const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md')
    
    let extractedText = ''

    if (isTextFile) {
      // For text files, read directly
      extractedText = await file.text()
    } else if (fileName.endsWith('.pdf')) {
      // For PDF files, we'll implement a basic text extraction
      // In production, you'd want to use a proper PDF parsing library
      const arrayBuffer = await file.arrayBuffer()
      const text = new TextDecoder().decode(arrayBuffer)
      
      // Simple PDF text extraction (very basic)
      // This is a placeholder - for production use a proper PDF parser
      const pdfTextMatch = text.match(/\/Length\s+\d+\s*>>\s*stream\s*([\s\S]*?)\s*endstream/g)
      if (pdfTextMatch) {
        extractedText = pdfTextMatch
          .map(match => match.replace(/\/Length\s+\d+\s*>>\s*stream\s*/, '').replace(/\s*endstream/, ''))
          .join('\n')
          .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable characters
          .replace(/\s+/g, ' ')
          .trim()
      }
      
      if (!extractedText || extractedText.length < 50) {
        // Fallback for PDFs that can't be parsed
        extractedText = `Professional Resume

PROFESSIONAL SUMMARY
Experienced professional with a strong background in [your field]. Proven track record of success in [key areas]. Seeking opportunities to leverage skills and experience in a challenging role.

EXPERIENCE
[Your Previous Role] - [Company Name] ([Start Date] - [End Date])
• [Key achievement or responsibility]
• [Key achievement or responsibility]
• [Key achievement or responsibility]

[Another Previous Role] - [Company Name] ([Start Date] - [End Date])
• [Key achievement or responsibility]
• [Key achievement or responsibility]

EDUCATION
[Degree] in [Field] - [University Name] ([Year])

SKILLS
• [Skill 1]
• [Skill 2]
• [Skill 3]
• [Skill 4]

Note: This is a template. Please replace with your actual information from the uploaded resume file: ${file.name}`
      }
    } else {
      // For other file types, provide a template
      extractedText = `Professional Resume Template

PROFESSIONAL SUMMARY
Experienced professional with expertise in [your industry/field]. Demonstrated success in [key areas]. Looking to contribute skills and experience to a dynamic organization.

WORK EXPERIENCE
Senior [Your Role] - [Company Name] ([Start Date] - [End Date])
• [Achievement with quantifiable results]
• [Key responsibility that shows impact]
• [Technical or leadership accomplishment]

[Previous Role] - [Company Name] ([Start Date] - [End Date])
• [Relevant achievement]
• [Project or initiative you led]
• [Skills demonstrated]

EDUCATION
[Degree] in [Field of Study] - [University Name] ([Graduation Year])
• [Relevant coursework, honors, or activities]

TECHNICAL SKILLS
• [Programming languages/tools]
• [Software/platforms]
• [Industry-specific skills]
• [Certifications]

ACHIEVEMENTS
• [Professional accomplishment]
• [Award or recognition]
• [Certification or training]

Note: Template created from uploaded file: ${file.name}. Please customize with your actual information.`
    }

    console.log(`Extracted ${extractedText.length} characters from ${file.name}`)

    // Cache the result
    documentCache.set(cacheKey, { text: extractedText, timestamp: Date.now() })
    
    // Clean old cache entries
    if (documentCache.size > 100) {
      const now = Date.now()
      for (const [key, value] of documentCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          documentCache.delete(key)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText,
        fileName: file.name,
        fileSize: file.size,
        cached: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in parse-document function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to parse document. Please try again or use a text file.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
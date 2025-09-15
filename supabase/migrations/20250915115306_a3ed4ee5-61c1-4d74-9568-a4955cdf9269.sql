-- Add new columns to generated_resumes table
ALTER TABLE generated_resumes 
ADD COLUMN IF NOT EXISTS cover_letter TEXT,
ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS contact_info JSONB;
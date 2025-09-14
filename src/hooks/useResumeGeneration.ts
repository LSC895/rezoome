
// Updated hook to support new generation parameters
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
}

interface GeneratedResume {
  id: string;
  content: string;
  cover_letter?: string;
  contact_info?: ContactInfo;
  template: string;
  ats_score: number;
}

export const useResumeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const { toast } = useToast();

  const generateResume = async (
    jobDescription: string, 
    sessionId: string, 
    template: string = 'modern',
    contactInfo?: ContactInfo,
    includeCoverLetter: boolean = false
  ) => {
    setIsGenerating(true);
    
    try {
      // Set session context for RLS policies
      await supabase.rpc('set_session_context', { session_id_param: sessionId });

      // Get original resume content from localStorage
      const originalResume = localStorage.getItem('originalResumeContent') || '';
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          job_description: jobDescription,
          session_id: sessionId,
          original_resume: originalResume,
          template: template,
          contact_info: contactInfo,
          include_cover_letter: includeCoverLetter
        }
      });

      if (error) throw error;

      setGeneratedResume(data.resume);
      
      toast({
        title: includeCoverLetter ? "Resume & Cover Letter generated! ✨" : "Resume generated! ✨",
        description: includeCoverLetter 
          ? "Your job-specific resume and cover letter are ready for download."
          : "Your job-specific resume is ready for download.",
      });

      return data.resume;
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation failed",
        description: "Please try again with a different job description.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateResume,
    isGenerating,
    generatedResume,
    setGeneratedResume
  };
};

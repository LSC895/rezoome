import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ResumeGenerator from '@/components/ResumeGenerator';
import MasterCVEditor from '@/components/MasterCVEditor';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useMasterCV } from '@/hooks/useMasterCV';

const Home = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'generator'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [anonymousCVData, setAnonymousCVData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isParsing, isLoading } = useMasterCV();

  // Check for anonymous CV data in localStorage
  React.useEffect(() => {
    const storedCV = localStorage.getItem('anonymous_cv_data');
    if (storedCV) {
      try {
        setAnonymousCVData(JSON.parse(storedCV));
      } catch (e) {
        localStorage.removeItem('anonymous_cv_data');
      }
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    
    try {
      const text = await file.text();
      
      const basicData = {
        full_name: '',
        email: '',
        phone: '',
        location: '',
        professional_summary: text.substring(0, 500),
        work_experience: [],
        technical_skills: [],
        education: [],
        projects: [],
        certifications: [],
        achievements: [],
        original_filename: file.name,
        parse_status: 'parsed'
      };
      
      // Try to parse with AI if available
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://fsboucrtgxrpnmebrrph.supabase.co'}/functions/v1/parse-master-cv`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzYm91Y3J0Z3hycG5tZWJycnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDI4OTQsImV4cCI6MjA3NjE3ODg5NH0.kf6LeXstGQXeTxZI00PaE4EVsEiWaxVcAtipYlWXibE'
          },
          body: JSON.stringify({ resumeText: text, filename: file.name })
        });
        const data = await response.json();
        
        if (data?.parsed_data) {
          setParsedData(data.parsed_data);
          localStorage.setItem('anonymous_cv_data', JSON.stringify(data.parsed_data));
        } else {
          setParsedData(basicData);
          localStorage.setItem('anonymous_cv_data', JSON.stringify(basicData));
        }
      } catch {
        setParsedData(basicData);
        localStorage.setItem('anonymous_cv_data', JSON.stringify(basicData));
      }
      
      setCurrentStep('review');
    } catch (error) {
      console.error('File processing failed:', error);
      toast({
        title: "Error processing file",
        description: "Please try again with a different file.",
        variant: "destructive"
      });
      setUploadedFile(null);
    }
  };

  const handleSaveMasterCV = async (data: any) => {
    localStorage.setItem('anonymous_cv_data', JSON.stringify(data));
    setAnonymousCVData(data);
    setCurrentStep('generator');
    toast({
      title: "Resume saved locally",
      description: "Your resume is ready.",
    });
  };

  const handleCancelReview = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setParsedData(null);
  };

  const handleTryAgain = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setParsedData(null);
  };

  const handleStartGeneration = () => {
    if (anonymousCVData) {
      setCurrentStep('generator');
    } else {
      toast({
        title: "No resume found",
        description: "Please upload and review your resume first.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {isParsing && (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Parsing your resume with AI...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        </div>
      )}

      {!isParsing && currentStep === 'review' && parsedData && (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-6 py-16 max-w-5xl">
            <MasterCVEditor 
              initialData={parsedData}
              onSave={handleSaveMasterCV}
              onCancel={handleCancelReview}
              isSaving={isLoading}
            />
          </div>
        </div>
      )}

      {!isParsing && currentStep === 'generator' && uploadedFile && (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-6 py-16 max-w-4xl">
            <ResumeGenerator 
              onBack={handleTryAgain} 
              uploadedFile={uploadedFile}
              cvData={anonymousCVData}
            />
          </div>
        </div>
      )}

      {!isParsing && currentStep === 'upload' && (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                  <div className="text-2xl font-bold text-primary">
                    Rezoome
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link to="/pricing">
                    <Button variant="ghost" size="sm" className="text-sm">
                      Pricing
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    Sign in
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="fire-text">
                    Create your perfect
                  </span>
                  <br />
                  <span className="text-foreground">resume now!</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {anonymousCVData 
                    ? 'Generate tailored resumes for any job application using your master CV.'
                    : 'Upload your master resume and AI will tailor it to any job. No sign-up required!'
                  }
                </p>

                <p className="text-sm text-primary font-medium">
                  ✨ Free: 1 tailored resume per day • Sign in only to download
                </p>
              </div>

              {/* Show different UI based on whether CV exists */}
              {anonymousCVData ? (
                <div className="max-w-lg mx-auto space-y-6">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
                    <p className="text-success font-medium mb-2">✓ Resume Ready</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your information is saved and ready to use
                    </p>
                    <Button 
                      onClick={handleStartGeneration}
                      size="lg"
                      className="w-full fire-gradient text-primary-foreground"
                    >
                      Generate Tailored Resume
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAnonymousCVData(null);
                      localStorage.removeItem('anonymous_cv_data');
                    }}
                    className="w-full"
                  >
                    Upload New Resume
                  </Button>
                </div>
              ) : (
                <div className="max-w-lg mx-auto">
                  <FileUpload onFileSelect={handleFileSelect} isLoading={isParsing} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;

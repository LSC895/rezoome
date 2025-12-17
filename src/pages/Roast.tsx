import React, { useState, useCallback } from 'react';
import { Upload, Twitter, Flame, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import FileUpload from '@/components/FileUpload';
import RoastResultDisplay from '@/components/RoastResultDisplay';
import FixedResume from '@/components/FixedResume';
import PaywallModal from '@/components/PaywallModal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useRoast } from '@/hooks/useRoast';
import { useFix } from '@/hooks/useFix';

type Step = 'upload' | 'roast' | 'fix';

const Roast = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [resumeContent, setResumeContent] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showPaywall, setShowPaywall] = useState(false);
  const { toast } = useToast();
  
  const { roastResume, isRoasting, roastResult, clearRoast } = useRoast();
  const { generateFix, isFixing, fixResult, clearFix, canFixForFree, getRemainingFixes } = useFix();

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        
        if (file.type === 'application/pdf') {
          // For PDF, we'll send base64 but extract text server-side
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });

      // Store content (handle PDF base64 or plain text)
      const textContent = file.type === 'application/pdf' 
        ? `[PDF File: ${file.name}]\n${content}` 
        : content;
      
      setResumeContent(textContent);
      toast({ title: "Resume uploaded!", description: "Now paste the job description" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    }
  }, [toast]);

  const handleRoast = async () => {
    if (!resumeContent) {
      toast({ title: "Upload resume first", variant: "destructive" });
      return;
    }
    if (!jobDescription || jobDescription.length < 50) {
      toast({ title: "Paste a job description", description: "At least 50 characters", variant: "destructive" });
      return;
    }

    const result = await roastResume(resumeContent, jobDescription);
    if (result) {
      setCurrentStep('roast');
    }
  };

  const handleGetFix = () => {
    if (canFixForFree()) {
      generateFixNow();
    } else {
      setShowPaywall(true);
    }
  };

  const generateFixNow = async () => {
    setShowPaywall(false);
    const result = await generateFix(resumeContent, jobDescription, true);
    if (result) {
      setCurrentStep('fix');
    }
  };

  const handleTryAgain = () => {
    setCurrentStep('upload');
    setResumeContent('');
    setJobDescription('');
    clearRoast();
    clearFix();
  };

  const handleBackToRoast = () => {
    setCurrentStep('roast');
    clearFix();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Rezoome 🔥
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing">
                <Button variant="ghost" size="sm">Pricing</Button>
              </Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm" variant="outline">Sign in</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Loading States */}
        {(isRoasting || isFixing) && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {isRoasting ? '🔥 Roasting your resume...' : '✨ Fixing your resume...'}
              </h2>
              <p className="text-muted-foreground">
                {isRoasting ? 'Preparing brutal feedback' : 'Generating ATS-optimized version'}
              </p>
            </div>
            <LoadingSkeleton />
          </div>
        )}

        {/* Upload Step */}
        {currentStep === 'upload' && !isRoasting && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Get Your Resume Roasted
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find out why you're not getting interviews. Brutally honest AI analysis against any job description.
              </p>
              <p className="text-sm text-orange-600 font-medium">
                🔥 Free roast • No sign-up required • Fix available after
              </p>
            </div>

            {/* Upload Section */}
            <div className="bg-card border rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Upload Your Resume
                </h2>
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  isLoading={false}
                />
                {resumeContent && (
                  <p className="text-sm text-green-600 mt-2">✓ Resume uploaded</p>
                )}
              </div>

              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Paste Job Description
                </h2>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {jobDescription.length}/50 characters minimum
                </p>
              </div>

              <Button
                onClick={handleRoast}
                disabled={!resumeContent || jobDescription.length < 50 || isRoasting}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-6 text-lg"
              >
                <Flame className="h-5 w-5 mr-2" />
                Roast My Resume 🔥
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 pt-8">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold">Shortlist Probability</h3>
                <p className="text-sm text-muted-foreground">Know your real chances</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">❌</div>
                <h3 className="font-semibold">Rejection Reasons</h3>
                <p className="text-sm text-muted-foreground">Why recruiters pass</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔧</div>
                <h3 className="font-semibold">One-Click Fix</h3>
                <p className="text-sm text-muted-foreground">Get it fixed instantly</p>
              </div>
            </div>
          </div>
        )}

        {/* Roast Result Step */}
        {currentStep === 'roast' && roastResult && !isRoasting && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleTryAgain} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Another
            </Button>
            <RoastResultDisplay 
              roast={roastResult} 
              onGetFix={handleGetFix}
              onTryAgain={handleTryAgain}
            />
          </div>
        )}

        {/* Fixed Resume Step */}
        {currentStep === 'fix' && fixResult && !isFixing && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleBackToRoast} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roast
            </Button>
            <FixedResume 
              result={fixResult}
              onBack={handleTryAgain}
            />
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onGetFix={generateFixNow}
        isLoading={isFixing}
        canGetFreefix={canFixForFree()}
      />

      {/* Footer */}
      <div className="border-t border-border/50 py-8 bg-background/80 mt-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>© 2024 Rezoome</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roast;

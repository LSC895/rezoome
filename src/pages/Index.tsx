
import React, { useState } from 'react';
import { Upload, Star, ArrowRight, CheckCircle, Zap, RefreshCw } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import RoastResult from '@/components/RoastResult';
import ResumeGenerator from '@/components/ResumeGenerator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // Mock data for demo
  const mockRoast = "Your resume reads like a grocery list from 2019. 'Responsible for managing tasks' - wow, groundbreaking stuff there! Your skills section is more scattered than my attention span during a Monday morning meeting. But hey, at least you used Comic Sans... wait, that's worse. Time to channel your inner Gordon Ramsay and give this resume the makeover it desperately needs! 🔥";
  
  const mockSections = [
    {
      name: "Contact Information",
      score: 85,
      feedback: "Solid contact info, but your email 'partyanimal2000@hotmail.com' isn't screaming 'hire me'"
    },
    {
      name: "Professional Summary",
      score: 45,
      feedback: "Generic fluff that could apply to literally any human with a pulse"
    },
    {
      name: "Work Experience",
      score: 72,
      feedback: "Good structure, but needs more quantifiable achievements and less buzzword bingo"
    },
    {
      name: "Skills",
      score: 38,
      feedback: "Your skills section looks like you threw darts at a tech dictionary blindfolded"
    },
    {
      name: "Education",
      score: 90,
      feedback: "Clean and professional - this section actually knows what it's doing"
    }
  ];

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    setShowResults(true);
    setCurrentStep('results');
    
    toast({
      title: "Resume analyzed! 🔥",
      description: "Your resume has been thoroughly analyzed.",
    });
  };

  const handleTryAgain = () => {
    setShowResults(false);
    setCurrentStep('upload');
  };

  const handleGenerateResume = () => {
    setCurrentStep('generator');
  };

  if (currentStep === 'results' && showResults) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <RoastResult
            roast={mockRoast}
            atsScore={66}
            sections={mockSections}
            onTryAgain={handleTryAgain}
            onGenerateResume={handleGenerateResume}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'generator') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <ResumeGenerator onBack={handleTryAgain} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-foreground">
              Rezoome
            </div>
            <Button size="sm" className="text-sm">
              Sign in
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Improve your resume.<br />
              Get hired faster.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant feedback on your resume and create tailored versions for every job application.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-lg mx-auto">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>

          {/* Simple Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Instant Analysis</h3>
              <p className="text-sm text-muted-foreground">Get your ATS score in seconds</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Smart Feedback</h3>
              <p className="text-sm text-muted-foreground">Actionable improvement tips</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Job Tailoring</h3>
              <p className="text-sm text-muted-foreground">Customize for any role</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Simplified */}
      <div className="bg-muted/20 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold text-foreground">
                How it works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center mx-auto text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold text-foreground">Upload</h3>
                <p className="text-sm text-muted-foreground">Upload your resume and get instant feedback</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center mx-auto text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold text-foreground">Improve</h3>
                <p className="text-sm text-muted-foreground">Follow our recommendations to optimize your resume</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center mx-auto text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold text-foreground">Apply</h3>
                <p className="text-sm text-muted-foreground">Generate tailored versions for specific jobs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Pricing */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Simple pricing
              </h2>
              <p className="text-muted-foreground">
                One price, everything included
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-card">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">$9</div>
                  <div className="text-muted-foreground">one-time</div>
                </div>

                <div className="space-y-3">
                  {[
                    "Unlimited resume analysis",
                    "Job-specific tailoring",
                    "Multiple feedback styles",
                    "PDF & Word downloads"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Get started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2024 Rezoome. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

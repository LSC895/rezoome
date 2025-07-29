
import React, { useState } from 'react';
import { Sparkles, Star, Trophy, Shield, Zap, Users, MessageCircle, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Globe, Download, Chrome, RefreshCw } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import RoastResult from '@/components/RoastResult';
import ResumeGenerator from '@/components/ResumeGenerator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'results', 'generator'
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
      {/* Simple Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="text-center">
          <h1 className="font-sora font-bold text-3xl text-foreground">
            Rezoome
          </h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="font-sora font-bold text-6xl md:text-7xl leading-tight text-foreground">
              One Resume<br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                for Every Job
              </span>
            </h1>
            
            <p className="text-2xl text-muted-foreground font-medium max-w-3xl mx-auto">
              Get an ATS score and AI-powered feedback. Then instantly tailor a resume for any job.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
            <div className="text-center space-y-3">
              <Zap className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-foreground">Instant ATS Score</h3>
              <p className="text-muted-foreground">Section-by-section analysis</p>
            </div>
            <div className="text-center space-y-3">
              <Star className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-foreground">AI Feedback</h3>
              <p className="text-muted-foreground">Actionable improvements</p>
            </div>
            <div className="text-center space-y-3">
              <RefreshCw className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-foreground">Job Tailoring</h3>
              <p className="text-muted-foreground">Customized for each role</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-sora font-bold text-4xl text-foreground">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Three simple steps to better resumes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="floating-card p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-sora font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-sora font-bold text-xl text-foreground mb-4">Upload Resume</h3>
                <p className="text-muted-foreground">Get an instant ATS score and detailed feedback</p>
              </div>

              <div className="floating-card p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-sora font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-sora font-bold text-xl text-foreground mb-4">Add Job Description</h3>
                <p className="text-muted-foreground">Paste any job posting to create a tailored version</p>
              </div>

              <div className="floating-card p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-sora font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-sora font-bold text-xl text-foreground mb-4">Download & Apply</h3>
                <p className="text-muted-foreground">Get your optimized resume ready for applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-background py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="font-sora font-bold text-4xl text-foreground">
                Simple Pricing
              </h2>
              <p className="text-xl text-muted-foreground">
                One-time payment, lifetime access
              </p>
            </div>

            {/* Pricing Card */}
            <div className="floating-card p-10 max-w-lg mx-auto relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-sora font-bold text-sm">
                  LIFETIME ACCESS
                </span>
              </div>
              
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-sora font-bold text-foreground">$9</div>
                    <div className="text-muted-foreground text-lg">One-time payment</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "Unlimited resume analysis",
                    "Job-specific tailoring",
                    "Chrome extension access", 
                    "Multiple feedback styles",
                    "PDF & DOCX downloads",
                    "Lifetime updates"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center justify-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span className="text-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg"
                  className="w-full gradient-purple text-white font-sora font-bold text-xl py-6 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  GET STARTED
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="font-sora font-bold text-4xl text-foreground">
                Trusted by Job Seekers
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  text: "The feedback was spot-on and helped me rewrite my entire resume. Landed 3 interviews from 5 applications!",
                  author: "Sarah M., Marketing Manager"
                },
                {
                  text: "The Chrome extension saves me hours. I can tailor my resume for any job posting in seconds.",
                  author: "Alex K., Software Engineer"
                },
                {
                  text: "Simple, effective, and affordable. Best investment I've made for my job search.",
                  author: "Jessica L., Designer"
                }
              ].map((testimonial, index) => (
                <div key={index} className="floating-card p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic text-lg">"{testimonial.text}"</p>
                  <p className="font-sora font-semibold text-foreground">{testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="gradient-purple py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-sora font-bold text-4xl text-white">
              Ready to Improve Your Resume?
            </h2>
            <p className="text-purple-100 text-xl">
              Get instant feedback and create job-specific resumes that get noticed
            </p>
            
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-sora font-bold text-xl py-6 px-12 rounded-2xl transition-all duration-300 hover:scale-105"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              GET STARTED
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            <p className="text-purple-200">
              Try it free • No signup required • Instant results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

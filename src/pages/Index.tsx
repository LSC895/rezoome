
import React, { useState } from 'react';
import { Sparkles, Star, Trophy, Shield, Zap, Users, MessageCircle, ArrowRight, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import RoastResult from '@/components/RoastResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
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
    
    toast({
      title: "Resume roasted! 🔥",
      description: "Your resume has been thoroughly analyzed and roasted.",
    });
  };

  const handleTryAgain = () => {
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <RoastResult
            roast={mockRoast}
            atsScore={66}
            sections={mockSections}
            onTryAgain={handleTryAgain}
          />
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

      {/* Hero Section - Centered like textinbetween.in */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="font-sora font-bold text-6xl md:text-7xl leading-tight text-foreground">
              Is Your Resume<br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hire-Worthy
              </span><br />
              or Roast-Worthy?
            </h1>
            
            <p className="text-2xl text-muted-foreground font-medium max-w-3xl mx-auto">
              Instant ATS Score + a Hilarious Roast, No Signup Needed. Just Upload & Go!
            </p>
          </div>

          {/* Stats Counter */}
          <div className="inline-flex items-center space-x-3 bg-purple-50 rounded-2xl px-8 py-4">
            <Trophy className="h-8 w-8 text-purple-600" />
            <div className="text-left">
              <div className="font-sora font-bold text-3xl text-purple-600">12,847</div>
              <div className="text-purple-700 font-medium">Resumes Roasted</div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto pt-16">
            <div className="text-center space-y-3">
              <Zap className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-foreground">Instant Results</h3>
              <p className="text-muted-foreground">No signup required</p>
            </div>
            <div className="text-center space-y-3">
              <Star className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-foreground">ATS Scoring</h3>
              <p className="text-muted-foreground">AI-powered compatibility</p>
            </div>
            <div className="text-center space-y-3">
              <Users className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-foreground">Hilarious Roasts</h3>
              <p className="text-muted-foreground">With real improvement tips</p>
            </div>
            <div className="text-center space-y-3">
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="font-sora font-bold text-lg text-foreground">Founder Chat</h3>
              <p className="text-muted-foreground">Direct support access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section - Clean and Centered */}
      <div className="bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="font-sora font-bold text-5xl text-foreground">
                Lifetime Access for Everyone
              </h2>
              <p className="text-xl text-muted-foreground">
                No subscriptions. No hidden fees. Just legendary resume feedback, instantly.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="floating-card p-10 max-w-lg mx-auto relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-sora font-bold text-sm">
                  LIFETIME DEAL
                </span>
              </div>
              
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <div className="flex items-baseline justify-center space-x-6">
                    <div className="text-center">
                      <div className="text-5xl font-sora font-bold text-foreground">$5</div>
                      <div className="text-muted-foreground">USD</div>
                    </div>
                    <div className="text-muted-foreground text-2xl">/</div>
                    <div className="text-center">
                      <div className="text-5xl font-sora font-bold text-foreground">₹430</div>
                      <div className="text-muted-foreground">INR</div>
                    </div>
                  </div>
                  <p className="text-purple-600 font-semibold text-lg">One-time payment, lifetime access</p>
                </div>

                <div className="space-y-4">
                  {[
                    "Up to 1,000 resume roasts",
                    "Unlimited roast modes",
                    "All customization features", 
                    "Instant access to new features",
                    "Chat with founder anytime"
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
                  GET LIFETIME ACCESS
                </Button>

                <p className="text-muted-foreground text-sm">
                  Easy payments with UPI, Paytm, or Card
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="font-sora font-bold text-5xl text-foreground">
                Job Seekers Love Rezoome
              </h2>
              <p className="text-xl text-muted-foreground">
                See what people are saying about their roasts
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  text: "Got roasted so hard I rewrote my entire resume. Landed 3 interviews the next week! The ATS score was eye-opening 🔥",
                  author: "Sarah M., Marketing Manager",
                  score: "ATS Score: 89/100"
                },
                {
                  text: "Hilarious roast but genuinely helpful feedback. The founder even replied to my DM with extra tips. Got my dream job!",
                  author: "Raj K., Software Engineer",
                  score: "ATS Score: 76/100"
                },
                {
                  text: "Best $5 I've spent on my career. The roast was brutal but fair, and the improvements actually worked!",
                  author: "Jessica L., Designer",
                  score: "ATS Score: 82/100"
                }
              ].map((testimonial, index) => (
                <div key={index} className="floating-card p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic text-lg">"{testimonial.text}"</p>
                  <div className="space-y-2">
                    <p className="font-sora font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-purple-600 font-medium">{testimonial.score}</p>
                  </div>
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
            <h2 className="font-sora font-bold text-5xl text-white">
              Ready to Roast Your Resume?
            </h2>
            <p className="text-purple-100 text-xl">
              Join thousands of job seekers who've upgraded their resumes and landed their dream jobs
            </p>
            
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-sora font-bold text-xl py-6 px-12 rounded-2xl transition-all duration-300 hover:scale-105"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              ROAST MY RESUME
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            <p className="text-purple-200">
              First roast is free • No signup required • Instant results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


import React, { useState } from 'react';
import { Zap, Star, Users, ArrowRight, Trophy, Shield, MessageCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="font-sora font-bold text-2xl text-gray-900">
            Rezoome
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="font-sora font-medium">
              Login
            </Button>
            <Button className="gradient-purple text-white font-sora font-semibold">
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="font-sora font-bold text-5xl md:text-6xl leading-tight text-gray-900">
                Is Your Resume<br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Hire-Worthy
                </span><br />
                or Roast-Worthy?
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Instant ATS Score + a Hilarious Roast, No Signup Needed. Just Upload & Go!
              </p>
            </div>

            {/* Counter */}
            <div className="bg-purple-50 rounded-2xl p-6 inline-block">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="font-sora font-bold text-2xl text-purple-600">12,847</div>
                  <div className="text-purple-700 font-medium">Resumes Roasted</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Instant results, no signup required</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">AI-powered ATS compatibility scoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Hilarious roasts with real improvement tips</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Chat directly with founder for support</span>
              </div>
            </div>
          </div>

          {/* Right Side - Upload Form */}
          <div className="lg:pl-8">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="font-sora font-bold text-3xl text-gray-900 mb-2">
                  Try it FREE! 🔥
                </h2>
                <p className="text-gray-600 text-lg">
                  Your first roast is completely free
                </p>
              </div>

              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

              <div className="text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Your resume is processed securely and automatically deleted</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-sora font-bold text-4xl text-gray-900 mb-4">
            Lifetime Access for Everyone
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            No subscriptions. No hidden fees. Just legendary resume feedback, instantly.
          </p>

          <div className="max-w-lg mx-auto">
            <div className="floating-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-bl-2xl font-sora font-bold text-sm">
                LIFETIME DEAL
              </div>
              
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-left">
                      <div className="text-4xl font-sora font-bold text-gray-900">$5</div>
                      <div className="text-sm text-gray-500">USD</div>
                    </div>
                    <div className="text-gray-400">/</div>
                    <div className="text-left">
                      <div className="text-4xl font-sora font-bold text-gray-900">₹430</div>
                      <div className="text-sm text-gray-500">INR</div>
                    </div>
                  </div>
                  <p className="text-purple-600 font-medium">One-time payment, lifetime access</p>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">Up to 1,000 resume roasts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">Unlimited roast modes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">All customization features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">Instant access to new features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">Chat with founder anytime</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full gradient-purple text-white font-sora font-bold text-lg py-4 hover:opacity-90 transition-opacity"
                >
                  GET LIFETIME ACCESS
                </Button>

                <p className="text-sm text-gray-500">
                  Easy payments with UPI, Paytm, or Card
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-sora font-bold text-4xl text-gray-900 mb-4">
              Job Seekers Love Rezoome
            </h2>
            <p className="text-gray-600 text-lg">
              See what people are saying about their roasts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
              <div key={index} className="floating-card p-6 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="space-y-1">
                  <p className="font-sora font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-purple-600 font-medium">{testimonial.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-purple py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-sora font-bold text-4xl md:text-5xl text-white mb-6">
            Ready to Roast Your Resume?
          </h2>
          <p className="text-purple-100 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who've upgraded their resumes and landed their dream jobs
          </p>
          
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-sora font-bold text-xl py-6 px-12 rounded-2xl transition-all duration-300 hover:scale-105"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            ROAST MY RESUME
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          <p className="text-purple-200 text-sm mt-6">
            First roast is free • No signup required • Instant results
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

import React from 'react';
import { Wand2, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Rezoome 🔥
            </div>
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

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          
          {/* Main Headline */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <Flame className="h-4 w-4" />
              Brutally honest resume feedback
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Get Roasted.
              </span>
              <br />
              <span className="text-foreground">Get Hired.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find out why you're not getting callbacks. Our AI brutally analyzes your resume against any job description and tells you the hard truth.
            </p>

            <p className="text-sm text-orange-600 font-medium">
              🔥 Free roast • No sign-up required • Get it fixed instantly
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg"
              onClick={() => navigate('/roast')}
            >
              <Flame className="h-5 w-5 mr-2" />
              Roast My Resume
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* What You Get */}
          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="group text-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-orange-200 transition-all">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-lg">Shortlist Probability</h3>
              <p className="text-muted-foreground">
                Know your real chances of getting shortlisted with a realistic 0-100% score
              </p>
            </div>

            <div className="group text-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-orange-200 transition-all">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="font-semibold text-lg">Top 3 Rejection Reasons</h3>
              <p className="text-muted-foreground">
                Discover exactly why recruiters are passing on your resume
              </p>
            </div>

            <div className="group text-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-orange-200 transition-all">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-lg">One-Click Fix</h3>
              <p className="text-muted-foreground">
                Get a complete ATS-optimized rewrite tailored to the job (1 free/day)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold">How it works</h2>
              <p className="text-muted-foreground text-lg">Simple process, brutal results</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-lg">
                  1
                </div>
                <h3 className="font-semibold text-lg">Upload + Paste</h3>
                <p className="text-muted-foreground">Upload your resume and paste the job description</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-lg">
                  2
                </div>
                <h3 className="font-semibold text-lg">Get Roasted</h3>
                <p className="text-muted-foreground">See your shortlist probability, ATS score, and rejection reasons</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-lg">
                  3
                </div>
                <h3 className="font-semibold text-lg">Get Fixed</h3>
                <p className="text-muted-foreground">One-click generates a job-tailored, ATS-optimized resume</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">Simple Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Free</p>
                <p className="text-3xl font-bold">$0</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Unlimited roasts</li>
                  <li>✓ 1 fix per day</li>
                  <li>✓ TXT download</li>
                </ul>
              </div>
              
              <div className="bg-card border-2 border-orange-500 rounded-2xl p-6 space-y-3 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">Popular</span>
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">24-Hour Pass</p>
                <p className="text-3xl font-bold">$3</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Unlimited roasts</li>
                  <li>✓ Unlimited fixes</li>
                  <li>✓ TXT download</li>
                </ul>
              </div>
              
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Monthly</p>
                <p className="text-3xl font-bold">$9<span className="text-lg font-normal">/mo</span></p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Everything in Pass</li>
                  <li>✓ PDF downloads</li>
                  <li>✓ Cover letters</li>
                </ul>
              </div>
            </div>
            
            <Button 
              size="lg"
              onClick={() => navigate('/roast')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Start Free Roast
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 py-12 bg-background/80">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2024 Rezoome. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

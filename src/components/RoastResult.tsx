
import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, AlertTriangle, CheckCircle, Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoastResultProps {
  roast: string;
  atsScore: number;
  sections: {
    name: string;
    score: number;
    feedback: string;
  }[];
  onTryAgain: () => void;
}

const RoastResult: React.FC<RoastResultProps> = ({ roast, atsScore, sections, onTryAgain }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show confetti for high ATS scores
    if (atsScore >= 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [atsScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const getOverallMessage = (score: number) => {
    if (score >= 80) return "🎉 Your resume is hire-worthy! ATS bots will love it!";
    if (score >= 60) return "⚡ Good foundation, but needs some tweaks to beat the bots";
    return "🚨 Time for a resume makeover! The bots are not impressed";
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="h-32 w-32 text-purple-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Overall Score Banner */}
      <div className={`floating-card p-8 text-center ${getScoreBgColor(atsScore)} border-2`}>
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span className={`text-5xl font-sora font-bold ${getScoreColor(atsScore)}`}>
              {atsScore}/100
            </span>
          </div>
          <h2 className="font-sora font-bold text-2xl text-gray-900">
            ATS Compatibility Score
          </h2>
          <p className="text-lg text-gray-700 font-medium">
            {getOverallMessage(atsScore)}
          </p>
        </div>
      </div>

      {/* Roast Section */}
      <div className="floating-card p-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center mb-6">
          <h2 className="font-sora font-bold text-3xl text-gray-900 mb-2">
            🔥 Your Resume Roast
          </h2>
          <p className="text-purple-600 font-medium text-lg">Brutally honest feedback with a side of humor</p>
        </div>
        
        <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-sm">
          <p className="text-lg leading-relaxed text-gray-800 font-medium">
            {roast}
          </p>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="floating-card p-8">
        <div className="text-center mb-8">
          <h2 className="font-sora font-bold text-3xl text-gray-900 mb-2">
            🤖 Section-by-Section Analysis
          </h2>
          <p className="text-gray-600 text-lg">Here's how each part of your resume performs</p>
        </div>

        <div className="grid gap-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`${getScoreColor(section.score)}`}>
                    {getScoreIcon(section.score)}
                  </div>
                  <span className="font-sora font-bold text-lg text-gray-900">
                    {section.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-xl ${getScoreColor(section.score)}`}>
                    {section.score}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">/100</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{section.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onTryAgain}
            variant="outline"
            size="lg"
            className="font-sora font-bold py-4 px-8 text-lg border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            ROAST ANOTHER RESUME
          </Button>
          
          <Button
            size="lg"
            className="gradient-purple text-white font-sora font-bold py-4 px-8 text-lg hover:opacity-90"
          >
            <Download className="mr-2 h-5 w-5" />
            DOWNLOAD REPORT
          </Button>
        </div>

        {/* Upgrade CTA */}
        <div className="floating-card p-8 bg-gradient-to-r from-purple-100 to-pink-100 text-center">
          <div className="space-y-4">
            <h3 className="font-sora font-bold text-2xl text-gray-900">
              Want Unlimited Roasts? 🚀
            </h3>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              Get lifetime access to unlimited resume roasts, all customization features, 
              and chat directly with our founder for just $5 (₹430)
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span>1,000+ roasts included</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span>No monthly fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span>Founder support</span>
              </div>
            </div>
            
            <Button 
              size="lg"
              className="gradient-purple text-white font-sora font-bold text-xl py-4 px-12 hover:opacity-90"
            >
              GET LIFETIME ACCESS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoastResult;

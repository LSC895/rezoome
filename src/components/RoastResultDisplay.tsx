import React from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  Target, 
  Zap,
  XCircle,
  CheckCircle,
  TrendingDown,
  FileWarning,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { RoastResult as RoastResultType } from '@/hooks/useRoast';

interface RoastResultProps {
  roast: RoastResultType;
  onGetFix: () => void;
  onTryAgain: () => void;
}

const RoastResultDisplay: React.FC<RoastResultProps> = ({ roast, onGetFix, onTryAgain }) => {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'APPLY': return 'bg-green-500';
      case "DON'T APPLY": return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'APPLY': return <ThumbsUp className="h-6 w-6" />;
      case "DON'T APPLY": return <ThumbsDown className="h-6 w-6" />;
      default: return <AlertCircle className="h-6 w-6" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'brutal': return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">🔥 Brutal</span>;
      case 'harsh': return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">⚠️ Harsh</span>;
      default: return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">💡 Mild</span>;
    }
  };

  const sectionIcons: Record<string, React.ReactNode> = {
    summary: <FileWarning className="h-5 w-5" />,
    skills: <Layers className="h-5 w-5" />,
    experience: <Target className="h-5 w-5" />,
    projects: <Zap className="h-5 w-5" />,
    formatting: <CheckCircle className="h-5 w-5" />
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Verdict Banner */}
      <div className={`${getVerdictColor(roast.verdict)} text-white rounded-2xl p-6 text-center`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          {getVerdictIcon(roast.verdict)}
          <span className="text-3xl font-bold">{roast.verdict}</span>
        </div>
        <p className="text-white/90">{roast.verdict_reason}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5 text-center">
          <p className={`text-4xl font-bold ${getScoreColor(roast.shortlist_probability)}`}>
            {roast.shortlist_probability}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Shortlist Probability</p>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(roast.shortlist_probability)} transition-all`}
              style={{ width: `${roast.shortlist_probability}%` }}
            />
          </div>
        </div>
        
        <div className="bg-card border rounded-xl p-5 text-center">
          <p className={`text-4xl font-bold ${getScoreColor(roast.ats_score)}`}>
            {roast.ats_score}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">ATS Score</p>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(roast.ats_score)} transition-all`}
              style={{ width: `${roast.ats_score}%` }}
            />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 text-center col-span-2 md:col-span-1">
          <p className={`text-4xl font-bold ${getScoreColor(roast.keyword_match_percent)}`}>
            {roast.keyword_match_percent}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Keyword Match</p>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(roast.keyword_match_percent)} transition-all`}
              style={{ width: `${roast.keyword_match_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 3 Rejection Reasons */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Top 3 Reasons Recruiters Will Reject This
        </h3>
        <div className="space-y-3">
          {roast.top_3_rejection_reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <p className="text-red-900">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Roast */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
        <h3 className="font-bold text-lg text-orange-800 mb-2">🔥 The Brutal Truth</h3>
        <p className="text-orange-900 leading-relaxed">{roast.overall_roast}</p>
      </div>

      {/* Section-by-Section Analysis */}
      <div className="space-y-4">
        <h3 className="font-bold text-xl">Section Analysis</h3>
        
        {Object.entries(roast.sections).map(([key, section]) => (
          <div key={key} className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {sectionIcons[key]}
                <h4 className="font-semibold capitalize">{key}</h4>
              </div>
              <div className="flex items-center gap-2">
                {section.severity && getSeverityBadge(section.severity)}
                <span className={`font-bold ${getScoreColor(section.score)}`}>
                  {section.score}/100
                </span>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-3">{section.roast}</p>
            
            {/* Missing Skills */}
            {section.missing_skills && section.missing_skills.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-red-600 mb-2">Missing Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {section.missing_skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Bullets */}
            {section.weak_bullets && section.weak_bullets.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-orange-600 mb-2">Weak Bullets to Fix:</p>
                <ul className="space-y-1">
                  {section.weak_bullets.slice(0, 3).map((bullet, i) => (
                    <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatting Issues */}
            {section.issues && section.issues.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-yellow-600 mb-2">Issues Found:</p>
                <ul className="space-y-1">
                  {section.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Keyword Gaps */}
      {roast.keyword_gaps.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg text-blue-800 mb-3">Missing Keywords from JD</h3>
          <div className="flex flex-wrap gap-2">
            {roast.keyword_gaps.map((keyword, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* JD Mismatch */}
      <div className="grid md:grid-cols-2 gap-4">
        {roast.jd_mismatch.missing_requirements.length > 0 && (
          <div className="bg-card border rounded-xl p-5">
            <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Missing Requirements
            </h4>
            <ul className="space-y-2">
              {roast.jd_mismatch.missing_requirements.map((req, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {roast.jd_mismatch.irrelevant_content.length > 0 && (
          <div className="bg-card border rounded-xl p-5">
            <h4 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Irrelevant Content
            </h4>
            <ul className="space-y-2">
              {roast.jd_mismatch.irrelevant_content.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-2">Ready to Fix This Resume?</h3>
        <p className="text-white/80 mb-6">
          Get a complete ATS-optimized rewrite tailored to this job description
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onGetFix}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold"
          >
            <Zap className="h-5 w-5 mr-2" />
            Fix My Resume
          </Button>
          <Button 
            onClick={onTryAgain}
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/10"
          >
            Try Another Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoastResultDisplay;

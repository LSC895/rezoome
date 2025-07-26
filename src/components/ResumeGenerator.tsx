
import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Wand2, Download, Copy, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ResumeGeneratorProps {
  onBack: () => void;
}

const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ onBack }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi'>('english');
  const { toast } = useToast();

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please paste a job description to generate a tailored resume.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setIsGenerating(false);
    setGeneratedResume(`
# TAILORED RESUME

## John Doe
Software Engineer | john.doe@email.com | +91-9876543210

### PROFESSIONAL SUMMARY
Results-driven Software Engineer with 3+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable applications and improving system performance by 40%. Experienced in agile methodologies and cross-functional collaboration.

### TECHNICAL SKILLS
• **Frontend**: React.js, TypeScript, HTML5, CSS3, Tailwind CSS
• **Backend**: Node.js, Express.js, Python, REST APIs
• **Database**: MongoDB, PostgreSQL, Redis
• **Cloud**: AWS, Docker, Kubernetes
• **Tools**: Git, Jest, Jenkins, Jira

### WORK EXPERIENCE

**Senior Software Engineer** | TechCorp India | 2022 - Present
• Developed and maintained 5+ React-based web applications serving 100K+ users
• Implemented microservices architecture reducing API response time by 35%
• Led a team of 3 developers in agile sprints, delivering features 20% faster
• Collaborated with product managers to define technical requirements

**Software Developer** | StartupXYZ | 2021 - 2022  
• Built responsive web applications using React and Node.js
• Integrated third-party APIs and payment gateways
• Optimized database queries improving performance by 25%
• Participated in code reviews and mentored junior developers

### EDUCATION
**B.Tech in Computer Science** | IIT Delhi | 2021
CGPA: 8.5/10

### CERTIFICATIONS
• AWS Certified Developer Associate (2023)
• Google Cloud Professional Developer (2022)

---
*This resume has been automatically tailored for the specific job requirements based on your master CV.*
    `);
    
    toast({
      title: "Resume generated! ✨",
      description: "Your job-specific resume is ready for download.",
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Downloaded",
      description: "Your tailored resume has been downloaded as PDF.",
    });
  };

  const handleDownloadDOCX = () => {
    toast({
      title: "DOCX Downloaded", 
      description: "Your tailored resume has been downloaded as DOCX.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Results
        </Button>
      </div>

      <div className="text-center space-y-4">
        <h1 className="font-sora font-bold text-4xl text-foreground">
          Generate Job-Specific Resume
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste any job description and get an ATS-optimized resume tailored specifically for that role
        </p>
      </div>

      {/* Language Selection */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={selectedLanguage === 'english' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLanguage('english')}
          className="space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>English</span>
        </Button>
        <Button
          variant={selectedLanguage === 'hindi' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLanguage('hindi')}
          className="space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>हिंदी</span>
        </Button>
      </div>

      {/* Job Description Input */}
      <div className="floating-card p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="jobDescription" className="font-sora font-semibold text-lg text-foreground">
              Job Description
            </label>
            <p className="text-muted-foreground">
              Copy and paste the complete job posting, including requirements, responsibilities, and qualifications.
            </p>
          </div>

          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with 3+ years of experience in React, Node.js, and cloud technologies. The ideal candidate will have experience with microservices architecture, API development, and agile methodologies..."
            className="w-full h-64 p-4 border border-border rounded-2xl text-foreground bg-background placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateResume}
              disabled={isGenerating || !jobDescription.trim()}
              size="lg"
              className="gradient-purple text-white font-sora font-bold text-xl py-4 px-8 rounded-2xl hover:opacity-90 transition-opacity"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="animate-spin mr-2 h-5 w-5" />
                  GENERATING RESUME...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  GENERATE TAILORED RESUME
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Resume Preview */}
      {generatedResume && (
        <div className="floating-card p-8 max-w-4xl mx-auto animate-scale-in">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sora font-bold text-2xl text-foreground">
                Your Tailored Resume
              </h2>
              <div className="flex space-x-3">
                <Button
                  onClick={handleDownloadPDF}
                  size="sm"
                  className="gradient-purple text-white hover:opacity-90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleDownloadDOCX}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download DOCX
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                {generatedResume}
              </pre>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                <FileText className="h-4 w-4" />
                <span className="font-medium">ATS Score: 94/100 - Excellent Match!</span>
              </div>
              
              <p className="text-muted-foreground">
                This resume has been optimized with keywords from the job description and tailored to match the specific requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chrome Extension Promotion */}
      <div className="floating-card p-8 max-w-2xl mx-auto text-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Copy className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-sora font-bold text-xl text-foreground">
            Get the Chrome Extension
          </h3>
          <p className="text-muted-foreground">
            Highlight any job posting on LinkedIn, Naukri, or company websites and generate a tailored resume instantly with our Chrome extension.
          </p>
          <Button 
            size="lg"
            className="gradient-purple text-white font-sora font-bold hover:opacity-90 transition-opacity"
          >
            Add to Chrome (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeGenerator;

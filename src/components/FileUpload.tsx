
import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi'>('english');
  const [roastPersonality, setRoastPersonality] = useState<'professional' | 'memer' | 'motivational' | 'hr'>('professional');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleRoast = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  if (selectedFile) {
    return (
      <div className="floating-card p-8 animate-scale-in max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-sora font-semibold text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to roast
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <label className="font-sora font-medium text-foreground">Choose Language</label>
            <div className="flex space-x-3">
              <Button
                variant={selectedLanguage === 'english' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage('english')}
                className="flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span>English</span>
              </Button>
              <Button
                variant={selectedLanguage === 'hindi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage('hindi')}
                className="flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span>हिंदी</span>
              </Button>
            </div>
          </div>

          {/* Roast Personality Selection */}
          <div className="space-y-3">
            <label className="font-sora font-medium text-foreground">Choose Roast Style</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'professional', label: 'Professional' },
                { key: 'memer', label: 'Memer' },
                { key: 'motivational', label: 'Motivational' },
                { key: 'hr', label: 'HR Expert' }
              ] as const).map(({ key, label }) => (
                <Button
                  key={key}
                  variant={roastPersonality === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoastPersonality(key)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            onClick={handleRoast}
            disabled={isLoading}
            size="lg"
            className="w-full gradient-purple text-white font-sora font-bold py-4 text-lg hover:opacity-90 transition-opacity rounded-2xl"
          >
            {isLoading ? (
              <>
                <Sparkles className="animate-spin mr-2 h-5 w-5" />
                ROASTING YOUR RESUME...
              </>
            ) : (
              <>
                ROAST MY RESUME 🔥
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Get instant ATS score + {selectedLanguage === 'hindi' ? 'Hindi' : 'English'} roast in {roastPersonality} style
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`floating-card p-12 border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-purple-400 bg-purple-50 scale-105' 
            : 'border-border hover:border-purple-300 hover:bg-muted/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="text-center space-y-6">
          <div className={`${isDragOver ? 'animate-bounce' : ''}`}>
            <Upload className={`h-16 w-16 mx-auto ${isDragOver ? 'text-purple-600' : 'text-muted-foreground'}`} />
          </div>
          
          <div className="space-y-3">
            <h3 className="font-sora font-bold text-2xl text-foreground">
              Drop Your Resume Here
            </h3>
            <p className="text-muted-foreground text-lg">
              or <span className="text-purple-600 font-semibold underline">browse files</span>
            </p>
            
            <div className="space-y-2 pt-4">
              <p className="text-sm text-muted-foreground">
                PDF files only • Max 10MB
              </p>
              <p className="text-purple-600 font-semibold text-sm">
                First roast is completely FREE!
              </p>
              <p className="text-muted-foreground text-xs">
                Supports English & Hindi • Multiple roast personalities
              </p>
            </div>
          </div>
        </div>
        
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUpload;


import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  if (selectedFile) {
    return (
      <div className="floating-card p-8 animate-scale-in max-w-md mx-auto">
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
          
          <Button
            onClick={() => onFileSelect(selectedFile)}
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
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
                Your first roast is completely FREE!
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

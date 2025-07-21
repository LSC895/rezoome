
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
      <div className="floating-card p-8 text-center animate-scale-in">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <FileText className="h-10 w-10 text-purple-600" />
          <div className="text-left">
            <p className="font-sora font-semibold text-gray-900 text-lg">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to roast
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Button
          onClick={() => onFileSelect(selectedFile)}
          disabled={isLoading}
          size="lg"
          className="w-full gradient-purple text-white font-sora font-bold py-4 text-lg hover:opacity-90 transition-opacity"
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
    );
  }

  return (
    <div
      className={`floating-card p-12 border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragOver 
          ? 'border-purple-400 bg-purple-50 scale-105' 
          : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className="text-center">
        <div className={`relative mb-6 ${isDragOver ? 'animate-bounce' : ''}`}>
          <Upload className={`h-16 w-16 mx-auto ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`} />
          {isDragOver && (
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
          )}
        </div>
        
        <h3 className="font-sora font-bold text-2xl text-gray-900 mb-3">
          Drop Your Resume Here
        </h3>
        <p className="text-gray-600 text-lg mb-6">
          or <span className="text-purple-600 font-semibold underline">browse files</span>
        </p>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            PDF files only • Max 10MB
          </p>
          <p className="text-xs text-purple-600 font-medium">
            Your first roast is completely FREE!
          </p>
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
  );
};

export default FileUpload;

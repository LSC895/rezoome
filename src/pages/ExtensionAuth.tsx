import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExtensionAuth = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to your Rezoome account to connect the Chrome extension.
        </p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="fire-gradient text-primary-foreground"
        >
          Go to Rezoome
        </Button>
      </div>
    </div>
  );
};

export default ExtensionAuth;

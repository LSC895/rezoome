import { useState, useEffect } from 'react';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
}

export const useContactExtraction = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: '',
    linkedin: ''
  });

  const extractContactInfo = (resumeText: string): ContactInfo => {
    const extracted: ContactInfo = {
      name: '',
      phone: '',
      email: '',
      linkedin: ''
    };

    // Extract email
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      extracted.email = emailMatch[0];
    }

    // Extract phone number (various formats)
    const phoneMatch = resumeText.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|(?:\+?91[-.\s]?)?[0-9]{10}/);
    if (phoneMatch) {
      extracted.phone = phoneMatch[0];
    }

    // Extract LinkedIn URL
    const linkedinMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?/);
    if (linkedinMatch) {
      extracted.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
    }

    // Extract name (typically first line or after "Name:" or similar)
    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for name patterns
    for (const line of lines.slice(0, 10)) { // Check first 10 lines
      // Skip common headers and labels
      if (line.toLowerCase().includes('resume') || 
          line.toLowerCase().includes('cv') || 
          line.toLowerCase().includes('curriculum') ||
          line.toLowerCase().includes('professional') ||
          line.toLowerCase().includes('summary') ||
          line.includes('@') ||
          /^\+?[\d\s\-\(\)]+$/.test(line)) {
        continue;
      }
      
      // Check if line looks like a name (2-4 words, starts with capital, no numbers)
      const namePattern = /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}$/;
      if (namePattern.test(line) && line.length < 50) {
        extracted.name = line;
        break;
      }
    }

    return extracted;
  };

  const updateContactInfo = (info: Partial<ContactInfo>) => {
    setContactInfo(prev => ({ ...prev, ...info }));
  };

  return {
    contactInfo,
    setContactInfo,
    extractContactInfo,
    updateContactInfo
  };
};
// Background script for Rezoome Chrome Extension

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateResume",
    title: "Generate Resume with Rezoome",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateResume") {
    // Send message to content script to extract job description
    chrome.tabs.sendMessage(tab.id, {
      action: "extractJobDescription",
      selectedText: info.selectionText
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateResumeFromExtension") {
    handleResumeGeneration(request.jobDescription, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "openPopup") {
    // Open popup with job description
    chrome.action.openPopup();
  }
});

async function handleResumeGeneration(jobDescription, sendResponse) {
  try {
    // Get stored authentication credentials - require proper setup
    const result = await chrome.storage.sync.get(['authToken', 'sessionId', 'supabaseKey']);
    
    if (!result.authToken || !result.sessionId || !result.supabaseKey) {
      sendResponse({
        success: false,
        error: "Please authenticate first via the Rezoome web app"
      });
      return;
    }

    // Call Supabase edge function with stored credentials
    const response = await fetch('https://wmqtvnurwoispusqlsgw.supabase.co/functions/v1/generate-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': result.supabaseKey // Use stored key, not hardcoded
      },
      body: JSON.stringify({
        job_description: jobDescription,
        session_id: result.sessionId,
        original_resume: result.masterResume || ''
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Store generated resume temporarily
    await chrome.storage.local.set({
      generatedResume: data.resume,
      lastGenerated: Date.now()
    });

    sendResponse({
      success: true,
      resume: data.resume
    });

  } catch (error) {
    console.error('Resume generation failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to generate resume'
    });
  }
}

// Clean up old generated resumes (every hour)
chrome.alarms.create('cleanup', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    chrome.storage.local.get(['lastGenerated'], (result) => {
      if (result.lastGenerated && Date.now() - result.lastGenerated > 24 * 60 * 60 * 1000) {
        chrome.storage.local.remove(['generatedResume', 'lastGenerated']);
      }
    });
  }
});
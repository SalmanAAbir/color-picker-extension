// Background script to handle color picking when popup is closed

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// Check if offscreen document exists
async function hasOffscreenDocument() {
  const clients = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  return clients.length > 0;
}

// Create offscreen document
async function createOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }
  
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['USER_MEDIA'],
    justification: 'Using EyeDropper API to pick colors'
  });
}

// Close offscreen document
async function closeOffscreenDocument() {
  if (!(await hasOffscreenDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startColorPick') {
    // Create offscreen document and trigger color picking
    createOffscreenDocument().then(() => {
      // Signal the offscreen document to start picking
      chrome.storage.local.set({ startColorPick: true });
      sendResponse({ success: true });
    }).catch((err) => {
      console.error('Error creating offscreen document:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'colorSelected' && message.color) {
    // Color was selected, store it and close offscreen document
    chrome.storage.local.set({ 
      lastSelectedColor: message.color
    });
    closeOffscreenDocument();
    return false;
  }
  
  if (message.error) {
    // Error occurred, close offscreen document
    closeOffscreenDocument();
    return false;
  }
  
  return false;
});


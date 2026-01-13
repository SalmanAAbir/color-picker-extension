// Background service worker to handle offscreen document and popup management

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// Check if offscreen document already exists
async function hasOffscreenDocument() {
  const clients = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  return clients.length > 0;
}

// Create offscreen document if it doesn't exist
async function setupOffscreenDocument() {
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

// Handle messages from popup to start color picking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle request to start color picking from popup
  if (message.action === 'startColorPick') {
    setupOffscreenDocument().then(() => {
      sendResponse({ success: true });
    }).catch((err) => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep the message channel open for async response
  }
  
  // Handle messages from offscreen document (these don't need response)
  if (message.success && message.color) {
    // Color was selected successfully
    chrome.storage.local.set({ 
      lastSelectedColor: message.color
    }, async () => {
      await closeOffscreenDocument();
      // Try to reopen popup (may fail, but user can click icon to see result)
      try {
        await chrome.action.openPopup();
      } catch (err) {
        // Popup can't be opened programmatically - user will click icon to see result
        console.log('Color saved. Click extension icon to see result.');
      }
    });
    return false; // No response needed
  } else if (message.cancelled) {
    // User cancelled
    closeOffscreenDocument();
    return false;
  } else if (message.error && !message.action) {
    // Error occurred (make sure it's not from popup)
    chrome.storage.local.set({ 
      errorMessage: message.error 
    }, async () => {
      await closeOffscreenDocument();
      try {
        await chrome.action.openPopup();
      } catch (err) {
        console.log('Error saved. Click extension icon to see error.');
      }
    });
    return false;
  }
  
  return false;
});


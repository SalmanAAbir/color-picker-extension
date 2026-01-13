// Offscreen document to handle EyeDropper API

let isPicking = false;

async function pickColor() {
  if (isPicking) return;
  isPicking = true;
  
  try {
    // Wait a moment to ensure document is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!window.EyeDropper) {
      chrome.runtime.sendMessage({ 
        error: 'EyeDropper API not supported' 
      });
      isPicking = false;
      return;
    }

    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    
    if (result && result.sRGBHex) {
      chrome.runtime.sendMessage({ 
        action: 'colorSelected',
        color: result.sRGBHex 
      });
    }
    isPicking = false;
  } catch (err) {
    isPicking = false;
    if (err.name !== 'AbortError') {
      chrome.runtime.sendMessage({ 
        error: err.message || 'Failed to pick color' 
      });
    }
    // User cancelled - do nothing
  }
}

// Listen for storage changes to trigger picking (when background creates this document)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.startColorPick && changes.startColorPick.newValue) {
    chrome.storage.local.remove(['startColorPick']);
    pickColor();
  }
});

// Check if we should start immediately (in case storage was set before document loaded)
chrome.storage.local.get(['startColorPick'], (result) => {
  if (result.startColorPick) {
    chrome.storage.local.remove(['startColorPick']);
    // Wait for document to be ready
    setTimeout(() => {
      pickColor();
    }, 200);
  }
});


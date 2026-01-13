// Offscreen document script to handle EyeDropper API
// This runs in a hidden document that can use the EyeDropper API

async function pickColor() {
  try {
    if (!window.EyeDropper) {
      chrome.runtime.sendMessage({ error: 'EyeDropper API not supported' });
      return;
    }

    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    
    if (result && result.sRGBHex) {
      // Send the selected color back to the extension
      chrome.runtime.sendMessage({ 
        success: true, 
        color: result.sRGBHex 
      });
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // User cancelled - send cancellation message
      chrome.runtime.sendMessage({ cancelled: true });
    } else {
      // Error occurred
      chrome.runtime.sendMessage({ 
        error: err.message || 'Failed to pick color' 
      });
    }
  }
}

// Start picking color when offscreen document loads
pickColor();


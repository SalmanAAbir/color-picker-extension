// Color conversion utilities
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// DOM elements
const pickColorBtn = document.getElementById('pickColorBtn');
const colorPreview = document.getElementById('colorPreview');
const colorValue = document.getElementById('colorValue');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');
const hslValue = document.getElementById('hslValue');
const historyGrid = document.getElementById('historyGrid');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const copyButtons = document.querySelectorAll('.copy-btn');
const toast = document.getElementById('toast');

// Load color history from storage
function loadHistory() {
  chrome.storage.local.get(['colorHistory'], (result) => {
    const history = result.colorHistory || [];
    displayHistory(history);
  });
}

// Save color to history
function saveToHistory(color) {
  chrome.storage.local.get(['colorHistory'], (result) => {
    let history = result.colorHistory || [];
    // Remove if already exists (to move to front)
    history = history.filter(c => c !== color);
    // Add to beginning
    history.unshift(color);
    // Keep only last 18 colors (3 rows of 6)
    history = history.slice(0, 18);
    chrome.storage.local.set({ colorHistory: history }, () => {
      displayHistory(history);
    });
  });
}

// Display color history
function displayHistory(history) {
  historyGrid.innerHTML = '';
  history.forEach(color => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.setProperty('--history-color', color);
    item.title = color;
    item.addEventListener('click', () => {
      setColor(color);
    });
    historyGrid.appendChild(item);
  });
}

// Set the displayed color
function setColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    console.error('Invalid color:', hexColor);
    return;
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Update preview - remove no-color message if exists
  const noColorMsg = colorPreview.querySelector('.no-color');
  if (noColorMsg) {
    noColorMsg.remove();
  }
  colorPreview.style.setProperty('--current-color', hexColor);

  // Update values
  const hexUpper = hexColor.toUpperCase();
  colorValue.textContent = hexUpper;
  hexValue.textContent = hexUpper;
  rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  hslValue.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  // Save to history
  saveToHistory(hexColor);
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy');
  });
}

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// Pick color using EyeDropper API via offscreen document
pickColorBtn.addEventListener('click', async () => {
  // Send message to background script to start color picking
  chrome.runtime.sendMessage({ action: 'startColorPick' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
      showToast('Failed to start color picker');
      return;
    }
    
    // Close the popup after starting the color picker
    // The popup will reopen automatically after color selection, or user can click icon again
    setTimeout(() => {
      window.close();
    }, 100);
  });
});

// Copy button handlers
copyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const format = btn.dataset.format;
    let text = '';

    switch (format) {
      case 'hex':
        text = hexValue.textContent;
        break;
      case 'rgb':
        text = rgbValue.textContent;
        break;
      case 'hsl':
        text = hslValue.textContent;
        break;
    }

    if (text && text !== '--') {
      copyToClipboard(text);
    }
  });
});

// Clear history
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    chrome.storage.local.set({ colorHistory: [] }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error clearing history:', chrome.runtime.lastError);
        showToast('Failed to clear history');
      } else {
        displayHistory([]);
        showToast('History cleared');
      }
    });
  });
}

// Check for selected color when popup opens
function checkForSelectedColor() {
  chrome.storage.local.get(['lastSelectedColor', 'errorMessage'], (result) => {
    if (result.errorMessage) {
      showToast(result.errorMessage);
      chrome.storage.local.remove(['errorMessage']);
    } else if (result.lastSelectedColor) {
      setColor(result.lastSelectedColor);
      chrome.storage.local.remove(['lastSelectedColor']);
    }
  });
}

// Initialize
loadHistory();
checkForSelectedColor();


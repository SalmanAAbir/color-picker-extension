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
    history = history.filter(c => c !== color);
    history.unshift(color);
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

  // Update preview
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

// Pick color using EyeDropper API
pickColorBtn.addEventListener('click', async () => {
  try {
    // Check if EyeDropper API is available
    if (!window.EyeDropper) {
      showToast('EyeDropper API not supported. Please use Chrome 95+');
      return;
    }

    // Update button to show picking state
    pickColorBtn.disabled = true;
    pickColorBtn.textContent = 'Picking...';

    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    
    if (result && result.sRGBHex) {
      setColor(result.sRGBHex);
    }
  } catch (err) {
    // User cancelled or error occurred
    if (err.name !== 'AbortError') {
      console.error('Error picking color:', err);
      showToast('Failed to pick color');
    }
  } finally {
    // Reset button
    pickColorBtn.disabled = false;
    pickColorBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      Pick Color
    `;
  }
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


// Initialize - no need to check for stored colors on open

// Initialize
loadHistory();

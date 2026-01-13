# Color Picker Chrome Extension

A beautiful and modern Chrome extension for picking colors from anywhere on your screen.

## Features

- 🎨 **EyeDropper Tool**: Pick colors directly from any webpage or screen element
- 📋 **Multiple Formats**: View colors in HEX, RGB, and HSL formats
- 📝 **Copy to Clipboard**: One-click copy for any color format
- 📚 **Color History**: Keep track of recently picked colors (up to 18 colors)
- 🎯 **Modern UI**: Beautiful gradient design with smooth animations

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `color-picker-extension` folder
6. The extension icon should now appear in your Chrome toolbar

## Usage

1. Click the Color Picker extension icon in your Chrome toolbar
2. Click the "Pick Color" button
3. Move your cursor over any color on the screen
4. Click to select the color
5. The color will be displayed with all format options
6. Click the copy icon next to any format to copy it to your clipboard
7. Previously picked colors are saved in the history section

## Browser Compatibility

- Requires Chrome 95+ (EyeDropper API support)
- Works on Chromium-based browsers (Edge, Brave, etc.)

## Files Structure

```
color-picker-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.css          # Styling
├── popup.js           # Main functionality
├── icons/             # Extension icons (you'll need to add these)
└── README.md          # This file
```

## Adding Icons

To complete the extension setup, you'll need to add icon files:
- `icons/icon16.png` (16x16 pixels)
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

You can create these icons or use any image editing tool to generate them. The icons should represent a color picker or eyedropper tool.

## Permissions

This extension only requires the `activeTab` permission, which allows it to use the EyeDropper API when you interact with the extension.

## License

MIT License - feel free to use and modify as needed!

# color-picker-extension

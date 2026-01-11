# 🦢 SWAN: Swagger Navigator

> **Enhanced navigation for Swagger UI with starred routes, powerful search, and a sticky sidebar**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?logo=google-chrome)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/shri-path/swan)
[![License](https://img.shields.io/badge/license-MIT-green.svg)]([LICENSE](https://github.com/shri-path/swan#MIT-1-ov-file))
[![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/)

Transform your Swagger UI experience with professional-grade navigation tools. Perfect for developers working with large API specifications.

![Swagger Navigator Demo](https://via.placeholder.com/800x450/1a1a2e/20d9d2?text=Swagger+Navigator+Demo)

---

## Features

### Core Features

- ** Sticky Sidebar Navigation** - Always-visible sidebar organized by API tags
- ** Starred Routes** - Bookmark your favorite endpoints with persistent storage
- ** Powerful Search** - Real-time filtering by path, method, summary, or operation ID
- ** Keyboard Shortcuts** - `Cmd/Ctrl + Shift + K` to instantly focus search
- ** Color-Coded Methods** - Visual distinction for GET, POST, PUT, DELETE, PATCH, etc.
- ** Smooth Scrolling** - Beautiful teal highlight animation when jumping to routes
- ** Persistent Storage** - Starred routes sync across browser sessions and devices
- ** Tag Descriptions** - View helpful context inside expanded tag panels
- ** Auto-Detection** - Automatically activates on any Swagger UI page(and only on Swagger UI)

### UI Highlights

- Clean, developer friendly dark theme
- Non-intrusive design, doesn't break the Swagger UI
- Collapsible sidebar, minimze it for more screen space
- Responsive design, works on all screen sizes
- Accessibility-friendly, keyboard navigation

---

## Screenshots

<details>
<summary>View Screenshots</summary>

### Main Navigation
![Main View](https://via.placeholder.com/800x500/1a1a2e/20d9d2?text=Main+Navigation+View)

### Search in Action
![Search Feature](https://via.placeholder.com/800x500/1a1a2e/20d9d2?text=Real-time+Search)

### Starred Routes
![Starred Routes](https://via.placeholder.com/800x500/1a1a2e/20d9d2?text=Starred+Routes+Section)

### Route Highlighting
![Highlight Animation](https://via.placeholder.com/800x500/1a1a2e/20d9d2?text=Teal+Highlight+Effect)

</details>

---

## Quick Start

### Installation (Chrome Web Store)

1. Visit [Chrome Web Store](#) (coming soon)
2. Click "Add to Chrome"
3. Navigate to any Swagger UI page
4. Enjoy enhanced navigation!

### Installation (Local Development)

```bash
# Clone the repository
git clone https://github.com/shri-path/swan.git
cd swan

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the project folder
```

### Test It Out

Try it on these public Swagger UIs:
- [Petstore v2](https://petstore.swagger.io/)
- [Petstore v3](https://petstore3.swagger.io/)
- Your own Swagger UI documentation

---

## Usage Guide / How To

### Starring Routes

1. Navigate to any Swagger UI page
2. Hover over any route to see the ⭐ star icon
3. Click to star/unstar
4. Starred routes appear in the "Starred Routes" section at the top
5. Your stars persist across browser sessions

### Searching Routes

1. Click the search box (or press `Cmd/Ctrl + Shift + K`)
2. Type to search by:
   - Path: `/users`, `/api/products`
   - HTTP method: `GET`, `POST`, `DELETE`
   - Summary text
   - Operation ID
3. Results filter in real-time
4. Click any result to jump to that route

### Navigating Tags

1. Expand any tag to see its routes
2. Click the tag header to view its description
3. Click any route to scroll to it in Swagger UI
4. Route highlights with a beautiful teal animation

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + K` | Focus search input |
| `Escape` | Clear search |
| `Tab` | Navigate between elements |

---

## Development

### Prerequisites

- Node.js 14+ and npm
- Chrome/Edge/Brave browser
- Basic knowledge of Chrome Extensions

### Setup

```bash
# Install dependencies
npm install

# Available commands
npm run build          # Build production version with minification
npm run build:quick    # Build without minification (faster)
npm run package        # Build + create Chrome Web Store ZIP
npm run clean          # Delete dist folder
```

### Project Structure

```
swan/
├── manifest.json          # Extension configuration
├── package.json           # NPM configuration
│
├── scripts/               # Source JavaScript
│   ├── storage.js         # Starred routes persistence
│   ├── dom-parser.js      # Swagger UI DOM extraction
│   ├── sidebar-ui.js      # Sidebar rendering
│   ├── mutation-handler.js # DOM change detection
│   └── content-script.js  # Main entry point
│
├── styles/                # Source CSS
│   └── sidebar.css        # Complete styling
│
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── build-tools/           # Build scripts
    ├── build.js           # Minification
    └── package.js         # Packaging


```

### Making Changes

1. Edit source files in `scripts/` or `styles/`
2. Test locally: Load unpacked extension
3. Build: `npm run build`
4. Test built version: Load `dist/` folder
5. Package: `npm run package`

---

## Architecture

### Core Technologies

- **Vanilla JavaScript** - No framework dependencies
- **Chrome Extension Manifest V3** - Latest extension standard
- **CSS3** - Modern styling with animations
- **Chrome Storage API** - Persistent starred routes

### Browser APIs Used

- `chrome.storage.sync` - Cross-device starred routes
- `MutationObserver` - Detect Swagger UI changes
- `IntersectionObserver` - Track visible routes
- Content Scripts - DOM injection

---

## Contributing

Love contributions! Here's how you can help:

### Ways to Contribute

- Report bugs via [Issues](https://github.com/shri-path/swan/issues)
- Suggest features via [Discussions](https://github.com/shri-path/swan/issues)
- Improve documentation
- Submit pull requests

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly on multiple Swagger UIs
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use 2 spaces for indentation
- Add JSDoc comments for functions
- Follow existing code patterns
- Test on Petstore Swagger UI before submitting

---

## Troubleshooting

### Extension Not Appearing

**Solution:**
1. Verify Swagger UI is present on the page
2. Check browser console for errors (F12)
3. Try reloading the page
4. Reinstall the extension

### Stars Not Persisting

**Solution:**
1. Check Chrome Sync is enabled
2. Verify extension has storage permissions
3. Check `chrome://extensions/` for errors

### Build Fails

**Solution:**
```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

For more help, see our [Issues](https://github.com/shri-path/swan/issues) page.

---

## Support the Project

If you find this extension helpful:

- Star this repository
- Share on X
- Write a review on Chrome Web Store
- Follow me on [Github](https://github.com/shri-path)
- Let's connect on [Linkedin](https://www.linkedin.com/in/shriharipathak/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](https://developer.chrome.com/docs/extensions/mv3/) file for details.

### MIT License Summary

- Commercial use allowed
- Modification allowed
- Distribution allowed
- Private use allowed
- License and copyright notice required

---

## Acknowledgments

- Built for developers working with large API specifications
- Inspired by the need for better Swagger UI navigation
- Special thanks to the Swagger/OpenAPI community

### Built With

- [Terser](https://terser.org/) - JavaScript minification
- [CleanCSS](https://github.com/jakubpawlowicz/clean-css) - CSS minification
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/) - Browser extension platform

---

## Contact & Support

- **GitHub Issues**: [Report bugs](https://github.com/shri-path/swan/issues)
- **Discussions**: [Ask questions](https://github.com/shri-path/swan/discussions)
- **Linkedin**: [@shriharipathak](https://www.linkedin.com/in/shriharipathak/)

---

<div align="center">

**Made with ❤️ for API developers everywhere**

[⬆ Back to Top](#-swan)

</div>
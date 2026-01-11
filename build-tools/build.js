#!/usr/bin/env node

/**
 * Build Script for Swagger Navigator
 * Minifies JavaScript and CSS, copies necessary files to dist/
 */

const fs = require('fs');
const path = require('path');

// Ensure we're running from the project root
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

// Verify we're in the right place
if (!fs.existsSync('manifest.json') || !fs.existsSync('package.json')) {
  console.error('\x1b[31m Error: Must run from project root directory\x1b[0m');
  console.error('\x1b[33m Run: npm run build\x1b[0m');
  process.exit(1);
}

// Check if minification should be skipped
const skipMinify = process.argv.includes('--skip-minify');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create dist directory structure
function createDistStructure() {
  log('\n Creating dist directory structure...', 'blue');
  
  const dirs = [
    'dist',
    'dist/scripts',
    'dist/styles',
    'dist/icons'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(` ✓ Created ${dir}`, 'green');
    }
  });
}

// Copy and minify JavaScript files
async function processJavaScript() {
  log('\n📦 Processing JavaScript files...', 'blue');
  
  const jsFiles = [
    'scripts/storage.js',
    'scripts/dom-parser.js',
    'scripts/sidebar-ui.js',
    'scripts/mutation-handler.js',
    'scripts/content-script.js'
  ];

  if (skipMinify) {
    log('  ⚠️  Skipping minification (--skip-minify flag)', 'yellow');
    
    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const outputPath = path.join('dist', file);
      fs.writeFileSync(outputPath, content);
      log(`  ✓ Copied ${file}`, 'green');
    }
  } else {
    try {
      const { minify } = require('terser');
      
      for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const result = await minify(content, {
          compress: {
            drop_console: false, // Keep console logs for debugging
            dead_code: true,
            conditionals: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            if_return: true,
            join_vars: true
          },
          mangle: {
            reserved: ['StorageManager', 'DOMParser', 'SidebarUI', 'MutationHandler', 'SwaggerNavigator']
          },
          format: {
            comments: false
          }
        });

        const outputPath = path.join('dist', file);
        fs.writeFileSync(outputPath, result.code);
        
        const originalSize = (content.length / 1024).toFixed(2);
        const minifiedSize = (result.code.length / 1024).toFixed(2);
        const savings = ((1 - result.code.length / content.length) * 100).toFixed(1);
        
        log(`  ✓ Minified ${file}`, 'green');
        log(`    ${originalSize}KB → ${minifiedSize}KB (${savings}% reduction)`, 'reset');
      }
    } catch (error) {
      log(`  ✗ Error minifying JavaScript: ${error.message}`, 'red');
      log('  💡 Run "npm install" to install dependencies', 'yellow');
      process.exit(1);
    }
  }
}

// Copy and minify CSS files
async function processCSS() {
  log('\n🎨 Processing CSS files...', 'blue');
  
  const cssFiles = ['styles/sidebar.css'];

  if (skipMinify) {
    log('  ⚠️  Skipping minification (--skip-minify flag)', 'yellow');
    
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const outputPath = path.join('dist', file);
      fs.writeFileSync(outputPath, content);
      log(`  ✓ Copied ${file}`, 'green');
    }
  } else {
    try {
      const CleanCSS = require('clean-css');
      const cleancss = new CleanCSS({
        level: 2,
        format: false
      });
      
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const result = cleancss.minify(content);

        if (result.errors.length > 0) {
          log(`  ✗ Error minifying ${file}:`, 'red');
          result.errors.forEach(err => log(`    ${err}`, 'red'));
          continue;
        }

        const outputPath = path.join('dist', file);
        fs.writeFileSync(outputPath, result.styles);
        
        const originalSize = (content.length / 1024).toFixed(2);
        const minifiedSize = (result.styles.length / 1024).toFixed(2);
        const savings = ((1 - result.styles.length / content.length) * 100).toFixed(1);
        
        log(`  ✓ Minified ${file}`, 'green');
        log(`    ${originalSize}KB → ${minifiedSize}KB (${savings}% reduction)`, 'reset');
      }
    } catch (error) {
      log(`  ✗ Error minifying CSS: ${error.message}`, 'red');
      log('  💡 Run "npm install" to install dependencies', 'yellow');
      process.exit(1);
    }
  }
}

// Copy icon files
function copyIcons() {
  log('\n🖼️  Copying icon files...', 'blue');
  
  const iconFiles = ['icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png'];
  
  iconFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const outputPath = path.join('dist', file);
      fs.copyFileSync(file, outputPath);
      log(`  ✓ Copied ${file}`, 'green');
    } else {
      log(`  ⚠️  Missing ${file}`, 'yellow');
    }
  });
}

// Copy and process manifest
function copyManifest() {
  log('\n📋 Processing manifest.json...', 'blue');
  
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  
  // Optionally update manifest for production
  // manifest.version = '1.0.0'; // Set version
  
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
  log('  ✓ Copied manifest.json', 'green');
}

// Generate build info file
function generateBuildInfo() {
  log('\n📊 Generating build info...', 'blue');
  
  const buildInfo = {
    version: require('../package.json').version,
    buildDate: new Date().toISOString(),
    minified: !skipMinify,
    node: process.version
  };
  
  fs.writeFileSync('dist/BUILD_INFO.json', JSON.stringify(buildInfo, null, 2));
  log('  ✓ Created BUILD_INFO.json', 'green');
}

// Calculate total size
function calculateSizes() {
  log('\n📈 Build Statistics:', 'blue');
  
  function getDirectorySize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += fs.statSync(filePath).size;
      }
    }
    
    return size;
  }
  
  const distSize = getDirectorySize('dist');
  const sourceSize = 
    getDirectorySize('scripts') + 
    getDirectorySize('styles') + 
    getDirectorySize('icons') +
    fs.statSync('manifest.json').size;
  
  log(`  Source size:  ${(sourceSize / 1024).toFixed(2)} KB`, 'reset');
  log(`  Build size:   ${(distSize / 1024).toFixed(2)} KB`, 'reset');
  
  if (!skipMinify) {
    const savings = ((1 - distSize / sourceSize) * 100).toFixed(1);
    log(`  Reduction:    ${savings}%`, 'green');
  }
}

// Main build function
async function build() {
  const startTime = Date.now();
  
  log('\n🚀 Building Swagger Navigator...', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  try {
    createDistStructure();
    await processJavaScript();
    await processCSS();
    copyIcons();
    copyManifest();
    generateBuildInfo();
    calculateSizes();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log(`✅ Build completed successfully in ${duration}s`, 'green');
    log('\n📦 Output: dist/', 'blue');
    log('💡 Ready to package for Chrome Web Store!', 'yellow');
    log('   Run: npm run package\n', 'yellow');
    
  } catch (error) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
    log(`❌ Build failed: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Run build
build();
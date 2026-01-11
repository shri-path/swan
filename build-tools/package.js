#!/usr/bin/env node

/**
 * Package Script for Swagger Navigator
 * Creates a ZIP file from dist/ folder ready for Chrome Web Store
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure we're running from the project root
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

// Verify we're in the right place
if (!fs.existsSync('manifest.json') || !fs.existsSync('package.json')) {
  console.error('\x1b[31m❌ Error: Must run from project root directory\x1b[0m');
  console.error('\x1b[33m💡 Run: npm run package\x1b[0m');
  process.exit(1);
}

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

// Check if dist exists
function checkDist() {
  if (!fs.existsSync('dist')) {
    log('❌ dist/ folder not found!', 'red');
    log('💡 Run "npm run build" first', 'yellow');
    process.exit(1);
  }
}

// Create ZIP package
function createPackage() {
  log('\n📦 Packaging extension for Chrome Web Store...', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  const packageName = 'swagger-navigator-chrome-store.zip';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const versionedName = `swagger-navigator-v${require('../package.json').version}-${timestamp}.zip`;
  
  // Remove old packages
  if (fs.existsSync(packageName)) {
    fs.unlinkSync(packageName);
    log('  🗑️  Removed old package', 'yellow');
  }
  
  try {
    // Try to use zip command (Unix/Mac)
    log('\n  Creating ZIP archive...', 'blue');
    execSync(`cd dist && zip -r ../${packageName} . -x "*.DS_Store" -x "__MACOSX/*"`, {
      stdio: 'inherit'
    });
    
    // Also create versioned backup
    fs.copyFileSync(packageName, versionedName);
    
    const size = (fs.statSync(packageName).size / 1024).toFixed(2);
    
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
    log('✅ Package created successfully!', 'green');
    log(`\n📦 Main package:     ${packageName}`, 'blue');
    log(`📦 Versioned backup: ${versionedName}`, 'blue');
    log(`📏 Size:             ${size} KB`, 'reset');
    
    log('\n🚀 Next Steps:', 'yellow');
    log('   1. Go to https://chrome.google.com/webstore/devconsole', 'reset');
    log('   2. Click "New Item"', 'reset');
    log('   3. Upload ' + packageName, 'reset');
    log('   4. Fill out the store listing', 'reset');
    log('   5. Submit for review\n', 'reset');
    
  } catch (error) {
    // Fallback: Try PowerShell (Windows)
    try {
      log('  Trying alternative packaging method...', 'yellow');
      execSync(`powershell -Command "Compress-Archive -Path dist/* -DestinationPath ${packageName} -Force"`, {
        stdio: 'inherit'
      });
      
      const size = (fs.statSync(packageName).size / 1024).toFixed(2);
      
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
      log('✅ Package created successfully!', 'green');
      log(`\n📦 File: ${packageName}`, 'blue');
      log(`📏 Size: ${size} KB`, 'reset');
      
    } catch (fallbackError) {
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
      log('❌ Failed to create package', 'red');
      log('\n💡 Manual packaging instructions:', 'yellow');
      log('   1. Compress the "dist" folder to a ZIP file', 'reset');
      log('   2. Name it: swagger-navigator-chrome-store.zip', 'reset');
      log('   3. Upload to Chrome Web Store\n', 'reset');
      process.exit(1);
    }
  }
}

// List package contents
function listContents() {
  log('\n📋 Package Contents:', 'blue');
  
  function listDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      
      log(`${prefix}${connector}${item.name}`, 'reset');
      
      if (item.isDirectory()) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        listDirectory(path.join(dir, item.name), newPrefix);
      }
    });
  }
  
  listDirectory('dist');
}

// Main function
function main() {
  checkDist();
  listContents();
  createPackage();
}

// Run
main();
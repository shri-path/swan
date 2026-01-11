#!/bin/bash

# Swagger Navigator - Chrome Web Store Package Creator
# This script creates a clean ZIP file ready for Chrome Web Store upload

echo "🎁 Creating Chrome Web Store Package..."
echo ""

# Set colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Package name
PACKAGE_NAME="swagger-navigator-chrome-store.zip"

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found!${NC}"
    echo "Please run this script from the extension root directory"
    exit 1
fi

# Remove old package if exists
if [ -f "$PACKAGE_NAME" ]; then
    echo -e "${BLUE}🗑️  Removing old package...${NC}"
    rm "$PACKAGE_NAME"
fi

# Create ZIP with only necessary files
echo -e "${BLUE}📦 Packaging files...${NC}"

zip -r "$PACKAGE_NAME" \
    manifest.json \
    scripts/*.js \
    styles/*.css \
    icons/*.png \
    -x "*.DS_Store" \
    -x "__MACOSX/*" \
    -x "*.git*" \
    -x "node_modules/*"

# Check if ZIP was created successfully
if [ -f "$PACKAGE_NAME" ]; then
    SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
    echo ""
    echo -e "${GREEN}✅ Package created successfully!${NC}"
    echo -e "${GREEN}📦 File: $PACKAGE_NAME${NC}"
    echo -e "${GREEN}📏 Size: $SIZE${NC}"
    echo ""
    echo "📋 Package contents:"
    unzip -l "$PACKAGE_NAME"
    echo ""
    echo -e "${GREEN}🚀 Ready to upload to Chrome Web Store!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://chrome.google.com/webstore/devconsole"
    echo "2. Click 'New Item'"
    echo "3. Upload $PACKAGE_NAME"
    echo ""
else
    echo -e "${RED}❌ Failed to create package${NC}"
    exit 1
fi
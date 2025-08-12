#!/bin/bash

# EasyMedPro App Icon and Splash Screen Generator
# This script generates app icons and splash screens for various platforms

echo "🎨 EasyMedPro App Icon Generator"
echo "================================"

# Create icons directory if it doesn't exist
mkdir -p public/icons
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
mkdir -p ios/App/App/Assets.xcassets/AppIcon.appiconset

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Please install ImageMagick to generate icons automatically."
    echo "   On Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   On macOS: brew install imagemagick"
    echo "   For now, placeholder icons will be created."
    
    # Create placeholder icon files
    echo "📱 Creating placeholder icons..."
    
    # PWA Icons
    touch public/favicon.ico
    touch public/icon-192.png
    touch public/icon-512.png
    touch public/icon-maskable.png
    touch public/apple-touch-icon.png
    
    # Android Icons
    touch android/app/src/main/res/mipmap-hdpi/ic_launcher.png
    touch android/app/src/main/res/mipmap-mdpi/ic_launcher.png
    touch android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
    touch android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
    touch android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
    
    echo "✅ Placeholder icons created. Replace with actual icons before production."
    exit 0
fi

# Source icon file (should be 1024x1024 PNG)
SOURCE_ICON="assets/icon-1024.png"

if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Source icon not found: $SOURCE_ICON"
    echo "   Please create a 1024x1024 PNG icon file and save it as $SOURCE_ICON"
    exit 1
fi

echo "🔄 Generating icons from $SOURCE_ICON..."

# PWA Icons
echo "📱 Generating PWA icons..."
convert "$SOURCE_ICON" -resize 16x16 public/favicon-16x16.png
convert "$SOURCE_ICON" -resize 32x32 public/favicon-32x32.png
convert "$SOURCE_ICON" -resize 192x192 public/icon-192.png
convert "$SOURCE_ICON" -resize 512x512 public/icon-512.png
convert "$SOURCE_ICON" -resize 192x192 public/icon-maskable.png

# Apple Touch Icons
echo "🍎 Generating Apple Touch icons..."
convert "$SOURCE_ICON" -resize 180x180 public/apple-touch-icon.png
convert "$SOURCE_ICON" -resize 152x152 public/apple-touch-icon-152x152.png
convert "$SOURCE_ICON" -resize 180x180 public/apple-touch-icon-180x180.png
convert "$SOURCE_ICON" -resize 167x167 public/apple-touch-icon-167x167.png

# Android Icons
echo "🤖 Generating Android icons..."
convert "$SOURCE_ICON" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert "$SOURCE_ICON" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert "$SOURCE_ICON" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert "$SOURCE_ICON" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert "$SOURCE_ICON" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# iOS Icons (if iOS directory exists)
if [ -d "ios/App/App/Assets.xcassets/AppIcon.appiconset" ]; then
    echo "🍎 Generating iOS icons..."
    convert "$SOURCE_ICON" -resize 20x20 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@1x.png
    convert "$SOURCE_ICON" -resize 40x40 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@2x.png
    convert "$SOURCE_ICON" -resize 60x60 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@3x.png
    convert "$SOURCE_ICON" -resize 29x29 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@1x.png
    convert "$SOURCE_ICON" -resize 58x58 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@2x.png
    convert "$SOURCE_ICON" -resize 87x87 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@3x.png
    convert "$SOURCE_ICON" -resize 40x40 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@1x.png
    convert "$SOURCE_ICON" -resize 80x80 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@2x.png
    convert "$SOURCE_ICON" -resize 120x120 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@3x.png
    convert "$SOURCE_ICON" -resize 120x120 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@2x.png
    convert "$SOURCE_ICON" -resize 180x180 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@3x.png
    convert "$SOURCE_ICON" -resize 76x76 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@1x.png
    convert "$SOURCE_ICON" -resize 152x152 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@2x.png
    convert "$SOURCE_ICON" -resize 167x167 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-83.5x83.5@2x.png
    convert "$SOURCE_ICON" -resize 1024x1024 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024x1024@1x.png
fi

# Generate Favicon
echo "🌐 Generating favicon..."
convert "$SOURCE_ICON" -resize 32x32 favicon-32.png
convert "$SOURCE_ICON" -resize 16x16 favicon-16.png
convert favicon-32.png favicon-16.png public/favicon.ico
rm favicon-32.png favicon-16.png

# Generate splash screens
echo "🎨 Generating splash screens..."
mkdir -p public/splash

# iPhone splash screens
convert -size 1125x2436 xc:"#3B82F6" public/apple-splash-1125-2436.jpg
convert -size 1242x2208 xc:"#3B82F6" public/apple-splash-1242-2208.jpg
convert -size 750x1334 xc:"#3B82F6" public/apple-splash-750-1334.jpg
convert -size 828x1792 xc:"#3B82F6" public/apple-splash-828-1792.jpg

# iPad splash screens
convert -size 2048x2732 xc:"#3B82F6" public/apple-splash-2048-2732.jpg
convert -size 1668x2224 xc:"#3B82F6" public/apple-splash-1668-2224.jpg
convert -size 1536x2048 xc:"#3B82F6" public/apple-splash-1536-2048.jpg

# Add logo to splash screens
logo_size=256
for splash in public/apple-splash-*.jpg; do
    width=$(identify -format "%w" "$splash")
    height=$(identify -format "%h" "$splash")
    x=$((width / 2 - logo_size / 2))
    y=$((height / 2 - logo_size / 2))
    
    composite -geometry "${logo_size}x${logo_size}+${x}+${y}" "$SOURCE_ICON" "$splash" "$splash"
done

echo "✅ All icons and splash screens generated successfully!"
echo ""
echo "📋 Generated files:"
echo "   • PWA icons: public/icon-*.png"
echo "   • Apple touch icons: public/apple-touch-icon*.png"
echo "   • Android icons: android/app/src/main/res/mipmap-*/ic_launcher.png"
echo "   • iOS icons: ios/App/App/Assets.xcassets/AppIcon.appiconset/"
echo "   • Splash screens: public/apple-splash-*.jpg"
echo "   • Favicon: public/favicon.ico"
echo ""
echo "🚀 Your app icons are ready for deployment!"
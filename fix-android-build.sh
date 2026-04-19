#!/bin/bash

# Fix React Native build issues by cleaning and regenerating autolinking

echo "🧹 Cleaning Android build..."
cd android
./gradlew clean 2>/dev/null || echo "⚠️  Gradle clean skipped (may need to run manually)"
cd ..

echo "🗑️  Removing old autolinking configuration..."
rm -rf android/build/generated/autolinking

echo "🍎 Fixing iOS build..."
cd ios
echo "   Removing old Pods..."
rm -rf Pods Podfile.lock
echo "   Installing CocoaPods dependencies..."
pod install || {
    echo "⚠️  Pod install failed. Try running manually:"
    echo "   cd ios && pod install"
}
cd ..

echo "📦 Reinstalling node modules (if needed)..."
# Uncomment the next line if you want to reinstall node_modules
# rm -rf node_modules && npm install

echo ""
echo "✅ Done! Now try running:"
echo "   npm run android  (for Android)"
echo "   npm run ios      (for iOS)"

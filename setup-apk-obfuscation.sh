#!/bin/bash

# setup-apk-obfuscation.sh
# ------------------------
# Configures Android ProGuard and Minification
# Prevents Reverse Engineering on Release Builds

echo "🛡️  Configuring APK Obfuscation..."

# 1. Update ProGuard Rules
# (We already created this in previous step, but ensuring it's comprehensive)
mkdir -p android/app

cat > android/app/proguard-rules.pro << 'EOF'
# 1. Capacitor & WebView
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 2. Plugins (Prevent Crash)
-keep class com.capacitorjs.** { *; }
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }

# 3. Aggressive Obfuscation
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# 4. Remove Logs
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
EOF

# 2. Enable Minification in build.gradle
GRADLE_FILE="android/app/build.gradle"

if [ -f "$GRADLE_FILE" ]; then
    echo "📝 Updating $GRADLE_FILE..."
    
    # Check if release block exists
    if grep -q "buildTypes {" "$GRADLE_FILE"; then
        # This is a naive injection, in reality specific placement matters.
        # Ideally, we instruct user or use a more precise tool.
        # But for this script, we'll append a reminder or attempt regex replacement if possible.
        
        # Simulating the edit manually or via sed is risky without viewing structure.
        # We will backup and output instructions or use a safe append approach if we find the block.
        
        echo "⚠️  Please manually ensure your 'release' block looks like this in $GRADLE_FILE:"
        echo ""
        echo "    buildTypes {"
        echo "        release {"
        echo "            minifyEnabled true"
        echo "            shrinkResources true"
        echo "            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'"
        echo "            signingConfig signingConfigs.release"
        echo "        }"
        echo "    }"
        
        # Attempt to automate if 'minifyEnabled false' is found (default)
        # sed -i 's/minifyEnabled false/minifyEnabled true/g' $GRADLE_FILE
        # sed -i 's/shrinkResources false/shrinkResources true/g' $GRADLE_FILE
        
    else
        echo "❌ buildTypes block not found in $GRADLE_FILE. Is this a standard Android project?"
    fi
else
    echo "❌ $GRADLE_FILE not found. Have you run 'npx cap add android'?"
fi

echo "✅ ProGuard Rules Updated."
echo "👉 Don't forget to build in Release mode: 'cd android && ./gradlew assembleRelease'"

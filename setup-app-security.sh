#!/bin/bash

# setup-app-security.sh
# ---------------------
# App Security Hardening: ProGuard & String Obfuscation
# Prevents: Reverse Engineering, Plain Text Secrets

echo "🛡️  Starting Security Hardening..."

# 1. Android ProGuard Rules
# (Ensure folder exists)
mkdir -p android/app

echo "🔒 Configuring ProGuard Rules..."
cat > android/app/proguard-rules.pro << 'EOF'
# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in D:\android-sdk/tools/proguard/proguard-android.txt
# and each other.

# 1. Keep Capacitor Bridge
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# 2. Keep WebView Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 3. Third-party Plugins (Keep them to avoid crashes)
-keep class com.capacitorjs.** { *; }
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }

# 4. Aggressive Obfuscation for everything else
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# 5. Remove Log calls (Sanitize Logs)
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
EOF

# 2. String Obfuscation Utility
# Create a robust encryption helper for frontend strings
echo "🧩 Creating StringObfuscator Utility..."
mkdir -p src/lib/security

cat > src/lib/security/obfuscator.ts << 'EOF'
/**
 * Simple client-side obfuscation to prevent "strings" grep on built JS.
 * Not military grade, but stops script kiddies.
 * Use environment variables for real secrets on the server!
 */

// Base64 helper
const b64 = (str: string) => typeof window !== 'undefined' ? window.btoa(str) : Buffer.from(str).toString('base64');
const db64 = (str: string) => typeof window !== 'undefined' ? window.atob(str) : Buffer.from(str, 'base64').toString('utf-8');

// Simple XOR Cipher
const secretKey = 'LIGUNS_SECURE_KEY_X99'; 

export const Obfuscator = {
  /**
   * Encrypt a sensitive string (e.g. API Keys)
   * Run this locally to generate the safe string to put in code.
   */
  encrypt: (text: string): string => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
    }
    return b64(result);
  },

  /**
   * Decrypt at runtime
   */
  decrypt: (cipher: string): string => {
    try {
      const text = db64(cipher);
      let result = '';
      for (let i = 0; i < text.length; i++) {
          result += String.fromCharCode(text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
      }
      return result;
    } catch (e) {
      console.error('Decryption failed');
      return '';
    }
  }
};
EOF

# 3. Create Obfuscator Tool Script (Command line usage)
cat > src/scripts/obfuscate.js << 'EOF'
// Usage: node src/scripts/obfuscate.js "MY_SECRET_STRING"
const key = 'LIGUNS_SECURE_KEY_X99';
const text = process.argv[2];

if (!text) {
    console.log('Usage: node src/scripts/obfuscate.js "TEXT_TO_HIDE"');
    process.exit(1);
}

let result = '';
for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
}
console.log('Encrypted (Put this in your code):');
console.log(Buffer.from(result).toString('base64'));
EOF

echo "✅ Security Hardening Setup Complete!"

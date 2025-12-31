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

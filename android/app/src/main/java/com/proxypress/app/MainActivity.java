package com.proxypress.app;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private NativeSplashView splashView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showNativeSplash();
        
        // Delay the painting slightly to ensure the window is ready
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(this::paintWebViewBackground, 100);
        
        // Add JS interface after a short delay
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            try {
                if (this.getBridge() != null && this.getBridge().getWebView() != null) {
                    this.getBridge().getWebView().addJavascriptInterface(new Object() {
                        @JavascriptInterface
                        public void hide() {
                            hideNativeSplash();
                        }
                    }, "AndroidNativeSplash");
                }
            } catch (Exception e) {}
        }, 1000);
        
        this.getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(() -> request.grant(request.getResources()));
            }
        });
    }

    private void showNativeSplash() {
        if (isFinishing()) return;
        
        splashView = new NativeSplashView(this);
        addContentView(splashView, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Emergency Escape: If user taps the screen, hide it
        splashView.setOnClickListener(v -> hideNativeSplash());

        // Safety: Auto-hide after 6 seconds if everything fails
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(this::hideNativeSplash, 6000);
    }

    public void hideNativeSplash() {
        runOnUiThread(() -> {
            if (splashView != null) {
                splashView.animate()
                    .alpha(0f)
                    .setDuration(500)
                    .withEndAction(() -> {
                        if (splashView != null && splashView.getParent() != null) {
                            ((ViewGroup) splashView.getParent()).removeView(splashView);
                            splashView = null;
                        }
                    });
            }
        });
    }

    // New method to pre-paint the WebView and Window background to kill the white flash
    private void paintWebViewBackground() {
        try {
            android.content.SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            
            // Check for custom theme first (try both prefixed and non-prefixed)
            String customThemeJson = prefs.getString("proxy-press-custom-theme", null);
            if (customThemeJson == null) customThemeJson = prefs.getString("_cap_proxy-press-custom-theme", null);
            
            int bgColor = Color.parseColor("#000000"); // Default dark
            boolean isDark = true;
            
            if (customThemeJson != null) {
                java.util.regex.Matcher bgMatcher = java.util.regex.Pattern.compile("\"bg\":\"(#[A-Fa-f0-9]{6})\"").matcher(customThemeJson);
                if (bgMatcher.find()) bgColor = Color.parseColor(bgMatcher.group(1));
                
                // Estimate if the background is dark or light for icon contrast
                double darkness = 1 - (0.299 * Color.red(bgColor) + 0.587 * Color.green(bgColor) + 0.114 * Color.blue(bgColor)) / 255;
                isDark = darkness > 0.5;
            } else {
                // Check for light/dark mode preference
                String themeMode = prefs.getString("proxy-press-theme", null);
                if (themeMode == null) themeMode = prefs.getString("_cap_proxy-press-theme", "system");
                
                if ("system".equals(themeMode)) {
                    isDark = (getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES;
                } else {
                    isDark = "dark".equals(themeMode);
                }
                bgColor = isDark ? Color.parseColor("#000000") : Color.parseColor("#F8FAFC");
            }
            
            final int finalColor = bgColor;
            final boolean finalIsDark = isDark;
            runOnUiThread(() -> {
                // 1. Paint the WebView background
                if (this.getBridge() != null && this.getBridge().getWebView() != null) {
                    this.getBridge().getWebView().setBackgroundColor(finalColor);
                }
                
                // 2. Paint the Window background
                getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(finalColor));
                
                // 3. Paint the DecorView (the absolute root)
                getWindow().getDecorView().setBackgroundColor(finalColor);

                // 4. Update the Status Bar
                getWindow().setStatusBarColor(finalColor);
                
                // Update Status Bar icon brightness
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    android.view.View decorView = getWindow().getDecorView();
                    int flags = decorView.getSystemUiVisibility();
                    if (finalIsDark) {
                        // Dark mode background -> White icons
                        flags &= ~android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    } else {
                        // Light mode background -> Dark icons
                        flags |= android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    }
                    decorView.setSystemUiVisibility(flags);
                }
            });
        } catch (Exception e) {}
    }
}

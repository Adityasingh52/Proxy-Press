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
    private Dialog splashDialog;
    private NativeSplashView splashView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showNativeSplash();
        paintWebViewBackground();
        
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
        }, 800);
        
        this.getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(() -> request.grant(request.getResources()));
            }
        });
    }

    private void showNativeSplash() {
        if (isFinishing()) return;
        
        splashDialog = new Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        splashView = new NativeSplashView(this);
        splashDialog.setContentView(splashView);
        splashDialog.setCancelable(false);
        splashDialog.show();

        // Safety: Auto-hide after 5 seconds
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(this::hideNativeSplash, 5000);
    }

    public void hideNativeSplash() {
        runOnUiThread(() -> {
            if (splashDialog != null && splashDialog.isShowing()) {
                // Fade out the dialog smoothly
                splashView.animate()
                    .alpha(0f)
                    .setDuration(400)
                    .withEndAction(() -> {
                        if (splashDialog != null) {
                            splashDialog.dismiss();
                            splashDialog = null;
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
            
            if (customThemeJson != null) {
                java.util.regex.Matcher bgMatcher = java.util.regex.Pattern.compile("\"bg\":\"(#[A-Fa-f0-9]{6})\"").matcher(customThemeJson);
                if (bgMatcher.find()) bgColor = Color.parseColor(bgMatcher.group(1));
            } else {
                // Check for light/dark mode preference
                String themeMode = prefs.getString("proxy-press-theme", null);
                if (themeMode == null) themeMode = prefs.getString("_cap_proxy-press-theme", "system");
                
                boolean isDark;
                if ("system".equals(themeMode)) {
                    isDark = (getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES;
                } else {
                    isDark = "dark".equals(themeMode);
                }
                bgColor = isDark ? Color.parseColor("#000000") : Color.parseColor("#F8FAFC");
            }
            
            final int finalColor = bgColor;
            runOnUiThread(() -> {
                // 1. Paint the WebView background
                if (this.getBridge() != null && this.getBridge().getWebView() != null) {
                    this.getBridge().getWebView().setBackgroundColor(finalColor);
                }
                
                // 2. Paint the Window background
                getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(finalColor));
                
                // 3. Paint the DecorView (the absolute root)
                getWindow().getDecorView().setBackgroundColor(finalColor);
            });
        } catch (Exception e) {}
    }
}

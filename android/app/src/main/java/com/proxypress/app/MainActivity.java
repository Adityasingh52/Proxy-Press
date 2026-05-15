package com.proxypress.app;

import android.app.Dialog;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private Dialog splashDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showNativeSplash();
        
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
        NativeSplashView splashView = new NativeSplashView(this);
        splashDialog.setContentView(splashView);
        splashDialog.setCancelable(false);
        splashDialog.show();

        // Safety: Auto-hide after 5 seconds
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(this::hideNativeSplash, 5000);
    }

    public void hideNativeSplash() {
        runOnUiThread(() -> {
            if (splashDialog != null && splashDialog.isShowing()) {
                splashDialog.dismiss();
                splashDialog = null;
            }
        });
    }
}

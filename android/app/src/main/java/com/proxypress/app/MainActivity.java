package com.proxypress.app;

import android.os.Bundle;
import android.view.View;
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
        
        // Add native splash view on top of everything
        splashView = new NativeSplashView(this);
        addContentView(splashView, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Allow Web to hide it
        this.getBridge().getWebView().addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void hide() {
                hideNativeSplash();
            }
        }, "AndroidNativeSplash");

        // Emergency Escape: If user taps the splash, hide it
        splashView.setOnClickListener(v -> hideNativeSplash());

        // SAFETY FALLBACK: If web doesn't hide it in 5 seconds, hide it anyway
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(this::hideNativeSplash, 5000);

        this.getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(() -> request.grant(request.getResources()));
            }
        });
    }

    private void hideNativeSplash() {
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
}

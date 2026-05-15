package com.proxypress.app;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Shader;
import android.os.Handler;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.Interpolator;

import java.util.ArrayList;
import java.util.List;

public class NativeSplashView extends View {
    private Paint ripplePaint;
    private Paint textPaint;
    private Paint linePaint;
    private long startTime;
    private int width, height;
    private List<Ripple> ripples = new ArrayList<>();
    private List<Line> lines = new ArrayList<>();
    private int primaryColor = Color.parseColor("#2563EB");
    private int bgColor = Color.parseColor("#0F172A");
    private String logoText = "Proxy-Press";

    public NativeSplashView(Context context) {
        super(context);
        loadThemeColors(context);
        init();
    }

    private void loadThemeColors(Context context) {
        try {
            // Capacitor Preferences saves data in a SharedPreferences file named "CapacitorStorage"
            android.content.SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String customThemeJson = prefs.getString("proxy-press-custom-theme", null);
            
            if (customThemeJson != null) {
                // We use a simple regex to extract colors to avoid adding a heavy JSON library dependency
                java.util.regex.Matcher bgMatcher = java.util.regex.Pattern.compile("\"bg\":\"(#[A-Fa-f0-9]{6})\"").matcher(customThemeJson);
                if (bgMatcher.find()) {
                    bgColor = Color.parseColor(bgMatcher.group(1));
                }
                
                java.util.regex.Matcher primaryMatcher = java.util.regex.Pattern.compile("\"primary\":\"(#[A-Fa-f0-9]{6})\"").matcher(customThemeJson);
                if (primaryMatcher.find()) {
                    primaryColor = Color.parseColor(primaryMatcher.group(1));
                }
            } else {
                // If no custom theme, check the dark/light mode preference
                String themeMode = prefs.getString("proxy-press-theme", "system");
                boolean isDark = themeMode.equals("dark") || 
                                (themeMode.equals("system") && (context.getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES);
                
                bgColor = isDark ? Color.parseColor("#0F172A") : Color.parseColor("#F8FAFC");
                primaryColor = isDark ? Color.parseColor("#3B82F6") : Color.parseColor("#2563EB");
            }
        } catch (Exception e) {
            // Fallback to defaults on any error
        }
    }

    private void init() {
        ripplePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        ripplePaint.setStyle(Paint.Style.STROKE);
        ripplePaint.setStrokeWidth(4f);
        ripplePaint.setColor(primaryColor);

        textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(100f);
        textPaint.setFakeBoldText(true);
        textPaint.setColor(Color.WHITE);

        linePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        linePaint.setStrokeWidth(2f);

        startTime = System.currentTimeMillis();

        // Initialize Ripples
        for (int i = 0; i < 4; i++) {
            ripples.add(new Ripple(i * 750));
        }

        // Initialize News Lines
        for (int i = 0; i < 4; i++) {
            lines.add(new Line(0.2f + (i * 0.2f), 4000 + (i * 1000), i * 500));
        }

        postInvalidateOnAnimation();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        width = getWidth();
        height = getHeight();

        // If screen size isn't ready, don't draw yet, just wait for next frame
        if (width <= 0 || height <= 0) {
            invalidate();
            return;
        }

        long currentTime = System.currentTimeMillis();
        long elapsed = currentTime - startTime;

        canvas.drawColor(bgColor);

        int centerX = width / 2;
        int centerY = height / 2;

        // Draw News Lines (Shimmering)
        for (Line line : lines) {
            float progress = ((elapsed + line.delay) % line.duration) / (float) line.duration;
            float x = -width + (progress * width * 2);
            
            linePaint.setShader(new LinearGradient(
                x, 0, x + width, 0,
                new int[]{Color.TRANSPARENT, primaryColor, Color.TRANSPARENT},
                new float[]{0f, 0.5f, 1f},
                Shader.TileMode.CLAMP
            ));
            linePaint.setAlpha(25);
            canvas.drawLine(0, height * line.yPos, width, height * line.yPos, linePaint);
        }

        // Draw Ripples
        for (Ripple ripple : ripples) {
            float progress = ((elapsed + ripple.delay) % 3000) / 3000f;
            float radius = 50 + (progress * Math.max(width, height) / 1.5f);
            int alpha = (int) (255 * (0.2f * (1 - progress)));
            
            if (alpha > 0) {
                ripplePaint.setAlpha(alpha);
                canvas.drawCircle(centerX, centerY, radius, ripplePaint);
            }
        }

        // Draw Logo Text (Gradient matching Web)
        float logoProgress = Math.min(1f, elapsed / 800f);
        textPaint.setAlpha((int) (255 * logoProgress));
        
        // Re-create shader based on current centerX/centerY
        textPaint.setShader(new LinearGradient(
            centerX - 250, centerY, centerX + 250, centerY,
            new int[]{primaryColor, Color.parseColor("#8B5CF6")},
            null,
            Shader.TileMode.CLAMP
        ));

        canvas.drawText(logoText, centerX, centerY + 20, textPaint);

        invalidate();
    }

    private static class Ripple {
        long delay;
        Ripple(long delay) { this.delay = delay; }
    }

    private static class Line {
        float yPos;
        long duration;
        long delay;
        Line(float yPos, long duration, long delay) {
            this.yPos = yPos;
            this.duration = duration;
            this.delay = delay;
        }
    }
}

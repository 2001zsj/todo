package com.maho.todo;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://2001zsj.github.io/todo/";
    private WebView webView;
    private View splashView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller =
                new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(true);

        // ── 根布局 FrameLayout ──
        FrameLayout root = new FrameLayout(this);
        root.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        // ── WebView（底层，初始隐藏）──
        webView = new WebView(this);
        webView.setBackgroundColor(0xFFFFF5F9);
        webView.setVisibility(View.INVISIBLE);
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                view.setBackgroundColor(0xFFFFFFFF);
                showWebView();
            }

            @Override
            public void onReceivedError(WebView view, int errorCode,
                    String description, String failingUrl) {
                view.setBackgroundColor(0xFFFFF5F9);
                view.loadUrl("about:blank");
                showWebView(); // 出错也过渡，避免永远卡在 splash
            }
        });

        // ── Splash 层（顶层）──
        splashView = getLayoutInflater().inflate(R.layout.activity_splash, root, false);
        root.addView(splashView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));

        setContentView(root);

        // ── 播放 splash 动画 ──
        playSplashAnimation();

        // ── 后台开始加载 ──
        webView.loadUrl(APP_URL);
    }

    private void playSplashAnimation() {
        ImageView logo = splashView.findViewById(R.id.splash_logo);
        TextView title = splashView.findViewById(R.id.splash_title);
        ImageView starBg = splashView.findViewById(R.id.star_bg);
        ImageView starLeft = splashView.findViewById(R.id.star_left);
        ImageView starRight = splashView.findViewById(R.id.star_right);
        ImageView starTopRight = splashView.findViewById(R.id.star_top_right);

        Animation scaleUp = AnimationUtils.loadAnimation(this, R.anim.splash_scale_up);
        logo.startAnimation(scaleUp);

        Animation fadeIn = AnimationUtils.loadAnimation(this, R.anim.splash_fade_in);
        fadeIn.setStartOffset(300);
        title.startAnimation(fadeIn);
        title.animate().alpha(1f).setStartDelay(300).setDuration(800).start();

        Animation rotate = AnimationUtils.loadAnimation(this, R.anim.star_rotate);
        starBg.startAnimation(rotate);
        starLeft.startAnimation(rotate);
        Animation rotateSlow = AnimationUtils.loadAnimation(this, R.anim.star_rotate);
        rotateSlow.setDuration(5000);
        starRight.startAnimation(rotateSlow);
        starTopRight.startAnimation(rotateSlow);
    }

    private void showWebView() {
        if (splashView == null) return;

        splashView.animate()
                .alpha(0f)
                .setDuration(300)
                .setListener(new AnimatorListenerAdapter() {
                    @Override
                    public void onAnimationEnd(Animator animation) {
                        splashView.setVisibility(View.GONE);
                        splashView = null;
                    }
                });

        webView.setAlpha(0f);
        webView.setVisibility(View.VISIBLE);
        webView.animate().alpha(1f).setDuration(400).start();
        webView.setBackgroundColor(0xFFFFFFFF);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

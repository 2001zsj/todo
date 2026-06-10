package com.maho.todo;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;

public class SplashActivity extends Activity {

    private static final int SPLASH_DURATION = 2000; // 2秒

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        ImageView logo = findViewById(R.id.splash_logo);
        TextView title = findViewById(R.id.splash_title);
        ImageView starBg = findViewById(R.id.star_bg);
        ImageView starLeft = findViewById(R.id.star_left);
        ImageView starRight = findViewById(R.id.star_right);
        ImageView starTopRight = findViewById(R.id.star_top_right);

        // 图标弹性放大
        Animation scaleUp = AnimationUtils.loadAnimation(this, R.anim.splash_scale_up);
        logo.startAnimation(scaleUp);

        // 标题延迟淡入
        Animation fadeIn = AnimationUtils.loadAnimation(this, R.anim.splash_fade_in);
        fadeIn.setStartOffset(300);
        title.startAnimation(fadeIn);
        title.animate().alpha(1f).setStartDelay(300).setDuration(800).start();

        // 星星旋转动画
        Animation rotate = AnimationUtils.loadAnimation(this, R.anim.star_rotate);
        starBg.startAnimation(rotate);
        starLeft.startAnimation(rotate);
        Animation rotateSlow = AnimationUtils.loadAnimation(this, R.anim.star_rotate);
        rotateSlow.setDuration(5000);
        starRight.startAnimation(rotateSlow);
        starTopRight.startAnimation(rotateSlow);

        // 延时跳转
        new Handler().postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
            finish();
        }, SPLASH_DURATION);
    }
}

package com.zadmuslim.app;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import androidx.activity.OnBackPressedCallback;
import androidx.core.app.ActivityCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.graphics.Insets;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdhanNativePlugin.class);
        registerPlugin(BackupFilesPlugin.class);
        registerPlugin(RadioNativePlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.enableEdgeToEdge(getWindow());

        // Create remote push's channel independently of prayer setup or WebView execution.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                NotificationChannel channel = new NotificationChannel(
                    AdhanAlarmReceiver.BROADCAST_CHANNEL_ID,
                    NativeLanguage.text(this, "رسائل زاد المسلم"),
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription(NativeLanguage.text(this, "الإشعارات المرسلة من إدارة زاد المسلم"));
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                manager.createNotificationChannel(channel);
            }
        }

        // حماية رأس التطبيق من تداخل شريط حالة النظام (Status Bar & Display Cutout Insets)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (view, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return windowInsets.inset(insets.left, insets.top, insets.right, insets.bottom);
        });

        // التعامل الذكي مع زر الرجوع وإيماءات السحب لنظام الأندرويد (Hardware Back & Predictive Back Gesture)
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge != null && bridge.getWebView() != null) {
                    android.webkit.WebView webView = bridge.getWebView();
                    webView.evaluateJavascript(
                        "(function(){ return (typeof window.__zadHandleBack === 'function' ? window.__zadHandleBack() : false); })()",
                        value -> {
                            if (!"true".equals(value)) {
                                if (webView.canGoBack()) {
                                    webView.goBack();
                                } else {
                                    setEnabled(false);
                                    getOnBackPressedDispatcher().onBackPressed();
                                    setEnabled(true);
                                }
                            }
                        }
                    );
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                    setEnabled(true);
                }
            }
        });

        // LocalNotifications owns the runtime permission request and its completion.

        // Retire the old polling alarm; OneSignal owns admin push delivery.
        AdhanAlarmReceiver.cancelLegacyBroadcastCheck(this);

        // تهيئة إعدادات الـ WebView لتشغيل مرئيات YouTube والوسائط المتعددة بسلاسة ودون حظر
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                android.webkit.WebView webView = this.bridge.getWebView();
                android.webkit.WebSettings settings = webView.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setMediaPlaybackRequiresUserGesture(false);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
                }
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onResume() {
        super.onResume();
        // Recover saved schedules after returning from Android permission settings.
        BackgroundReminderReceiver.restore(this);
        AdhanNativePlugin.rescheduleAlarmsFromPrefs(this);
    }

    /**
     * إيقاف صوت الأذان فوراً عند الضغط على أزرار الصوت (رفع أو خفض الصوت) أثناء فتح التطبيق
     */
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            int keyCode = event.getKeyCode();
            if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                if (AdhanPlayer.isPlaying() || AdhanService.isPlaying) {
                    AdhanPlayer.stop();
                    Intent stopIntent = new Intent(this, AdhanService.class);
                    stopIntent.setAction(AdhanService.ACTION_STOP_ADHAN);
                    try {
                        startService(stopIntent);
                    } catch (Exception ignored) {}
                    return true;
                }
            }
        }
        return super.dispatchKeyEvent(event);
    }
}

package com.zadmuslim.app;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import androidx.core.app.ActivityCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.graphics.Insets;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdhanNativePlugin.class);
        super.onCreate(savedInstanceState);

        // حماية رأس التطبيق من تداخل شريط حالة النظام (Status Bar & Display Cutout Insets)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (view, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout());
            view.setPadding(0, insets.top, 0, 0);
            return windowInsets;
        });

        // طلب إذن الإشعارات تلقائياً على نظام أندرويد 13 فما فوق فور تشغيل التطبيق
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        // فحص البث السحابي فوراً عند فتح التطبيق وتفعيل الجدولة الدورية
        AdhanAlarmReceiver.triggerImmediateBroadcastCheck(this);
        AdhanAlarmReceiver.scheduleNextBroadcastCheck(this);
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

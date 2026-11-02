package com.zadmuslim.app;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** Saves only a validated app backup, to the document selected by the user. */
@CapacitorPlugin(name = "BackupFiles")
public class BackupFilesPlugin extends Plugin {
    @PluginMethod
    public void saveBackup(PluginCall call) {
        try {
            String content = call.getString("content", "");
            String name = call.getString("fileName", "");
            JSONObject backup = new JSONObject(content);
            if (!name.matches("zad-backup-\\d{4}-\\d{2}-\\d{2}\\.json")
                || content.getBytes(StandardCharsets.UTF_8).length > 5 * 1024 * 1024
                || !"zad-muslim".equals(backup.optString("app"))
                || backup.optInt("version") != 1 || backup.optJSONObject("data") == null) {
                call.reject("Invalid backup file");
                return;
            }
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/json");
            intent.putExtra(Intent.EXTRA_TITLE, name);
            startActivityForResult(call, intent, "backupFileSelected");
        } catch (Exception error) {
            call.reject("Could not open backup save dialog");
        }
    }

    @ActivityCallback
    private void backupFileSelected(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null
            || result.getData().getData() == null) {
            JSObject response = new JSObject();
            response.put("cancelled", true);
            call.resolve(response);
            return;
        }
        try (OutputStream output = getContext().getContentResolver()
                .openOutputStream(result.getData().getData(), "wt")) {
            if (output == null) throw new IllegalStateException("No output stream");
            output.write(call.getString("content", "").getBytes(StandardCharsets.UTF_8));
            output.flush();
        } catch (Exception error) {
            call.reject("Could not save backup file");
            return;
        }
        JSObject response = new JSObject();
        response.put("saved", true);
        call.resolve(response);
    }
}

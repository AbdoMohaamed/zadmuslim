package com.zadmuslim.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.io.*;

/** Share generated PNG cards using temporary read-only content URIs. */
@CapacitorPlugin(name = "ImageShare")
public class ImageSharePlugin extends Plugin {
    private byte[] image(PluginCall call) {
        String encoded = call.getString("base64", "");
        if (encoded.length() > 12 * 1024 * 1024) throw new IllegalArgumentException("Image too large");
        byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
        byte[] png = {(byte)137, 80, 78, 71, 13, 10, 26, 10};
        if (bytes.length < png.length) throw new IllegalArgumentException("Invalid PNG");
        for (int i=0; i<png.length; i++) if (bytes[i] != png[i]) throw new IllegalArgumentException("Invalid PNG");
        return bytes;
    }
    @PluginMethod public void share(PluginCall call) {
        try {
            File directory = new File(getContext().getCacheDir(), "share-cards");
            if (!directory.isDirectory() && !directory.mkdirs()) throw new IOException("No cache directory");
            File[] previous = directory.listFiles();
            if (previous != null) for (File file : previous) if (file.lastModified() < System.currentTimeMillis()-86400000L) file.delete();
            File file = File.createTempFile("zadmuslim-", ".png", directory);
            try (OutputStream output = new FileOutputStream(file)) { output.write(image(call)); }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName()+".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND).setType("image/png");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_TEXT, call.getString("text", ""));
            send.setClipData(ClipData.newRawUri("زاد المسلم", uri));
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(send, "مشاركة الصورة"));
            call.resolve();
        } catch (Exception error) { call.reject("Could not share image", error); }
    }
    @PluginMethod public void save(PluginCall call) {
        try {
            image(call);
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("image/png");
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.putExtra(Intent.EXTRA_TITLE, "zadmuslim-verse.png");
            startActivityForResult(call, intent, "imageSelected");
        } catch (Exception error) { call.reject("Could not open image save dialog", error); }
    }
    @ActivityCallback private void imageSelected(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject response = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            response.put("cancelled", true); call.resolve(response); return;
        }
        try (OutputStream output = getContext().getContentResolver().openOutputStream(result.getData().getData(), "wt")) {
            if (output == null) throw new IOException("No output stream");
            output.write(image(call)); output.flush();
            response.put("saved", true); call.resolve(response);
        } catch (Exception error) { call.reject("Could not save image", error); }
    }
}

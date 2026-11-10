import Capacitor
import WidgetKit
import UIKit

@objc(RadioNativePlugin)
public class RadioNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RadioNativePlugin"
    public let jsName = "RadioNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "play", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setSleepTimer", returnType: CAPPluginReturnPromise)
    ]
    @objc func play(_ call: CAPPluginCall) {
        let station = ["id": call.getString("id") ?? "cairo", "name": call.getString("name") ?? "راديو القرآن", "url": call.getString("url") ?? "", "backupUrl": call.getString("backupUrl") ?? ""]
        Task { @MainActor in
            do { try ZadRadioPlayback.shared.play(station: station); ZadRadioPlayback.shared.setVolume(Float(call.getDouble("volume") ?? 0.8)); call.resolve() }
            catch { call.reject(error.localizedDescription) }
        }
    }
    @objc func stop(_ call: CAPPluginCall) { Task { @MainActor in ZadRadioPlayback.shared.stop(); call.resolve() } }
    @objc func getState(_ call: CAPPluginCall) {
        Task { @MainActor in
            let p = ZadRadioPlayback.shared
            call.resolve(["wanted": p.wanted, "state": p.state, "id": p.station["id"] ?? "cairo", "error": p.error, "deadline": p.deadline, "position": 0, "duration": 0])
        }
    }
    @objc func setVolume(_ call: CAPPluginCall) { Task { @MainActor in ZadRadioPlayback.shared.setVolume(Float(call.getDouble("volume") ?? 0.8)); call.resolve() } }
    @objc func setSleepTimer(_ call: CAPPluginCall) { Task { @MainActor in ZadRadioPlayback.shared.setSleepTimer(call.getDouble("at") ?? 0); call.resolve() } }
}

@objc(PrayerWidgetNativePlugin)
public class PrayerWidgetNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PrayerWidgetNativePlugin"
    public let jsName = "PrayerWidgetNative"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "updatePrayerWidget", returnType: CAPPluginReturnPromise)]
    @objc func updatePrayerWidget(_ call: CAPPluginCall) {
        // A named defaults suite can exist even when re-signing removed App Groups.
        guard FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.zadmuslim.app") != nil,
              let shared = UserDefaults(suiteName: "group.com.zadmuslim.app") else {
            call.reject("Widget sharing is unavailable in this app signature", "WIDGET_APP_GROUP_UNAVAILABLE")
            return
        }
        shared.set(call.getString("timingsJson") ?? "{}", forKey: "last_timings_json")
        shared.set(call.getString("hijriDate") ?? "", forKey: "last_hijri_date")
        shared.set(call.getString("cityName") ?? "", forKey: "widgetCity")
        if call.getBool("dataVerified") == true { shared.set(Date(), forKey: "prayerUpdated") }
        else { shared.removeObject(forKey: "prayerUpdated") }
        WidgetCenter.shared.reloadTimelines(ofKind: "PrayerWidget")
        call.resolve(["success": true])
    }
}

class ZadBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(RadioNativePlugin())
        bridge?.registerPluginInstance(PrayerWidgetNativePlugin())
        bridge?.registerPluginInstance(ImageSharePlugin())
    }
}

@objc(ImageSharePlugin)
public class ImageSharePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ImageSharePlugin"
    public let jsName = "ImageShare"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "share", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "save", returnType: CAPPluginReturnPromise)
    ]
    @objc func share(_ call: CAPPluginCall) { presentImage(call) }
    // The system sheet offers Save Image / Save to Files without automatic publishing.
    @objc func save(_ call: CAPPluginCall) { presentImage(call) }
    private func presentImage(_ call: CAPPluginCall) {
        guard let encoded = call.getString("base64"), encoded.count <= 12 * 1024 * 1024,
              let data = Data(base64Encoded: encoded),
              data.starts(with: [137, 80, 78, 71, 13, 10, 26, 10]),
              let image = UIImage(data: data) else { call.reject("Invalid PNG"); return }
        DispatchQueue.main.async { [weak self] in
            guard let host = self?.bridge?.viewController, host.presentedViewController == nil else {
                call.reject("Another dialog is open"); return
            }
            let sheet = UIActivityViewController(activityItems: [image], applicationActivities: nil)
            if let popover = sheet.popoverPresentationController {
                popover.sourceView = host.view
                popover.sourceRect = CGRect(x: host.view.bounds.midX, y: host.view.bounds.midY, width: 1, height: 1)
                popover.permittedArrowDirections = []
            }
            sheet.completionWithItemsHandler = { activity, completed, _, error in
                if let error = error { call.reject(error.localizedDescription); return }
                call.resolve(["cancelled": !completed, "saved": completed && activity == .saveToCameraRoll])
            }
            host.present(sheet, animated: true)
        }
    }
}

import Capacitor
import WidgetKit

@objc(RadioNativePlugin)
public class RadioNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RadioNativePlugin"
    public let jsName = "RadioNative"
    public let pluginMethods = ["play", "stop", "getState", "setVolume", "setSleepTimer"].map { CAPPluginMethod(name: $0, returnType: CAPPluginReturnPromise) }
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
    public let pluginMethods = [CAPPluginMethod(name: "updatePrayerWidget", returnType: CAPPluginReturnPromise)]
    @objc func updatePrayerWidget(_ call: CAPPluginCall) {
        guard let shared = UserDefaults(suiteName: "group.com.zadmuslim.app") else { call.reject("App Group unavailable"); return }
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
    }
}

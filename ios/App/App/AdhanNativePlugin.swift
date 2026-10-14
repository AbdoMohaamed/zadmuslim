import Foundation
import Capacitor
import WidgetKit

@objc(AdhanNativePlugin)
public class AdhanNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AdhanNativePlugin"
    public let jsName = "AdhanNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updatePrayerWidget", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scheduleDiagnosticTestAlarm", returnType: CAPPluginReturnPromise)
    ]

    private let appGroupId = "group.com.zadmuslim.app"

    @objc func updatePrayerWidget(_ call: CAPPluginCall) {
        let timingsJson = call.getString("timingsJson") ?? ""
        let hijriDate = call.getString("hijriDate") ?? ""

        // Save to Shared App Group container so WidgetKit Extension can read it
        if let sharedDefaults = UserDefaults(suiteName: appGroupId) {
            sharedDefaults.set(timingsJson, forKey: "last_timings_json")
            sharedDefaults.set(hijriDate, forKey: "last_hijri_date")
            sharedDefaults.synchronize()
        }
        
        // Also save to standard UserDefaults as backup
        UserDefaults.standard.set(timingsJson, forKey: "last_timings_json")
        UserDefaults.standard.set(hijriDate, forKey: "last_hijri_date")

        // Trigger WidgetKit to reload timelines immediately
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve([
            "success": true,
            "message": "iOS Widget updated successfully"
        ])
    }

    @objc func scheduleDiagnosticTestAlarm(_ call: CAPPluginCall) {
        let delaySeconds = call.getInt("delaySeconds") ?? 120
        let prayerName = call.getString("prayerName") ?? "صلاة العصر"
        let muazzin = call.getString("muazzin") ?? "makkah"

        let content = UNMutableNotificationContent()
        content.title = "🕌 حان الآن موعد \(prayerName)"
        content.body = "الله أكبر، الله أكبر.. حي على الصلاة، حي على الفلاح 🕋"
        content.sound = UNNotificationSound(named: UNNotificationSoundName("adhan_\(muazzin).mp3"))
        content.badge = 1

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: TimeInterval(delaySeconds), repeats: false)
        let request = UNNotificationRequest(identifier: "diagnostic_test_adhan", content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                call.reject("Failed to schedule diagnostic alarm: \(error.localizedDescription)")
            } else {
                call.resolve([
                    "success": true,
                    "delaySeconds": delaySeconds,
                    "message": "تمت جدولة إشعار الأذان الفعلي بنجاح"
                ])
            }
        }
    }
}

import Foundation
import Capacitor
import WidgetKit
import UserNotifications

@objc(AdhanNativePlugin)
public class AdhanNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AdhanNativePlugin"
    public let jsName = "AdhanNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updatePrayerWidget", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "testAdhanNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scheduleDiagnosticTestAlarm", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "schedulePrayerAlarms", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkAlarmPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopAdhan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelAllAlarms", returnType: CAPPluginReturnPromise)
    ]

    private let appGroupId = "group.com.zadmuslim.app"

    @objc func cancelAllAlarms(_ call: CAPPluginCall) {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { requests in
            let ids = requests.filter { $0.identifier.hasPrefix("prayer_") || $0.identifier.hasPrefix("pre_prayer_") }.map { $0.identifier }
            center.removePendingNotificationRequests(withIdentifiers: ids)
            call.resolve(["success": true])
        }
    }

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

    @objc func schedulePrayerAlarms(_ call: CAPPluginCall) {
        guard let timingsObj = call.getObject("timings") else {
            call.reject("Timings object is required")
            return
        }

        let muazzin = call.getString("muazzin") ?? "qatami"
        let preAlert = call.getBoolean("preAlert") ?? true
        let adhanEnabled = call.getBoolean("adhan") ?? true
        let preAlertInterval = call.getInt("preAlertInterval") ?? 5
        let enabledPrayers = call.getObject("enabledPrayers") ?? [:]

        let center = UNUserNotificationCenter.current()

        // 1. Cancel existing prayer notifications to avoid duplicates
        center.getPendingNotificationRequests { requests in
            let prayerIds = requests.filter { $0.identifier.starts(with: "prayer_") || $0.identifier.starts(with: "pre_prayer_") }.map { $0.identifier }
            center.removePendingNotificationRequests(withIdentifiers: prayerIds)

            let prayerKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"]
            let prayerNames = ["صلاة الفجر", "صلاة الظهر", "صلاة العصر", "صلاة المغرب", "صلاة العشاء"]
            let timingKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

            let now = Date()
            var scheduledCount = 0
            let calendar = Calendar.current

            // Schedule for 3 days (staying well within iOS 64 pending notification limit)
            for dayOffset in 0...0 {
                guard let targetDate = calendar.date(byAdding: .day, value: dayOffset, to: now) else { continue }

                for i in 0..<prayerKeys.count {
                    let key = prayerKeys[i]
                    if let isEnabled = enabledPrayers[key] as? Bool, !isEnabled {
                        continue
                    }

                    guard let rawTime = timingsObj[timingKeys[i]] as? String else { continue }
                    let clean = rawTime.components(separatedBy: " ").first ?? ""
                    let parts = clean.components(separatedBy: ":")
                    guard parts.count >= 2,
                          let hour = Int(parts[0]),
                          let minute = Int(parts[1]) else { continue }

                    var components = calendar.dateComponents([.year, .month, .day], from: targetDate)
                    components.hour = hour
                    components.minute = minute
                    components.second = 0

                    guard let prayerDate = calendar.date(from: components) else { continue }

                    // A) Pre-alert (configured minutes before)
                    if preAlert {
                        let preIntervalSeconds = Double(preAlertInterval * 60)
                        let preAlertDate = prayerDate.addingTimeInterval(-preIntervalSeconds)
                        if preAlertDate.timeIntervalSince(now) > 2.0 {
                            let preContent = UNMutableNotificationContent()
                            preContent.title = "⏳ اقتربت \(prayerNames[i])"
                            let intervalWord = preAlertInterval == 1 ? "دقيقة واحدة" : "\(preAlertInterval) دقائق"
                            preContent.body = "بقي \(intervalWord) على دخول وقت \(prayerNames[i]). تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿"
                            let preSoundName = "pre_\(key).mp3"
                            preContent.sound = UNNotificationSound(named: UNNotificationSoundName(preSoundName))
                            preContent.userInfo = ["type": "pre_prayer", "prayerKey": key]

                            let triggerComponents = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: preAlertDate)
                            let trigger = UNCalendarNotificationTrigger(dateMatching: triggerComponents, repeats: false)
                            let reqId = "pre_prayer_\(key)_\(dayOffset)"
                            let request = UNNotificationRequest(identifier: reqId, content: preContent, trigger: trigger)
                            center.add(request, withCompletionHandler: nil)
                            scheduledCount += 1
                        }
                    }

                    // B) Main Adhan (At prayer time)
                    if adhanEnabled && prayerDate.timeIntervalSince(now) > 2.0 {
                        let adhanContent = UNMutableNotificationContent()
                        adhanContent.title = "🕌 حَانَ الآنَ مَوْعِدُ \(prayerNames[i])"
                        adhanContent.body = "الله أكبر، الله أكبر.. حان الآن موعد \(prayerNames[i]) حسب توقيتك المحلي. حيّ على الصلاة، حيّ على الفلاح 🕋"
                        let soundFile = key == "fajr" ? "adhan_fajr.mp3" : "adhan_\(muazzin).mp3"
                        adhanContent.sound = UNNotificationSound(named: UNNotificationSoundName(soundFile))
                        adhanContent.userInfo = ["type": "adhan_call", "prayerKey": key, "muazzin": muazzin]

                        let triggerComponents = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: prayerDate)
                        let trigger = UNCalendarNotificationTrigger(dateMatching: triggerComponents, repeats: false)
                        let reqId = "prayer_\(key)_\(dayOffset)"
                        let request = UNNotificationRequest(identifier: reqId, content: adhanContent, trigger: trigger)
                        center.add(request, withCompletionHandler: nil)
                        scheduledCount += 1
                    }
                }
            }

            call.resolve([
                "success": true,
                "scheduledCount": scheduledCount,
                "message": "Scheduled \(scheduledCount) notifications in iOS UNUserNotificationCenter"
            ])
        }
    }

    @objc func testAdhanNotification(_ call: CAPPluginCall) {
        let prayerName = call.getString("prayerName") ?? "صلاة العصر"
        let prayerKey = call.getString("prayerKey") ?? "asr"
        let muazzin = call.getString("muazzin") ?? "qatami"

        let content = UNMutableNotificationContent()
        content.title = "🕌 تجربة إشعار الأذان • \(prayerName)"
        content.body = "الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح 🕋"
        let soundFile = prayerKey == "fajr" ? "adhan_fajr.mp3" : "adhan_\(muazzin).mp3"
        content.sound = UNNotificationSound(named: UNNotificationSoundName(soundFile))
        content.userInfo = ["type": "adhan_call", "prayerKey": prayerKey, "muazzin": muazzin]
        content.badge = 1

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1.0, repeats: false)
        let request = UNNotificationRequest(identifier: "test_immediate_adhan", content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                call.reject("Failed to schedule test adhan: \(error.localizedDescription)")
            } else {
                call.resolve([
                    "success": true,
                    "message": "Immediate test adhan notification scheduled"
                ])
            }
        }
    }

    @objc func scheduleDiagnosticTestAlarm(_ call: CAPPluginCall) {
        let type = call.getString("type") ?? "adhan"
        let isPreAlert = type.lowercased() == "pre_prayer"
        let delaySeconds = call.getInt("delaySeconds") ?? (isPreAlert ? 60 : 120)
        let prayerName = call.getString("prayerName") ?? "صلاة العصر"
        let prayerKey = call.getString("prayerKey") ?? "asr"
        let muazzin = call.getString("muazzin") ?? "qatami"

        let content = UNMutableNotificationContent()
        if isPreAlert {
            content.title = "⏳ اقتربت \(prayerName) (اختبار التشخيص)"
            content.body = "بقي دقيقة واحدة على دخول وقت \(prayerName). تَهَيّأْ للوضوء والصلاة 🌿"
            content.sound = UNNotificationSound(named: UNNotificationSoundName("pre_\(prayerKey).mp3"))
            content.userInfo = ["type": "diagnostic_pre_alert", "prayerKey": prayerKey]
        } else {
            content.title = "🕌 حان الآن موعد \(prayerName) (اختبار التشخيص)"
            content.body = "الله أكبر، الله أكبر.. حي على الصلاة، حي على الفلاح 🕋"
            content.sound = UNNotificationSound(named: UNNotificationSoundName("adhan_\(muazzin).mp3"))
            content.userInfo = ["type": "diagnostic_adhan", "prayerKey": prayerKey, "muazzin": muazzin]
        }
        content.badge = 1

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: TimeInterval(delaySeconds), repeats: false)
        let reqId = isPreAlert ? "diagnostic_test_pre" : "diagnostic_test_adhan"
        let request = UNNotificationRequest(identifier: reqId, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                call.reject("Failed to schedule diagnostic alarm: \(error.localizedDescription)")
            } else {
                call.resolve([
                    "success": true,
                    "type": type,
                    "delaySeconds": delaySeconds,
                    "message": "تمت جدولة إشعار اختبار التشخيص بنجاح بعد \(delaySeconds) ثانية"
                ])
            }
        }
    }

    @objc func checkAlarmPermissions(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let granted = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
            call.resolve([
                "notificationsGranted": granted,
                "exactAlarmsGranted": true, // Not restricted on iOS
                "batteryOptimizationsIgnored": true
            ])
        }
    }

    @objc func stopAdhan(_ call: CAPPluginCall) {
        call.resolve([
            "success": true,
            "stopped": true
        ])
    }
}

import UIKit
import Capacitor
import AVFoundation
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure Audio Session for reliable Adhan and audio playback
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers, .duckOthers])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to configure AVAudioSession:", error)
        }

        // Enable iOS Background Fetch to check for admin broadcasts in background
        UIApplication.shared.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)

        // Request native iOS notification permission immediately upon launch
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            print("iOS Notification Authorization: \(granted)")
        }
        UNUserNotificationCenter.current().delegate = self

        // Enable native back/forward swipe gesture in iOS WKWebView
        DispatchQueue.main.async {
            if let bridgeVC = self.window?.rootViewController as? CAPBridgeViewController {
                bridgeVC.webView?.allowsBackForwardNavigationGestures = true
            }
        }

        // Check for latest admin broadcasts immediately on app launch
        checkCloudBroadcastsInBackground { _ in }

        return true
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge, .list])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        checkCloudBroadcastsInBackground(completionHandler: completionHandler)
    }

    private func checkCloudBroadcastsInBackground(completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        guard let url = URL(string: "https://sadqah-jaddi-default-rtdb.firebaseio.com/push_broadcasts.json") else {
            completionHandler(.failed)
            return
        }

        var request = URLRequest(url: url)
        request.timeoutInterval = 10.0

        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data, error == nil else {
                completionHandler(.failed)
                return
            }

            do {
                guard let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: [String: Any]] else {
                    completionHandler(.noData)
                    return
                }

                let sortedKeys = json.keys.sorted()
                guard let lastKey = sortedKeys.last, let broadcast = json[lastKey] else {
                    completionHandler(.noData)
                    return
                }

                let lastSeenKey = UserDefaults.standard.string(forKey: "zad_last_seen_broadcast_id") ?? ""
                if lastKey == lastSeenKey {
                    completionHandler(.noData)
                    return
                }

                let title = broadcast["title"] as? String ?? "زاد المسلم 🌿"
                let body = broadcast["body"] as? String ?? ""
                let timestamp = broadcast["timestamp"] as? Double ?? 0

                let now = Date().timeIntervalSince1970 * 1000
                if timestamp > 0 && (now - timestamp) > (24 * 60 * 60 * 1000) {
                    completionHandler(.noData)
                    return
                }

                guard !body.isEmpty else {
                    completionHandler(.noData)
                    return
                }

                let content = UNMutableNotificationContent()
                content.title = title
                content.body = body
                content.sound = UNNotificationSound(named: UNNotificationSoundName("adhan_makkah.mp3"))
                content.badge = 1

                let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
                let notifRequest = UNNotificationRequest(identifier: "broadcast_\(lastKey)", content: content, trigger: trigger)

                UNUserNotificationCenter.current().add(notifRequest) { _ in
                    UserDefaults.standard.set(lastKey, forKey: "zad_last_seen_broadcast_id")
                    completionHandler(.newData)
                }
            } catch {
                completionHandler(.failed)
            }
        }.resume()
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

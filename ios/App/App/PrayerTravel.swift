import UIKit
import CoreLocation
import UserNotifications
import Capacitor

@MainActor
final class PrayerTravel: NSObject, CLLocationManagerDelegate {
    static let shared = PrayerTravel()
    private let manager = CLLocationManager()
    private let defaults = UserDefaults.standard
    private var work: Task<Void, Never>?
    private var revision = 0
    override init() { super.init(); manager.delegate = self }
    var authorized: Bool { manager.authorizationStatus == .authorizedAlways }
    func restore() {
        if defaults.bool(forKey: "travelEnabled") && authorized && CLLocationManager.significantLocationChangeMonitoringAvailable() {
            manager.startMonitoringSignificantLocationChanges()
        } else { manager.stopMonitoringSignificantLocationChanges() }
    }
    func configure(enabled: Bool, prompt: Bool, method: String, school: String) {
        revision += 1
        work?.cancel()
        defaults.set(enabled, forKey: "travelEnabled")
        defaults.set(method, forKey: "travelMethod")
        defaults.set(school, forKey: "travelSchool")
        if enabled && prompt && !authorized { manager.requestAlwaysAuthorization() }
        if !enabled { defaults.removeObject(forKey: "travelLastFix") }
        restore()
    }
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) { restore() }

    // Keep the exact localized content, sound, attachments and enabled prayers from the foreground scheduler.
    func remember(minutes: Int) async throws {
        revision += 1
        let version = revision
        let pending = await UNUserNotificationCenter.current().pendingNotificationRequests()
        var templates = [String:Data]()
        for request in pending {
            guard let id = Int(request.identifier), id > 0 && id < 70000,
                  let extra = request.content.userInfo["cap_extra"] as? [String:Any],
                  let type = extra["type"] as? String, ["adhan_call","pre_prayer_alert"].contains(type) else { continue }
            let key = String(id % 2000)
            if templates[key] == nil { templates[key] = try NSKeyedArchiver.archivedData(withRootObject: request.content, requiringSecureCoding: true) }
        }
        guard revision == version else { return }
        defaults.set(templates, forKey: "travelAlerts")
        defaults.set(minutes, forKey: "travelPreMinutes")
    }
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let fix = locations.last, authorized, defaults.bool(forKey: "travelEnabled"),
              fix.horizontalAccuracy >= 0 && fix.horizontalAccuracy <= 5000,
              abs(fix.timestamp.timeIntervalSinceNow) < 3600, UIApplication.shared.applicationState != .active else { return }
        if let previous = defaults.array(forKey: "travelLastFix") as? [Double], previous.count == 3,
           Date().timeIntervalSince1970 - previous[2] < 86400,
           fix.distance(from: CLLocation(latitude:previous[0],longitude:previous[1])) < 3000 { return }
        work?.cancel()
        work = Task {
            let background = UIApplication.shared.beginBackgroundTask { [weak self] in self?.work?.cancel() }
            defer { if background != .invalid { UIApplication.shared.endBackgroundTask(background) } }
            do {
                if try await reschedule(fix.coordinate) {
                    defaults.set([fix.coordinate.latitude,fix.coordinate.longitude,Date().timeIntervalSince1970], forKey:"travelLastFix")
                }
            } catch { NSLog("Travel prayer update deferred: %@",error.localizedDescription) }
        }
    }
    private func month(_ date: Date, _ coordinate: CLLocationCoordinate2D, _ calendar: Calendar) async throws -> [[String:Any]] {
        let method = defaults.string(forKey:"travelMethod") ?? ""
        let year = calendar.component(.year,from:date), month = calendar.component(.month,from:date)
        var url = URLComponents(string:"https://api.aladhan.com/v1/calendar/\(year)/\(month)")!
        var values = ["latitude":String(coordinate.latitude),"longitude":String(coordinate.longitude),
                      "school":defaults.string(forKey:"travelSchool") ?? "0","iso8601":"true"]
        if !method.isEmpty { values["method"] = method }
        url.queryItems = values.map { URLQueryItem(name:$0.key,value:$0.value) }
        let (data,response) = try await URLSession.shared.data(from:url.url!)
        guard (response as? HTTPURLResponse)?.statusCode == 200,
              let json = try JSONSerialization.jsonObject(with:data) as? [String:Any],
              let days = json["data"] as? [[String:Any]] else { throw URLError(.badServerResponse) }
        return days
    }
    private func reschedule(_ coordinate: CLLocationCoordinate2D) async throws -> Bool {
        let version = revision
        let templates = defaults.dictionary(forKey:"travelAlerts") as? [String:Data] ?? [:]
        guard !templates.isEmpty else { return false }
        var calendar = Calendar(identifier:.gregorian)
        calendar.timeZone = .current
        let now = Date(), format = ISO8601DateFormatter()
        let center = UNUserNotificationCenter.current()
        let pending = await center.pendingNotificationRequests()
        let old = pending.filter { (1..<70000).contains(Int($0.identifier) ?? -1) && $0.content.categoryIdentifier == "OPEN_PRAYER" }
        let limit = min(50,64-(pending.count-old.count))
        var rows = [[String:Any]](), loadedMonth = -1, requests = [(Date,UNNotificationRequest)]()
        for offset in 0..<14 {
            let date = calendar.date(byAdding:.day,value:offset,to:now)!
            let number = calendar.component(.month,from:date)
            if number != loadedMonth { rows = try await month(date,coordinate,calendar); loadedMonth = number }
            let index = calendar.component(.day,from:date)-1
            guard rows.indices.contains(index), let times = rows[index]["timings"] as? [String:String] else { throw URLError(.cannotParseResponse) }
            for (key,data) in templates {
                guard let base = Int(key) else { continue }
                let prayer = (base % 1000)/100-1, names = ["Fajr","Dhuhr","Asr","Maghrib","Isha"]
                guard names.indices.contains(prayer), let raw = times[names[prayer]], let at = format.date(from:raw),
                      let content = try NSKeyedUnarchiver.unarchivedObject(ofClass:UNNotificationContent.self,from:data) else { throw URLError(.cannotParseResponse) }
                let when = at.addingTimeInterval(base >= 1000 ? -Double(defaults.integer(forKey:"travelPreMinutes"))*60 : 0)
                guard when.timeIntervalSince(now)>1 else { continue }
                var utc = Calendar(identifier:.gregorian); utc.timeZone = TimeZone(secondsFromGMT:0)!
                let components = utc.dateComponents([.timeZone,.year,.month,.day,.hour,.minute,.second],from:when)
                requests.append((when,UNNotificationRequest(identifier:String(base+2000*offset),content:content,trigger:UNCalendarNotificationTrigger(dateMatching:components,repeats:false))))
            }
            if requests.count >= limit { break }
        }
        guard limit > 0, !requests.isEmpty, authorized, defaults.bool(forKey:"travelEnabled"), version == revision, !Task.isCancelled else { return false }
        let replacement = requests.sorted{$0.0<$1.0}.prefix(limit)
        let ids = Set(replacement.map{$0.1.identifier})
        // Free slots for new IDs only after a complete calendar has been calculated.
        center.removePendingNotificationRequests(withIdentifiers:old.map(\.identifier).filter{!ids.contains($0)})
        for (_,request) in replacement {
            guard version == revision, !Task.isCancelled else { return false }
            try await center.add(request)
        }
        return true
    }
}

@objc(PrayerTravelPlugin)
public class PrayerTravelPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PrayerTravelPlugin"
    public let jsName = "PrayerTravel"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name:"configure",returnType:CAPPluginReturnPromise),
                                CAPPluginMethod(name:"remember",returnType:CAPPluginReturnPromise)]
    @objc func configure(_ call: CAPPluginCall) {
        Task { @MainActor in
            let travel = PrayerTravel.shared
            travel.configure(enabled:call.getBool("enabled") ?? false,prompt:call.getBool("prompt") ?? false,
                             method:call.getString("method") ?? "",school:call.getString("school") ?? "0")
            call.resolve(["authorized":travel.authorized])
        }
    }
    @objc func remember(_ call: CAPPluginCall) {
        Task { @MainActor in
            do { try await PrayerTravel.shared.remember(minutes:call.getInt("minutes") ?? 5); call.resolve() }
            catch { call.reject(error.localizedDescription) }
        }
    }
}

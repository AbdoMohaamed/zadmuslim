import Capacitor
import WidgetKit
import UIKit

@objc(RadioNativePlugin)
public class RadioNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RadioNativePlugin"
    public let jsName = "RadioNative"
    @MainActor private var download: URLSessionDownloadTask?
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "downloadAudio", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "downloadProgress", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listDownloads", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "play", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setSleepTimer", returnType: CAPPluginReturnPromise)
    ]
    @objc func listDownloads(_ call: CAPPluginCall) {
        Task { @MainActor in
            let items = ["azkar","azkar-evening"].compactMap { id -> [String:String]? in
                guard let file = ZadRadioPlayback.adhkarFile(id), FileManager.default.fileExists(atPath: file.path) else { return nil }
                return ["id": id]
            }
            call.resolve(["items": items])
        }
    }
    @objc func downloadProgress(_ call: CAPPluginCall) {
        Task { @MainActor in call.resolve(["received": download?.countOfBytesReceived ?? 0, "total": download?.countOfBytesExpectedToReceive ?? 0]) }
    }
    @objc func downloadAudio(_ call: CAPPluginCall) {
        Task { @MainActor in
            let id = call.getString("id") ?? ""
            guard let file = ZadRadioPlayback.adhkarFile(id), download == nil else { call.reject("Invalid or active download"); return }
            if FileManager.default.fileExists(atPath: file.path) { call.resolve(); return }
            let number = id == "azkar" ? "03" : "04"
            let source = URL(string: "https://download.tvquran.com/download/TvQuran.com__Athkar/TvQuran.com_athkar_" + number + ".mp3")!
            let task = URLSession.shared.downloadTask(with: source) { temp, response, error in
                defer { Task { @MainActor in self.download = nil } }
                do {
                    if let error = error { throw error }
                    guard let temp = temp, let http = response as? HTTPURLResponse, http.statusCode == 200 else { throw URLError(.badServerResponse) }
                    let size = try temp.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
                    let data = try Data(contentsOf: temp, options: .mappedIfSafe)
                    guard size > 3, http.expectedContentLength <= 0 || Int64(size) == http.expectedContentLength,
                          data.starts(with: [73,68,51]) || (data[0] == 255 && data[1] & 224 == 224) else { throw URLError(.cannotDecodeContentData) }
                    try FileManager.default.createDirectory(at: file.deletingLastPathComponent(), withIntermediateDirectories: true)
                    try FileManager.default.moveItem(at: temp, to: file)
                    call.resolve()
                } catch { call.reject(error.localizedDescription) }
            }
            download = task
            task.resume()
        }
    }
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
            call.resolve(["wanted": p.wanted, "state": p.state, "id": p.station["id"] ?? "cairo", "savedAdhkar": p.savedAdhkar != nil, "error": p.error, "deadline": p.deadline, "position": 0, "duration": 0])
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
        bridge?.registerPluginInstance(PrayerTravelPlugin())
        bridge?.registerPluginInstance(PrayerWidgetNativePlugin())
        bridge?.registerPluginInstance(ImageSharePlugin())
        bridge?.registerPluginInstance(BackupFilesPlugin())
    }
}

@objc(BackupFilesPlugin)
public class BackupFilesPlugin: CAPPlugin, CAPBridgedPlugin, UIDocumentPickerDelegate {
    public let identifier = "BackupFilesPlugin"
    public let jsName = "BackupFiles"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "saveBackup", returnType: CAPPluginReturnPromise)]
    private var pendingCall: CAPPluginCall?
    private var temporaryDirectory: URL?

    @objc func saveBackup(_ call: CAPPluginCall) {
        guard let name = call.getString("fileName"),
              name.range(of: #"^zad-backup-[0-9]{4}-[0-9]{2}-[0-9]{2}\.json$"#, options: .regularExpression) != nil,
              let content = call.getString("content"), content.utf8.count <= 5 * 1024 * 1024 else {
            call.reject("ملف النسخة الاحتياطية غير صالح.")
            return
        }
        DispatchQueue.main.async {
            guard self.pendingCall == nil, let host = self.bridge?.viewController,
                  host.viewIfLoaded?.window != nil, host.presentedViewController == nil else {
                call.reject("أغلق النافذة المفتوحة وحاول مرة أخرى.")
                return
            }
            let files = FileManager.default
            let directory = files.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
            let file = directory.appendingPathComponent(name)
            do {
                try files.createDirectory(at: directory, withIntermediateDirectories: false)
                try Data(content.utf8).write(to: file, options: .atomic)
            } catch {
                try? files.removeItem(at: directory)
                call.reject(error.localizedDescription)
                return
            }
            self.pendingCall = call
            self.temporaryDirectory = directory
            let picker = UIDocumentPickerViewController(forExporting: [file], asCopy: true)
            picker.delegate = self
            picker.modalPresentationStyle = .fullScreen
            host.present(picker, animated: true)
        }
    }

    public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        finish(saved: !urls.isEmpty)
    }

    public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        finish(saved: false)
    }

    private func finish(saved: Bool) {
        if let directory = temporaryDirectory { try? FileManager.default.removeItem(at: directory) }
        temporaryDirectory = nil
        let call = pendingCall
        pendingCall = nil
        call?.resolve(["saved": saved, "cancelled": !saved])
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
            var items: [Any] = [image]
            if let text = call.getString("text"), !text.isEmpty { items.append(text) }
            let sheet = UIActivityViewController(activityItems: items, applicationActivities: nil)
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

import Foundation
import AVFoundation
import MediaPlayer
import WidgetKit
import AppIntents

// Compiled into both targets; AudioPlaybackIntent executes this in the app process.
#if !WIDGET_EXTENSION
@MainActor
final class ZadRadioPlayback {
    static let shared = ZadRadioPlayback()
    static let group = "group.com.zadmuslim.app"
    private let defaults = UserDefaults(suiteName: "group.com.zadmuslim.app")!
    private var player: AVPlayer?
    private var observation: NSKeyValueObservation?
    private var itemObservation: NSKeyValueObservation?
    private var itemEvents: [NSObjectProtocol] = []
    private var timeout: Task<Void, Never>?
    private var sleepTask: Task<Void, Never>?
    private var interruption: NSObjectProtocol?
    private var routeChange: NSObjectProtocol?
    private var volume: Float = 0.8
    private var retryCount = 0
    private var backup = false
    private var generation = 0
    private(set) var wanted = false
    private(set) var state = "paused"
    private(set) var error = ""
    private(set) var deadline: Double = 0
    private(set) var station: [String: String]

    private init() {
        station = defaults.dictionary(forKey: "radioStation") as? [String: String] ?? [
            "id": "cairo", "name": "إذاعة القرآن الكريم من القاهرة",
            "url": "https://stream.radiojar.com/8s5u5tpdtwzuv",
            "backupUrl": "https://radio.xecod.com/station/quran-cairo"
        ]
        let commands = MPRemoteCommandCenter.shared()
        commands.playCommand.addTarget { _ in Task { @MainActor in try? self.play() }; return .success }
        commands.pauseCommand.addTarget { _ in Task { @MainActor in self.stop() }; return .success }
        commands.stopCommand.addTarget { _ in Task { @MainActor in self.stop() }; return .success }
        interruption = NotificationCenter.default.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { note in
            let type = (note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt).flatMap(AVAudioSession.InterruptionType.init(rawValue:))
            let options = note.userInfo?[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0
            Task { @MainActor in
                if type == .began { self.timeout?.cancel(); self.player?.pause(); self.publish("interrupted") }
                else if self.wanted && AVAudioSession.InterruptionOptions(rawValue: options).contains(.shouldResume) { try? self.play() }
                else { self.stop() }
            }
        }
        routeChange = NotificationCenter.default.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main) { note in
            let reason = note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
            if reason == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue { Task { @MainActor in self.stop() } }
        }
    }
    static func allowed(_ value: String) -> Bool {
        guard let url = URL(string: value), url.scheme == "https" else { return false }
        return ["stream.radiojar.com", "qurango.net", "backup.qurango.net"].contains(url.host ?? "") || value == "https://radio.xecod.com/station/quran-cairo"
    }
    func play(station selected: [String: String]? = nil) throws {
        if let selected = selected {
            guard Self.allowed(selected["url"] ?? ""), (selected["backupUrl"] ?? "").isEmpty || Self.allowed(selected["backupUrl"]!) else {
                throw NSError(domain: "ZadRadio", code: 1, userInfo: [NSLocalizedDescriptionKey: "Unsupported stream"])
            }
            station = selected; defaults.set(selected, forKey: "radioStation")
        }
        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try AVAudioSession.sharedInstance().setActive(true)
        wanted = true; error = ""; retryCount = 0; backup = false
        connect()
    }
    private func connect() {
        timeout?.cancel(); generation += 1
        observation = nil; itemObservation = nil; clearItemEvents(); player?.pause()
        guard wanted, let url = URL(string: (backup ? station["backupUrl"] : nil) ?? station["url"] ?? "") else { stop(); return }
        let item = AVPlayerItem(url: url)
        item.preferredForwardBufferDuration = 8
        let audio = AVPlayer(playerItem: item)
        player = audio; audio.volume = volume; audio.automaticallyWaitsToMinimizeStalling = true
        publish("connecting")
        let ticket = generation
        observation = audio.observe(\.timeControlStatus, options: [.new]) { _, _ in
            Task { @MainActor in
                guard ticket == self.generation, self.wanted else { return }
                if self.player?.timeControlStatus == .playing {
                    self.timeout?.cancel(); self.retryCount = 0; self.publish("playing")
                } else if self.player?.timeControlStatus == .waitingToPlayAtSpecifiedRate {
                    self.publish("buffering"); self.armTimeout(ticket)
                }
            }
        }
        itemObservation = item.observe(\.status, options: [.new]) { item, _ in
            let failed = item.status == .failed
            Task { @MainActor in if failed && ticket == self.generation { self.retry(ticket) } }
        }
        for event in [AVPlayerItem.didPlayToEndTimeNotification, AVPlayerItem.failedToPlayToEndTimeNotification] {
            itemEvents.append(NotificationCenter.default.addObserver(forName: event, object: item, queue: .main) { _ in
                Task { @MainActor in self.retry(ticket) }
            })
        }
        audio.play(); armTimeout(ticket)
    }
    private func clearItemEvents() {
        itemEvents.forEach { NotificationCenter.default.removeObserver($0) }
        itemEvents.removeAll()
    }
    private func armTimeout(_ ticket: Int) {
        timeout?.cancel()
        timeout = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 25_000_000_000)
            guard !Task.isCancelled, ticket == generation, wanted, player?.timeControlStatus != .playing else { return }
            retry(ticket)
        }
    }
    private func retry(_ ticket: Int) {
        guard ticket == generation, wanted else { return }
        generation += 1; timeout?.cancel()
        if retryCount > 0 { backup.toggle() }
        retryCount += 1
        if retryCount >= 8 { error = "تعذّر الاتصال؛ اضغط تشغيل للمحاولة مجددًا"; stop(failed: true); return }
        publish("retrying")
        let delay = UInt64(min(retryCount * 2, 15)) * 1_000_000_000
        timeout = Task { @MainActor in
            try? await Task.sleep(nanoseconds: delay)
            guard !Task.isCancelled, wanted else { return }
            connect()
        }
    }
    func stop(failed: Bool = false) {
        wanted = false; generation += 1; timeout?.cancel(); sleepTask?.cancel(); deadline = 0
        observation = nil; itemObservation = nil; player?.pause(); player = nil
        publish(failed ? "failed" : "paused")
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
    func setVolume(_ value: Float) { volume = max(0, min(1, value)); player?.volume = volume }
    func setSleepTimer(_ at: Double) {
        sleepTask?.cancel(); deadline = at
        guard at > 0 else { return }
        let seconds = max(0, min(at / 1000 - Date().timeIntervalSince1970, 86400))
        sleepTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            if !Task.isCancelled { stop() }
        }
    }
    private func publish(_ value: String) {
        let changed = state != value
        state = value
        defaults.set(wanted, forKey: "radioWanted")
        defaults.set(value, forKey: "radioState")
        defaults.set(Date().timeIntervalSince1970, forKey: "radioUpdated")
        MPNowPlayingInfoCenter.default().nowPlayingInfo = [MPMediaItemPropertyTitle: station["name"] ?? "راديو القرآن", MPNowPlayingInfoPropertyIsLiveStream: true, MPNowPlayingInfoPropertyPlaybackRate: value == "playing" ? 1.0 : 0.0]
        if changed { WidgetCenter.shared.reloadTimelines(ofKind: "RadioWidget") }
    }
}

 #endif

@available(iOS 17.0, *)
struct ToggleZadRadioIntent: AudioPlaybackIntent {
    static var title: LocalizedStringResource = "تشغيل أو إيقاف الراديو"
    static var openAppWhenRun = false
    @MainActor func perform() async throws -> some IntentResult {
        #if !WIDGET_EXTENSION
        let radio = ZadRadioPlayback.shared
        if radio.wanted { radio.stop() } else { try radio.play() }
        #endif
        return .result()
    }
}

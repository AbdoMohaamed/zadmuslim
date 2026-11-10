import WidgetKit
import SwiftUI

struct RadioEntry: TimelineEntry {
    let date: Date
    let name: String
    let state: String
    let wanted: Bool
}
struct RadioTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> RadioEntry { RadioEntry(date: Date(), name: "إذاعة القرآن الكريم من القاهرة", state: "paused", wanted: false) }
    func getSnapshot(in context: Context, completion: @escaping (RadioEntry) -> Void) { completion(read()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<RadioEntry>) -> Void) {
        completion(Timeline(entries: [read()], policy: .after(Date().addingTimeInterval(900))))
    }
    private func read() -> RadioEntry {
        let defaults = UserDefaults(suiteName: "group.com.zadmuslim.app")
        let name = (defaults?.dictionary(forKey: "radioStation") as? [String: String])?["name"] ?? "إذاعة القرآن الكريم من القاهرة"
        return RadioEntry(date: Date(), name: name, state: defaults?.string(forKey: "radioState") ?? "paused", wanted: defaults?.bool(forKey: "radioWanted") ?? false)
    }
}
struct RadioWidget: Widget {
    let kind = "RadioWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RadioTimelineProvider()) { entry in
            VStack(alignment: .leading, spacing: 10) {
                Label("راديو القرآن", systemImage: "radio.fill").font(.caption).foregroundStyle(Color(red: 0.9, green: 0.81, blue: 0.53))
                Text(entry.name).font(.headline).lineLimit(2).foregroundStyle(.white)
                Spacer(minLength: 0)
                Button(intent: ToggleZadRadioIntent()) {
                    Label("تشغيل / إيقاف", systemImage: "playpause.fill")
                        .font(.subheadline.bold()).frame(maxWidth: .infinity).padding(.vertical, 8)
                }.buttonStyle(.borderedProminent).tint(Color(red: 0.9, green: 0.81, blue: 0.53)).foregroundStyle(Color(red: 0.05, green: 0.16, blue: 0.11))
            }
            .environment(\.layoutDirection, .rightToLeft)
            .containerBackground(Color(red: 0.05, green: 0.16, blue: 0.11), for: .widget)
        }
        .configurationDisplayName("راديو القرآن")
        .description("تشغيل آخر محطة استمعت إليها أو إيقافها مباشرة من الشاشة الرئيسية.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
@main
struct ZadWidgets: WidgetBundle {
    var body: some Widget { PrayerWidget(); RadioWidget() }
}

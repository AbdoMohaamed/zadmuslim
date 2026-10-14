import WidgetKit
import SwiftUI

// MARK: - Prayer Model
struct PrayerItem: Identifiable, Codable {
    var id: String { key }
    let key: String
    let name: String
    let time: String
    let isNext: Bool
}

// MARK: - Widget Timeline Entry
struct PrayerWidgetEntry: TimelineEntry {
    let date: Date
    let hijriDate: String
    let nextPrayerName: String
    let nextPrayerTime: String
    let countdownText: String
    let prayers: [PrayerItem]
    let dhikr: String
}

// MARK: - Timeline Provider
struct PrayerTimelineProvider: TimelineProvider {
    let appGroupId = "group.com.zadmuslim.app"
    
    let peacefulDhikrs = [
        "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
        "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
        "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
        "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
        "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
        "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً"
    ]

    func placeholder(in context: Context) -> PrayerWidgetEntry {
        createSampleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerWidgetEntry) -> Void) {
        let entry = loadEntryFromStorage(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerWidgetEntry>) -> Void) {
        let currentDate = Date()
        var entries: [PrayerWidgetEntry] = []
        
        // Generate current snapshot
        let entry = loadEntryFromStorage(date: currentDate)
        entries.append(entry)
        
        // Refresh every 15 minutes to keep countdown dynamic and accurate
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate) ?? currentDate.addingTimeInterval(900)
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadEntryFromStorage(date: Date) -> PrayerWidgetEntry {
        let defaults = UserDefaults(suiteName: appGroupId) ?? UserDefaults.standard
        let jsonStr = defaults.string(forKey: "last_timings_json") ?? ""
        let hijriDate = defaults.string(forKey: "last_hijri_date") ?? "زاد المسلم"
        let randomDhikr = peacefulDhikrs.randomElement() ?? peacefulDhikrs[0]

        guard !jsonStr.isEmpty,
              let data = jsonStr.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            return createSampleEntry(date: date, hijri: hijriDate, dhikr: randomDhikr)
        }

        let prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        let prayerNames: [String: String] = [
            "Fajr": "الفجر",
            "Dhuhr": "الظهر",
            "Asr": "العصر",
            "Maghrib": "المغرب",
            "Isha": "العشاء"
        ]

        let calendar = Calendar.current
        let nowComponents = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: date)
        let nowMinutes = (nowComponents.hour ?? 0) * 60 + (nowComponents.minute ?? 0)

        var nextKey = "Fajr"
        var diffMinutes = Int.max
        var parsedTimes: [String: (hour: Int, minute: Int, raw: String)] = [:]

        for key in prayerKeys {
            if let raw = json[key] as? String {
                let clean = raw.components(separatedBy: " ").first ?? raw
                let parts = clean.components(separatedBy: ":")
                if parts.count >= 2, let h = Int(parts[0]), let m = Int(parts[1]) {
                    parsedTimes[key] = (h, m, clean)
                    let pMins = h * 60 + m
                    let diff = pMins - nowMinutes
                    if diff > 0 && diff < diffMinutes {
                        diffMinutes = diff
                        nextKey = key
                    }
                }
            }
        }

        // If all prayers passed today, next is Fajr tomorrow
        if diffMinutes == Int.max {
            nextKey = "Fajr"
            if let fajr = parsedTimes["Fajr"] {
                diffMinutes = (24 * 60 - nowMinutes) + (fajr.hour * 60 + fajr.minute)
            } else {
                diffMinutes = 240
            }
        }

        let hoursLeft = diffMinutes / 60
        let minsLeft = diffMinutes % 60
        var countdownStr = ""
        if hoursLeft > 0 {
            countdownStr = "متبقي \(hoursLeft) س و \(minsLeft) د"
        } else {
            countdownStr = "متبقي \(minsLeft) دقيقة"
        }

        var items: [PrayerItem] = []
        for key in prayerKeys {
            let name = prayerNames[key] ?? key
            var timeFormatted = "--:--"
            if let info = parsedTimes[key] {
                timeFormatted = formatTo12HourArabic(hour: info.hour, minute: info.minute)
            }
            items.append(PrayerItem(
                key: key,
                name: name,
                time: timeFormatted,
                isNext: (key == nextKey)
            ))
        }

        let nextItem = items.first(where: { $0.key == nextKey })
        let nextName = nextItem != nil ? "صلاة \(nextItem!.name)" : "الصلاة القادمة"
        let nextTime = nextItem?.time ?? "--:--"

        return PrayerWidgetEntry(
            date: date,
            hijriDate: hijriDate,
            nextPrayerName: nextName,
            nextPrayerTime: nextTime,
            countdownText: countdownStr,
            prayers: items,
            dhikr: randomDhikr
        )
    }

    private func formatTo12HourArabic(hour: Int, minute: Int) -> String {
        let period = hour >= 12 ? "م" : "ص"
        var h12 = hour % 12
        if h12 == 0 { h12 = 12 }
        return String(format: "%d:%02d %@", h12, minute, period)
    }

    private func createSampleEntry(date: Date, hijri: String = "15 ربيع الآخر 1448", dhikr: String = "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ") -> PrayerWidgetEntry {
        let samplePrayers = [
            PrayerItem(key: "Fajr", name: "الفجر", time: "5:02 ص", isNext: false),
            PrayerItem(key: "Dhuhr", name: "الظهر", time: "12:35 م", isNext: false),
            PrayerItem(key: "Asr", name: "العصر", time: "3:48 م", isNext: true),
            PrayerItem(key: "Maghrib", name: "المغرب", time: "6:14 م", isNext: false),
            PrayerItem(key: "Isha", name: "العشاء", time: "7:44 م", isNext: false)
        ]
        return PrayerWidgetEntry(
            date: date,
            hijriDate: hijri,
            nextPrayerName: "صلاة العصر",
            nextPrayerTime: "3:48 م",
            countdownText: "متبقي 42 دقيقة",
            prayers: samplePrayers,
            dhikr: dhikr
        )
    }
}

// MARK: - Widget Views
struct PrayerWidgetEntryView : View {
    var entry: PrayerTimelineProvider.Entry
    @Environment(\.widgetFamily) var family

    // Colors
    let emeraldDeep = Color(red: 2/255, green: 44/255, blue: 34/255)
    let emeraldLight = Color(red: 6/255, green: 78/255, blue: 59/255)
    let goldAccent = Color(red: 212/255, green: 175/255, blue: 55/255)
    let goldMuted = Color(red: 245/255, green: 228/255, blue: 168/255)

    var body: some View {
        switch family {
        case .systemSmall:
            smallWidgetView
        case .systemMedium:
            mediumWidgetView
        case .accessoryRectangular:
            accessoryRectangularView
        case .accessoryCircular:
            accessoryCircularView
        case .accessoryInline:
            accessoryInlineView
        default:
            mediumWidgetView
        }
    }

    // MARK: - Small Widget (4x2 or 2x2 square)
    var smallWidgetView: some View {
        ZStack {
            LinearGradient(
                colors: [emeraldDeep, emeraldLight],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 6) {
                // Header Hijri Date
                HStack {
                    Image(systemName: "moon.stars.fill")
                        .font(.system(size: 11))
                        .foregroundColor(goldAccent)
                    Text(entry.hijriDate)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(goldMuted)
                        .lineLimit(1)
                }
                .padding(.top, 4)

                Spacer()

                // Next Prayer Title
                Text(entry.nextPrayerName)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white.opacity(0.85))

                // Time
                Text(entry.nextPrayerTime)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.white)

                // Countdown Pill Badge
                Text(entry.countdownText)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(emeraldDeep)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(
                        Capsule().fill(goldAccent)
                    )

                Spacer()
            }
            .padding(10)
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    // MARK: - Medium Widget (Wide Card)
    var mediumWidgetView: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 2/255, green: 38/255, blue: 30/255), emeraldLight],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 8) {
                // Top Header Row
                HStack {
                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 11))
                            .foregroundColor(goldAccent)
                        Text("زاد المسلم")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(goldAccent)
                    }
                    
                    Spacer()
                    
                    Text(entry.hijriDate)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(goldMuted)
                }
                .padding(.horizontal, 12)
                .padding(.top, 10)

                // Middle Row: Next Prayer Card + 5 Daily Prayer Badges
                HStack(alignment: .center, spacing: 8) {
                    // Next Prayer Hero Card
                    VStack(alignment: .leading, spacing: 3) {
                        Text(entry.nextPrayerName)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white.opacity(0.85))
                        
                        Text(entry.nextPrayerTime)
                            .font(.system(size: 21, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        
                        Text(entry.countdownText)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(emeraldDeep)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(
                                Capsule().fill(goldAccent)
                            )
                    }
                    .padding(8)
                    .frame(maxWidth: 125)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.08))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(goldAccent.opacity(0.35), lineWidth: 1)
                            )
                    )

                    // 5 Prayer Columns
                    HStack(spacing: 5) {
                        ForEach(entry.prayers) { prayer in
                            VStack(spacing: 4) {
                                Text(prayer.name)
                                    .font(.system(size: 11, weight: prayer.isNext ? .bold : .regular))
                                    .foregroundColor(prayer.isNext ? goldAccent : .white.opacity(0.8))
                                
                                Text(prayer.time)
                                    .font(.system(size: 9, weight: prayer.isNext ? .bold : .medium))
                                    .foregroundColor(prayer.isNext ? .white : .white.opacity(0.7))
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.8)
                            }
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .padding(.vertical, 6)
                            .padding(.horizontal, 2)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(prayer.isNext ? Color(red: 16/255, green: 115/255, blue: 85/255) : Color.white.opacity(0.05))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(prayer.isNext ? goldAccent : Color.clear, lineWidth: 1.2)
                                    )
                            )
                        }
                    }
                }
                .padding(.horizontal, 12)
                .frame(maxHeight: 68)

                // Bottom Peaceful Dhikr
                HStack(spacing: 4) {
                    Image(systemName: "quote.opening")
                        .font(.system(size: 9))
                        .foregroundColor(goldAccent.opacity(0.8))
                    Text(entry.dhikr)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(Color.white.opacity(0.9))
                        .lineLimit(1)
                    Spacer()
                }
                .padding(.horizontal, 14)
                .padding(.bottom, 8)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    // MARK: - Lock Screen Widgets (iOS 16+)
    var accessoryRectangularView: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Image(systemName: "moon.fill")
                    .font(.system(size: 10))
                Text(entry.nextPrayerName)
                    .font(.system(size: 12, weight: .bold))
                Spacer()
                Text(entry.nextPrayerTime)
                    .font(.system(size: 12, weight: .semibold))
            }
            Text(entry.countdownText)
                .font(.system(size: 11, weight: .medium))
            Text(entry.hijriDate)
                .font(.system(size: 9))
                .foregroundColor(.secondary)
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    var accessoryCircularView: some View {
        VStack(spacing: 1) {
            Image(systemName: "clock.fill")
                .font(.system(size: 12))
            Text(entry.nextPrayerTime)
                .font(.system(size: 11, weight: .bold))
                .minimumScaleFactor(0.8)
        }
    }

    var accessoryInlineView: some View {
        HStack {
            Image(systemName: "moon.stars.fill")
            Text("\(entry.nextPrayerName) \(entry.nextPrayerTime) (\(entry.countdownText))")
        }
    }
}

// MARK: - Main Widget Declaration
@main
struct PrayerWidget: Widget {
    let kind: String = "PrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerTimelineProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("زاد المسلم - مواقيت الصلاة")
        .description("عرض الصلاة القادمة والوقت المتبقي ومواقيت الصلوات الخمس مع أذكار متجددة.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .accessoryRectangular,
            .accessoryCircular,
            .accessoryInline
        ])
    }
}

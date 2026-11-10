# Native home-screen widgets

## Android

The existing sixth component (`PrayerWidgetAgendaProvider`) is now the radio widget. Keeping its component name migrates installed agenda widgets; the other five prayer widgets retain their layouts. The play/stop button invokes `RadioService` through a foreground-service PendingIntent (ordinary service PendingIntent on API 24–25). The service stores the last live station separately from downloaded recitations and updates all radio widgets from playback state. Default station: Cairo Quran Radio.

Build and test:

```powershell
npm run build:web
npx cap copy android
cd android
.\gradlew.bat :app:assembleDebug
```

Run copy and Gradle sequentially. APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Debug signing cannot replace an installed release build with a different signing key; use a test device/profile or produce a release signed with the existing key.

## iOS 17+

The `ZadWidgets` extension contains **PrayerWidget** and **RadioWidget**, in small and medium sizes. Prayer also supports lock-screen accessories. The app embeds the extension via its target dependency and Embed App Extensions build phase.

Radio's `ToggleZadRadioIntent` conforms to `AudioPlaybackIntent` and is compiled into both targets. iOS executes it in the app process; `ZadRadioPlayback` owns AVPlayer, the audio session, interruptions, remote controls, bounded reconnection, and sleep timing. The Capacitor radio UI uses that same native player. Offline recordings continue to use the existing web audio library, with native playback stopped before switching.

Both targets must be signed by the same Apple Developer team, with the App Group **group.com.zadmuslim.app** enabled on both provisioning profiles:

- app: `com.zadmuslim.app`, `App/App.entitlements`
- extension: `com.zadmuslim.app.widgets`, `PrayerWidget/Widget.entitlements`

Open `ios/App/App.xcodeproj` in Xcode. Select the same team on App and ZadWidgets, register/enable the App Group in Signing & Capabilities, then archive/install on an iOS 17+ device. Existing unsigned CI builds include the extension but still require valid signing with its App Group entitlement to test on a real device. Re-signing tools that strip extensions or App Groups cannot validate widgets.

Prayer data is written through `PrayerWidgetNative`; old, unverified, or changed-city data is not marked fresh. Missing data and tomorrow's unavailable timetable show an update prompt rather than example prayer times. Minute timeline entries keep the next prayer/countdown aligned between system reloads; iOS controls actual refresh scheduling.

## Device acceptance checks

1. Add both iOS widgets and the Android radio widget; resize small/medium layouts.
2. Start Cairo from the widget with the app closed, stop it, and restart. Confirm one stream only.
3. Change station inside the app; stop and restart from the widget. Confirm the selected live station returns.
4. Open the app during widget playback. Confirm playback continues and the UI catches up.
5. Disconnect/reconnect network, lock the screen, unplug headphones, and receive a call. Confirm stop/interruption behavior and no duplicate streams.
6. Play a downloaded recording, then radio, in both directions. Confirm native/web handoff stops the old source.
7. Set the sleep timer and verify it stops widget-started native playback.
8. Refresh verified prayer times, change city/date/time zone, and check that stale/unknown times never appear as verified.

Windows validation covers Android compilation and automated JS/XML/project wiring tests. iOS compilation, signing, WidgetKit scheduling, and real-device playback still require Xcode and hardware validation.

---
name: Bito
tagline: 'Log a habit in one tap, without accounts or cloud.'
intro: "The habit app that won't steal your time. Lives entirely on your phone: no accounts, no cloud, not one line out to the internet."
kind: mobile
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0-or-later
platform: Android 8.0+
stack: [Kotlin, Offline-first, Privacy]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.png'
cover: '../../../assets/projects/bito/cover-en.png'
promo: '../../../assets/projects/bito/promo-en.png'
# playground: { kind: video, src: 'YouTube URL of the English video' }
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk
  label: '4.7 MB'
facts:
  - label: 'APK size'
    value: '4.7 MB'
    mono: true
  - label: 'Permissions'
    value: '4, none for internet'
  - label: 'Google dependencies'
    value: '0'
    mono: true
screenshots:
  - src: '../../../assets/projects/bito/widget.jpg'
    alt: 'Widget on the home screen'
    caption: 'Widget'
  - src: '../../../assets/projects/bito/reminder.jpg'
    alt: 'Reminder with a log button'
    caption: 'Reminder'
  - src: '../../../assets/projects/bito/review.jpg'
    alt: 'Nightly review'
    caption: 'Nightly review'
  - src: '../../../assets/projects/bito/stats.jpg'
    alt: 'Stats with a heatmap and records'
    caption: 'Stats'
  - src: '../../../assets/projects/bito/badges.jpg'
    alt: 'Badges'
    caption: 'Badges'
featuresIntro: "Three ways to log it. Two of them don't even ask you to open the app."
features:
  - title: 'From the home screen'
    text: "The widget shows today and logs with one tap, no need to go anywhere. Care about just one habit? There's a small widget just for it."
    image: '../../../assets/projects/bito/shot-04-widget-en.png'
  - title: 'From the notification'
    text: "The reminder comes with the button built in. Tap it and it's logged, nothing else to unlock."
    image: '../../../assets/projects/bito/shot-02-recordatorio-en.png'
  - title: 'In the evening review'
    text: "One screen at day's end to close out what's left. Seal the day and that's it."
    image: '../../../assets/projects/bito/shot-06-revision-en.png'
  - title: 'Tasks, deadlines, focus'
    text: 'The call, the paperwork, the email. Each task gets a deadline, a first step if it helps, and a 5, 10 or 25 minute timer with Habi beside you.'
    image: '../../../assets/projects/bito/feat-tareas-en.png'
  - title: 'Backups that are yours'
    text: "Every backup carries everything and goes to the folder you pick. Plain, it's a JSON you open in Notepad; with a password, nobody opens it, not even Bito."
  - title: "Streaks that don't punish"
    text: "Missing a day doesn't erase a month. Freezers cover the impossible days, and you can backdate an entry when you remember late."
  - title: 'Amounts, durations, and things to quit'
    text: 'Eight glasses of water, twenty minutes of reading, or one more day without smoking. Each type logs its own way.'
  - title: 'Reminders in the voice you pick'
    text: 'The nudge changes tone by time of day and by which voice you picked. Mornings, it sets up the day; nights, it helps close it.'
  - title: 'Real badges, real stats'
    text: "Heatmaps, records, and badges that earn themselves. The numbers are there to show how you're doing, not to show off anywhere."
illustration: '../../../assets/projects/bito/illustration.png'
built:
  - 'Kotlin 2.1 and Jetpack Compose, for Android 8.0 or later.'
  - 'Offline-first: all data lives on the phone.'
  - '4 permissions, none for internet. The app cannot phone home.'
  - '0 Google Play Services dependencies. Works the same on GrapheneOS.'
  - 'Backups encrypted with Argon2id and AES-256-GCM with a password.'
  - 'Free software under GPL-3.0-or-later, code at [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - version: 'v1.1.0'
    note: 'Tasks with deadlines, a focus timer and midday task reminders.'
  - version: 'v1.0.0'
    date: 2026-08-26
    note: "The first version to share. Single-habit widget, reminders in Habi's voice, sound and haptics on log."
---

Every habit tracker I tried asked for an account, then a subscription, then my data. Bito asks for one tap. It keeps everything on the phone, backs up to the folder you pick, and does not phone home.

I built the first prototype in a day to prove the idea, and wrote about it. Along the way came Habi, a companion who nudges without nagging. 1.1.0 adds tasks and a timer to start them, and is the one going to Google Play.

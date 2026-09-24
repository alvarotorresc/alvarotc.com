---
name: Bito
tagline: Log a habit in one tap, without accounts or cloud.
intro: 'The habit app that does not steal your time. It lives entirely on your phone: no accounts, no cloud, not a single line to the internet.'
kind: mobile
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0
platform: Android 10+
stack: [Kotlin, Offline-first, Privacy]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.jpg'
cover: '../../../assets/projects/bito/cover.jpg'
promo: '../../../assets/projects/bito/promo.jpg'
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk
  label: '4.7 MB'
facts:
  - { label: 'APK size', value: '4.7 MB', mono: true }
  - { label: 'Network', value: 'No network permission' }
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
featuresIntro: 'Three ways to log, two without opening the app.'
features:
  - title: 'From the home screen'
    text: 'The widget logs the habit with one tap. No need to open the app.'
    image: '../../../assets/projects/bito/widget.jpg'
  - title: 'From the reminder'
    text: 'The notification brings its own button. Tap it and it is done.'
    image: '../../../assets/projects/bito/reminder.jpg'
  - title: 'At the end of the day'
    text: 'The nightly review: one screen to close the day.'
    image: '../../../assets/projects/bito/review.jpg'
  - title: 'Streaks that do not punish'
    text: 'Freezes for impossible days and logging with a past date.'
  - title: 'More than yes or no'
    text: 'Amounts (8 glasses of water), durations (20 min of reading) and things to quit (one more day without smoking).'
  - title: 'Reminders with a voice'
    text: 'You pick the voice, and the tone changes with the time of day.'
  - title: 'Real stats'
    text: 'Heatmaps, records and badges.'
illustration: '../../../assets/projects/bito/habi.jpg'
built:
  - 'Kotlin, for Android 10+.'
  - 'Offline-first: all data lives on the phone.'
  - 'No network permission. The app cannot phone home.'
  - 'Exports to a plain file that is yours.'
  - 'Free software under GPL-3.0, code at [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - { version: 'v2.0.0', note: 'Habi as a companion, store listings and widget.' }
  - {
      version: 'v1.0.0',
      date: 2026-08-26,
      note: 'First public release. One-tap logging, streaks, export to file.',
    }
  - { version: 'v0.1.0', note: 'The 24 hour prototype.' }
---

Every habit tracker I tried asked for an account, then a subscription, then my data. Bito asks for one tap. It stores everything on the phone, exports to a plain file, and does not phone home.

I built the first version in a day to prove the idea, and wrote about it. The second version adds Habi, a small companion that nudges without nagging, and is the one going to the stores.

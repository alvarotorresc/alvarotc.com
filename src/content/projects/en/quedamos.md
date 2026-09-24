---
name: Quedamos
tagline: Your friends want to meet up. Nobody knows when.
intro: 'Quedamos asks the question and tells you when everyone can make it. A shared calendar for your crew, with no more screens than it needs.'
kind: hybrid
status: beta
tier: featured
order: 2
repo: https://github.com/alvarotorresc/quedamos-app
url: https://quedamos.alvarotc.com
license: MIT
platform: 'Web and Android 6.0+'
stack: [React, Ionic, Capacitor, NestJS, Prisma, Supabase]
githubRepo: alvarotorresc/quedamos-app
download:
  { url: 'https://github.com/alvarotorresc/quedamos-app/releases/latest', label: 'Android 6.0+' }
icon: '../../../assets/projects/quedamos/icon.jpg'
cover: '../../../assets/projects/quedamos/calendario.jpg'
coverMobile: '../../../assets/projects/quedamos/grupo.jpg'
promo: '../../../assets/projects/quedamos/promo.png'
facts:
  - { label: 'Languages', value: 'Spanish and English' }
  - { label: 'Tests', value: '1,400 (608 API + 792 app)', mono: true }
  - { label: 'Ads', value: 'None' }
screenshots:
  - src: '../../../assets/projects/quedamos/calendario.jpg'
    alt: 'Week calendar with a ring per day and the actions for the selected Saturday'
    caption: 'Calendar'
  - src: '../../../assets/projects/quedamos/preguntar.jpg'
    alt: 'Sheet to ask the group about a day and a slot'
    caption: 'Ask the group'
  - src: '../../../assets/projects/quedamos/quedadas.jpg'
    alt: "Plans list with each plan's confirmation ring"
    caption: 'Plans'
  - src: '../../../assets/projects/quedamos/grupo.jpg'
    alt: 'Group screen with the members and their colours'
    caption: 'Group'
  - src: '../../../assets/projects/quedamos/perfil.jpg'
    alt: "Profile with the user's identity and the settings mosaic"
    caption: 'Profile'
  - src: '../../../assets/projects/quedamos/calendario-claro.jpg'
    alt: 'The week calendar in the light theme'
    caption: 'Light theme'
featuresIntro: 'Meeting up with six people is a message thread nobody wants to read. Quedamos replaces it with three steps.'
features:
  - title: 'Ask'
    text: 'Someone asks about a day from the calendar: "Can you do Saturday night?". Everyone answers with one tap: yes, no, not sure yet.'
    image: '../../../assets/projects/quedamos/preguntar.jpg'
  - title: 'The ring closes'
    text: "Each person is an arc of one colour on a circle. The gap is whoever hasn't answered. When the ring closes, everyone can make it and you all get the notification."
    image: '../../../assets/projects/quedamos/grupo.jpg'
  - title: "Let's meet"
    text: "Someone proposes a plan, a time and a place. Confirming closes your arc. The plan is sealed and lands in everyone's calendar."
    image: '../../../assets/projects/quedamos/quedadas.jpg'
  - title: 'Availability your way'
    text: 'A whole day, morning, afternoon or evening slots with the hours you define, or an exact time range. Week, month and list views, with the best day worked out for you.'
  - title: 'Proposals'
    text: '"A weekend in the Alpujarra?" gets voted up or down and, if it passes, becomes a plan with one tap.'
  - title: 'Real plans'
    text: "A place that opens the map, a meeting link if it's online, a download for your calendar and a card you can share anywhere."
  - title: 'Alerts worth having'
    text: "A new plan, the ring closing, a reminder 24 hours before, who's not coming. Every type switches off on its own."
  - title: 'Android widgets'
    text: 'The week and the best day on your home screen, without opening the app.'
  - title: 'Six colours. Yours is yours.'
    text: 'Every member has a colour in the group and carries it everywhere: the ring, the plans, their profile.'
illustration: '../../../assets/projects/quedamos/icon.jpg'
built:
  - 'Ionic React 8 and Capacitor 7 package the web app for Android.'
  - '[NestJS](https://nestjs.com) 10, [Prisma](https://www.prisma.io) 6 and PostgreSQL power the API.'
  - '[Supabase](https://supabase.com) for auth, database and realtime.'
  - 'Firebase Cloud Messaging for push notifications.'
  - 'Android widgets in Kotlin, with RemoteViews and WorkManager.'
  - 'Web on [Vercel](https://vercel.com); API in Docker.'
changelog:
  - { version: 'v1.0.0', date: 2026-09-09, note: 'The full redesign. In production for the beta.' }
  - { version: 'v0.3.3', date: 2026-04-09, note: '[DATO]' }
  - { version: 'v0.3.2', date: 2026-04-09, note: '[DATO]' }
  - { version: 'v0.3.1', date: 2026-04-05, note: '[DATO]' }
  - { version: 'v0.3.0', date: 2026-04-05, note: '[DATO]' }
  - { version: 'v0.2.5', date: 2026-03-27, note: '[DATO]' }
  - { version: 'v0.2.4', date: 2026-03-26, note: '[DATO]' }
  - { version: 'v0.2.3', date: 2026-03-18, note: '[DATO]' }
  - { version: 'v0.2.2', date: 2026-03-17, note: '[DATO]' }
  - { version: 'v0.2.1', date: 2026-03-12, note: '[DATO]' }
mock: false
---

Meeting up with six people is a message thread nobody wants to read. Quedamos replaces it with three steps.

[DATO]

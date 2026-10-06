---
name: Huellas
tagline: A platform to reunite lost pets with their families.
intro: 'Huellas is the channel that cannot be torn off a lamppost and that reaches the neighbourhood: an app and a website to search for, find and report lost pets, with shelters on board from day one.'
kind: hybrid
applicationCategory: LifestyleApplication
status: design
tier: featured
order: 3
repo: https://github.com/alvarotorresc/huellas
license: AGPL-3.0
stack: [Capacitor, PostGIS, MapLibre, Docker]
githubRepo: alvarotorresc/huellas
facts:
  - { label: 'Phase', value: 'Definition approved, no code yet' }
  - { label: 'Documents', value: '12', mono: true }
featuresIntro: 'What is planned for the first release (MVP): dogs and cats, Spain, Spanish.'
features:
  - title: 'Reporting a lost pet'
    text: 'Publish that a pet has been lost, with a printable poster and QR code, and a public link with no login needed.'
  - title: 'Sightings without an account'
    text: 'Anyone can report "I saw it" or "I have it" without creating an account.'
  - title: 'Matching between sightings and reports'
    text: 'The system suggests sightings for each report and the owner decides, always by hand: Applies, Does not apply or Not sure.'
  - title: 'Map and list with blurring'
    text: 'Browse reports and sightings on a map or in a list, sorted by distance and blurred by default.'
  - title: 'Alert zones'
    text: 'Up to three zones per user, from 500 m to 10 km, with "Lost near you" alerts and configurable quiet hours.'
  - title: 'Shelter panel'
    text: 'A public profile for shelters, with their intakes, adoptions and several people running the account.'
  - title: 'Manual blurring of sensitive images'
    text: 'Whoever publishes marks by hand which photos to blur; there is no automatic detection in the MVP.'
  - title: 'Donations'
    text: 'A tip for the creator, available on the website and in the app, with nothing digital in return.'
  - title: 'Out of the MVP'
    text: 'Chat, AI photo matching and background location tracking are left for later.'
built:
  - 'A single webapp wrapped with Capacitor, with the web framework still undecided, to be able to ship on iOS later.'
  - 'Its own backend: Postgres with the PostGIS extension for proximity searches.'
  - 'Its own API and database on a VPS, with Docker Compose behind Caddy. No Supabase.'
  - 'Maps with MapLibre.'
  - 'Public website on Vercel while it stays free.'
  - 'Free software under AGPL-3.0, code at [github.com/alvarotorresc/huellas](https://github.com/alvarotorresc/huellas).'
changelog: []
mock: false
---

I have a cat I picked up off the street. Nobody in my neighbourhood listened to me and my posters kept being torn down: I felt voiceless. Huellas is the channel I was missing. It does not compete with other apps and it does not chase money: donations only cover costs.

In the MVP: dogs and cats, in Spain and in Spanish. What gets measured is animals reunited and people heard, not growth.

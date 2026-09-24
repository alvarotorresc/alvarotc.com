---
name: BaseCero
tagline: Your money, from scratch. Personal finance that lives entirely on your device.
intro: 'A website that installs as an app on your phone and works offline. No server, no accounts, no telemetry.'
kind: hybrid
status: published
tier: lab
order: 4
repo: https://github.com/alvarotorresc/basecero
url: https://basecero.alvarotc.com
license: MIT
platform: 'Browser, on desktop and mobile'
stack: [Local-first, TypeScript]
githubRepo: alvarotorresc/basecero
icon: '../../../assets/projects/basecero/icon.png'
cover: '../../../assets/projects/basecero/cover.png'
coverMobile: '../../../assets/projects/basecero/home-en.webp'
promo: '../../../assets/projects/basecero/cover.png'
playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }
facts:
  - { label: 'Installs as an app', value: 'PWA, works offline' }
  - { label: 'Data', value: 'On your device, no server' }
screenshots:
  - src: '../../../assets/projects/basecero/home-en.webp'
    alt: "Home screen showing what's available in the period"
    caption: 'Home'
  - src: '../../../assets/projects/basecero/movements-en.webp'
    alt: 'Transactions grouped by day'
    caption: 'Transactions'
  - src: '../../../assets/projects/basecero/net-worth-en.webp'
    alt: 'Net worth, accounts and goals'
    caption: 'Net worth'
  - src: '../../../assets/projects/basecero/categories-en.webp'
    alt: 'Spending by category, with a row and a percentage per category, and Groceries expanded with its subcategories'
    caption: 'Spending by category'
featuresIntro: 'Accounts that follow your payslip, not the calendar.'
features:
  - title: 'Payslip to payslip'
    text: 'Periods run from one payslip to the next, not from the 1st to the 30th. With recurring items, you see what is really left until the next payday.'
  - title: 'Shared expenses'
    text: 'Both ways: what you owe and what you are owed. When it is settled, you tap Settle.'
  - title: 'Net worth'
    text: 'Your total, your accounts, liabilities and goals, in a single view.'
    image: '../../../assets/projects/basecero/net-worth-en.webp'
  - title: 'Quick entry'
    text: 'One screen with five kinds of entry.'
  - title: 'Categories with limits'
    text: '41 categories on two levels, all editable, and the spending of each one against its limit.'
  - title: 'Imports your bank CSV'
    text: 'The N26 one is recognised automatically.'
  - title: 'Spanish and English'
    text: 'With the currency and format you choose.'
illustration: '../../../assets/projects/basecero/icon.png'
built:
  - 'JavaScript, no server.'
  - 'Local-first: all data lives on your device.'
  - 'Installable PWA, works offline.'
  - 'No accounts and no telemetry.'
  - 'Exports to a plain file that is yours.'
  - 'Free software under MIT, code at [github.com/alvarotorresc/basecero](https://github.com/alvarotorresc/basecero).'
changelog:
  - {
      version: 'v1.0.0',
      date: 2026-09-02,
      note: 'The first version to share. BaseCero now installs from any browser and works offline, with no accounts and no cloud.',
    }
---

Local-first personal finance. No server, no account, plain file export.

For people who track their spending by hand and want to stay the owners of their data.

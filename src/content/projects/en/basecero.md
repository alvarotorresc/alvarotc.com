---
name: BaseCero
tagline: Your money, from zero. Personal finance that lives entirely on your device.
intro: 'A website that installs as an app on your phone and works offline. It tells you what is really left until your next payday. No server, no accounts, no telemetry.'
kind: hybrid
applicationCategory: FinanceApplication
status: published
tier: lab
order: 4
repo: https://github.com/alvarotorresc/basecero
url: https://basecero.alvarotc.com
license: MIT
platform: 'Browser, on desktop and mobile'
stack: [JavaScript, SQLite (WebAssembly), PWA]
githubRepo: alvarotorresc/basecero
icon: '../../../assets/projects/basecero/icon.png'
cover: '../../../assets/projects/basecero/cover-en.png'
coverMobile: '../../../assets/projects/basecero/cover-mobile-en.png'
promo: '../../../assets/projects/basecero/promo-en.png'
playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }
facts:
  - { label: 'Installs as an app', value: 'PWA, works offline' }
  - { label: 'Data', value: 'On your device, no server' }
  - { label: 'Themes', value: 'Light and dark' }
screenshotsIntro: 'Every category has its colour and carries it across the app. Aluminium background in light, graphite in dark.'
screenshots:
  - src: '../../../assets/projects/basecero/01-inicio-en.png'
    alt: "BaseCero Home screen in light theme: you can spend €40.78 today, €530.17 left of €2,000.00 in the September period, current account balance, what Marta owes you, this week's spending and a 30% savings rate"
    caption: 'Home'
  - src: '../../../assets/projects/basecero/02-registro-en.png'
    alt: 'Logging a €3.40 expense under Eating out › Bars & cafés, with the colour-coded category grid and a note of what is left of the Eating out limit'
    caption: 'Log transaction'
  - src: '../../../assets/projects/basecero/03-movimientos-en.png'
    alt: 'September transactions in dark theme: €1,469.83 spent of €2,000.00, search, category filters and the list grouped by day'
    caption: 'Transactions'
  - src: '../../../assets/projects/basecero/04-gasto-categoria-en.png'
    alt: 'September spending by category: each category with its colour, bar and limit; Home and Car flag that they have used over 95% of their limit'
    caption: 'Spending by category'
  - src: '../../../assets/projects/basecero/05-patrimonio-en.png'
    alt: 'Net worth in dark theme: €3,906.36 in total, €606.17 up this period, what you have against what you owe, and the current, savings and holiday jar accounts'
    caption: 'Net worth'
  - src: '../../../assets/projects/basecero/06-informe-en.png'
    alt: 'Period report: you save 30% of what you earn, €2,100.00 earned against €1,469.83 spent, the comparison with August and the button to download the PDF'
    caption: 'Report'
featuresIntro: 'Accounts that follow your payslip, not the calendar.'
features:
  - title: 'Payslip to payslip'
    text: 'Periods run from one payslip to the next, not from the 1st to the 30th. With recurring items, you see what is really left until the next payday.'
  - title: 'Quick entry'
    text: 'The amount on the phone keypad and the category from a grid of colours. Or type "12.50 at the bar with Marta" and the app pulls out the amount, the shop and who you split it with.'
  - title: 'Shared expenses'
    text: 'Both ways: what you owe and what you are owed. Settle up shows the net figure and closes it in one go.'
  - title: 'Net worth'
    text: 'Your total, your accounts, liabilities and savings goals, in a single view.'
    image: '../../../assets/projects/basecero/05-patrimonio-en.png'
  - title: 'Categories with limits'
    text: '41 categories on two levels, all editable, each with its colour, and the spending of each one against its limit.'
  - title: 'PDF report'
    text: 'Income, spending and savings against the previous period. The PDF is generated on your phone.'
  - title: 'Imports your bank CSV'
    text: 'The N26 one is recognised automatically; for any other bank, an assistant asks what each column is.'
  - title: 'Light, dark and two languages'
    text: 'Pick a theme or follow your system. In Spanish and English, with the currency and format you choose.'
illustration: '../../../assets/projects/basecero/icon.png'
built:
  - 'JavaScript with no framework and no bundler. SQLite in WebAssembly, no server.'
  - 'Local-first: all data lives on your device.'
  - 'Installable PWA, works offline.'
  - 'No accounts and no telemetry. Dictation is optional and done by the browser; typed, everything stays on the phone.'
  - 'Exports to an .xlsx spreadsheet that is yours, plus password-encrypted backups.'
  - 'More than 1500 tests with the native Node runner.'
  - 'Free software under MIT, code at [github.com/alvarotorresc/basecero](https://github.com/alvarotorresc/basecero).'
changelog:
  - {
      version: 'v1.1.0',
      date: 2026-09-30,
      note: 'A full redesign with light and dark themes; a home screen that leads with the balance, and payday; logging by sentence, voice or receipt photo; PDF report; subscription radar; multiple filters and a review of the statement before importing it.',
    }
  - {
      version: 'v1.0.0',
      date: 2026-09-02,
      note: 'The first version to share. BaseCero now installs from any browser and works offline, with no accounts and no cloud.',
    }
---

I tried a fair few finance apps and almost all of them failed in the same place: they were free because the business was your data, paid but with your accounts in their cloud, or local but closed. I could not find one that was serverless, account-free, truly offline and open source all at once.

So I built it. It is for people who track their spending by hand and want to stay the owners of their data: if BaseCero disappeared tomorrow, your accounts would still be yours, in a spreadsheet you can open with any program.

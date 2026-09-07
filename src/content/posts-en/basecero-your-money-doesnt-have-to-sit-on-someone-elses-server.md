---
title: "BaseCero: Your money doesn't have to sit on someone else's server"
description: 'Why did I create a serverless, accountless, open-source personal finance app when there are already thousands out there? What it stands for, what you give up in exchange, and how to install it.'
date: 2026-09-07
draft: false
tags: ['foss', 'privacidad', 'local-first', 'pwa', 'finanzas', 'producto']
---

Install any finance app and see what it asks for before letting you log your first expense. An email address. A password. Almost always, your bank credentials, to “automatically sync your transactions.” In exchange, you pay nothing.

There’s a part of that deal that doesn’t show up on the sign-up screen. Someone is compiling—on a server that isn’t yours—a list of where you shop, how much you earn, when you change jobs, and what concerns you enough to write it down. It’s probably the most intimate record that exists about a person, and the more it grows and the more hands touch it, the more people other than you get to decide what’s done with it. The rule is old and never fails: if it’s free and requires your banking information, the right question is, “What’s being sold?”

## Why another finance app when there are already thousands?

There are thousands, it’s true, and I’ve tried a few. Almost all of them fall short in the same way: they’re free because the business model is based on data, or they’re paid apps but still store your accounts in their cloud, or they’re local but closed-off systems, meaning their promise of privacy is exactly that—a promise you can’t verify.

What I couldn’t find was one that met all four criteria at once: no server, no account, truly offline, and with the code in plain sight. They all met two or three. The one that fell short was always the one that mattered most to me.

## What Is BaseCero

BaseCero is a personal finance app that lives entirely on your device. It has no server, no registration, and no cloud. It opens in your browser, installs like an app, and works in airplane mode.

On the inside, it does exactly what I expect from an app like this. **Your month starts on payday**, not on the 1st: it organizes your money into pay period cycles and tells you exactly how much you have left at any given moment, deducting what’s still committed. It has a spending screen by category, sorted by how much you’ve spent, where you set limits only where it makes sense. It tracks split expenses with another person in both directions—who paid and what portion is yours—and settles them based on the net amount. And it tracks your net worth: accounts, debts with their payments, and savings goals. If your bank provides statements in CSV format, it imports them and prevents duplicates.

Its core principles can be summed up in four sentences:

- **Everything local, always.** The data resides in a database within your own browser. There’s no backend for data to leak from, because there’s nothing on the other end.
- **Zero telemetry, zero analytics, zero cookies.** The app doesn’t track anything or report to anyone. That’s why there’s no banner to accept either: there’s nothing to consent to.
- **Your data is a spreadsheet.** You export an `.xlsx` file that you can open in LibreOffice or Google Sheets, and the app itself imports it back in its entirety. Nothing gets trapped inside. If BaseCero were to disappear tomorrow, your accounts would still be yours and would remain readable.
- **And if you want to keep it safe, you can encrypt it.** In addition to the unencrypted `.xlsx` file, there’s a password-protected copy that you can store wherever you choose.

## Why No Server

Not having a server isn’t a technical decision—it’s a product decision—and it’s the first link in a chain.

A server requires user accounts. Accounts require storing email addresses and passwords. That necessitates a privacy policy, a banner, someone to respond when there’s a breach, and—sooner or later—a business model that justifies the server bill at the end of the month. When the user doesn’t pay, that business model is usually built right on top of their data.

Remove the first piece, and all the others fall apart. Without a server, there’s no registration form to fill out, no account of mine that they can hack, and no monthly bill that needs to be justified by selling something. The only honest way to promise that I won’t look at your data is to have no way of looking at it.

## Why Open Source

Because “we don’t collect your data” is just a phrase, and a phrase can’t be verified. Code, however, can be. It’s on GitHub under the MIT license: anyone can read what the app does, verify that there are no hidden network requests, and take it for themselves if it’s useful. Others ask you to trust them; I prefer to put the code out there so that trust isn’t necessary.

There’s also a less noble and more practical reason. BaseCero didn’t start out as a product: it was my own tool—a spreadsheet with scripts added to it, tailored to my life and containing my own categories. It worked so well that it ended up becoming the app I use every day, and at some point, it no longer made sense for only me to use it. Removing my personal details from the code—the other person’s name, my categories, my bank, my language, my currency—was almost all the work involved in version 1.0. Opening it up to others was the logical next step: if the tool no longer assumes you’re me, there’s no reason it shouldn’t belong to everyone.

## What This Deal Costs You

None of this comes for free, and I’d rather write it here than let you figure it out on your own.

If you lose your device and haven’t exported anything, you lose your data. There’s no copy on a server that can restore it for you, because that server doesn’t exist. If you uninstall the app, your data goes with it. And if you encrypt a copy and forget the password, there’s no “password recovery”: that key isn’t stored anywhere, not even on my end.

One more point, just to be honest: it’s the copies that are encrypted, not the local database. That resides in the browser’s private storage and is protected by the device itself, so anyone who has your phone unlocked has access to your accounts.

It’s the same deal as with your house keys. In exchange for there being no copies in anyone else’s hands, the responsibility for not losing them falls on you. I think it’s a fair trade-off, but it is a trade-off, and I wanted to make that clear before you install anything.

## How to Get It and How to Install It

There’s no app store or installer. BaseCero is a website that your browser saves as an app: it has its own icon, runs in full-screen mode, and works offline. Open [basecero.alvarotc.com](https://basecero.alvarotc.com) and, depending on what you’re using:

- **Android, with Chrome.** Accept the “Install app” prompt if it appears. If it doesn’t appear: menu ⋮ → “Add to Home Screen.”
- **iPhone and iPad, only with Safari.** Share button → “Add to Home Screen.” It has to be Safari: iOS doesn’t allow you to install web apps from Chrome or Firefox. This is a limitation imposed by Apple, not BaseCero.
- **Desktop, with Chrome or Edge.** Install icon, to the right of the address bar → “Install BaseCero.”

It takes ten seconds and asks for nothing in return: no email, no registration, no permissions. From then on, you open it from its icon, and it works offline. To uninstall it, just delete the icon—and your data goes with it—so be sure to export a copy first.

## Start from scratch

The code is available at [github.com/alvarotorresc/basecero](https://github.com/alvarotorresc/basecero), licensed under the MIT license with nothing hidden. If you track your expenses by hand and want to keep control of them, BaseCero is for you: try it out one afternoon with the current month, and you’ll see right away if it’s a good fit.

And if something’s missing, or something doesn’t add up, the place to mention it is the repository. That’s where I’ll read it and respond—publicly.

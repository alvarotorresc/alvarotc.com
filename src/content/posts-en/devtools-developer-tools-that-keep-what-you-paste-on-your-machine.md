---
title: 'DevTools: 52 developer tools that keep what you paste on your machine'
seoTitle: 'DevTools: browser-only dev tools'
description: 'Why I rebuilt my developer utilities site: 52 tools that run in the browser, Spanish validators like DNI or IBAN, and how I built and tested it.'
date: 2026-10-06
draft: false
tags: ['foss', 'privacidad', 'astro', 'svelte', 'proyectos', 'ia-engineering']
source: devtools-herramientas-que-no-se-llevan-lo-que-pegas
---

We have all done it. A production JWT lands on your desk, you want to see what is inside, and you paste it into the first site Google gives you. Same with a JSON full of customer data, an IBAN to test a form, or a cURL command with the token still in the header. You have no idea who runs that site or what it does with what you send, and you send it anyway, because you are in a hurry.

In February I got tired of it and built my own toolbox: fourteen utilities on a single page, so I would stop pasting things into sites I didn't know. In September I rebuilt it from scratch, and today it has 52 tools. It's called [DevTools](https://devtools.alvarotc.com/en), and this post covers what it is and how I made it.

## What it is

A site with the tools I open twenty times a day, in one place, in English and Spanish. Format a JSON, decode a JWT, test a regex, diff two texts, turn a timestamp into a date, hash a file, generate UUIDs or a thousand rows of mock data with a seed so they come out the same every time.

They are grouped in eight categories, but I rarely browse them. I press `Ctrl K`, type "base64" or "cron" and go. There are more shortcuts (`/` to search, `c` to copy the result, `?` to list them all), favorites and recents in the sidebar, and three themes: light, dark, and a terminal one, green on black.

## What you paste stays on your machine

DevTools has no backend. The site is static files and your browser does all the work. When you paste a token into the [JWT decoder](https://devtools.alvarotc.com/en/jwt-decoder), the header, payload and expiry are worked out right there, in your tab. No request carries your text, because there is no server to send it to.

To be precise, two things do leave the page: a visit counter (Umami, on my own server, no cookies) and the download of the ECB exchange rates for the currency converter. Neither carries anything you type.

Some tools remember your last input, so the JSON or the regex is still there when you come back. The ones that can touch personal data never do: DNI, IBAN, social security numbers, phone numbers, cards, JWTs, cURL commands, passwords and hashes are not stored, not even in your own browser.

You don't have to take my word for it. The code is on [GitHub under the MIT license](https://github.com/alvarotorresc/devtools), and you can check all of the above.

## The Spanish tools

The other reason to build it: the tools I use most when working in Spain were not in one place anywhere. Every time I needed a valid test DNI or had to check a CIF, I ended up on a different site, usually covered in ads.

Now there is a whole category for that. The [Spanish DNI and NIE validator](https://devtools.alvarotc.com/en/spanish-dni-nie-validator) works out the check letter and generates fake documents for tests. The IBAN one splits a Spanish account into bank, branch and check digits. There are also CIF, social security number, license plates, phone numbers and postcodes with their province.

For freelancers billing in Spain, the [IRPF withholding calculator](https://devtools.alvarotc.com/en/spanish-irpf-withholding-calculator) builds the invoice with VAT and withholding, from the base amount or from what you want to take home. The [business days calculator](https://devtools.alvarotc.com/en/spanish-business-days-calculator) counts the days between two dates without the national holidays.

## From hash routes to a real website

The first version was a Vite and TypeScript SPA with no framework. One page, with each tool on a hash route: `#json`, `#jwt`. It worked fine for me, but to a search engine it was a single page with a single title. If someone searched for "decode JWT", DevTools didn't exist.

On 26 September I rebuilt it with Astro 7 and Svelte 5 islands. Each tool is now a static page with its own URL in each language, its own title, description and a text explaining what it is for. The browser only loads the JavaScript for that tool's component. The old hash links still work and redirect to the new pages.

The next day it went from 14 to 52 tools, in three batches.

## How I built it

I did it differently this time than with [Bito](/blog/from-an-idea-to-an-apk-in-24-hours/). Before touching any code I wrote the spec for the platform and for the new tools, and a plan for each block of work. They are in the repo, under `docs/superpowers`. Most of the code was written by AI agents following those plans. What I decided was what went in, how each tool had to behave, and what had to pass before anything counted as done.

That last part is what makes it work. Each tool's logic is plain TypeScript with no DOM, with its own Vitest tests. Each tool also has a browser test in Playwright. The tests fail if a tool is missing a string, a slug or its content in either language. And on every PR, CI runs the linter, type checks, unit tests, the build, a CSS check and an SEO check on the build, and finishes with the browser tests. If any of that fails, it doesn't go in.

## SEO without tricks

A useful tool is not worth much if nobody finds it. In October I spent two sessions making each page findable for what it does: its own title, description and `h1` for every tool, category pages with text written for each one (like the [identifiers page](https://devtools.alvarotc.com/en/identifiers)), breadcrumbs, related tools at the bottom of each page, a sitemap with the real date of each change, and an IndexNow ping on every deploy.

A script in CI keeps an eye on all of it and fails if a page loses its title, goes out of range or drops its internal links. There is no hidden text and no filler pages. If someone searches "validate IBAN" and lands on DevTools, I want it to be because the page does exactly that.

## What's next

I don't have a fixed list of new tools. Real searches will decide: once Search Console tells me what people arrive looking for, I'll know whether tools are missing or whether the existing ones need explanations next to them, along the lines of "what does chmod 755 mean".

In the meantime, [DevTools is here](https://devtools.alvarotc.com/en), with no account and nothing to install. If a tool is missing or one does something odd, open an issue on [the repository](https://github.com/alvarotorresc/devtools/issues). I read them.

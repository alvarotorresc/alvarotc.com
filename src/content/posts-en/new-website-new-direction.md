---
title: New website, new direction
description: 'I have rebuilt my personal website from scratch. Here I tell why, what decisions I made and what comes next.'
date: 2026-02-16
draft: false
tags: ['meta', 'web', 'astro', 'proyectos']
---

## The previous website was dead

My personal website had been dead for over two years with Next.js 12, a design that I never finished polishing and zero real content. It was a static landing page that told nothing about me or what I do. Every time someone asked me for a portfolio or a professional link, I felt a mix of shame and laziness. Shame because I knew it didn't represent me, and laziness because touching that code meant dealing with obsolete dependencies and technical decisions that I no longer shared.

So a few weeks ago I decided it was time to throw it all away and start clean.

## Why Astro and not Next.js

The decision was easier than I thought. My personal website doesn't need SSR, it doesn't need API routes, it doesn't need a React runtime on every page. What it needs is:

- **Extreme performance**: static HTML, zero unnecessary JavaScript.
- Markdown to write\*\*: no CMS, no database, just files
- Flexibility for point-in-time interactivity\*\*: where I need it, I can mount a React component

Astro 5 is a perfect fit. The concept of _islands architecture_ allows me to have animations with Framer Motion only where it makes sense, while the rest of the page is pure HTML. The result is a website that loads in milliseconds.

## The design decisions

I wanted something that reflected how I work: straightforward, unadorned, functional. I was inspired by the personal websites of developers I admire: minimalist, with good contrast and careful typography.

The palette is intentionally restrained. An almost black background, clear text and a single accent color: electric indigo. There are no flashy gradients or effects everywhere. The few visual details there are, like the subtle glow on hover or the input animations, are there to give life without being distracting.

The structure is deliberately simple: who I am, what I write, what I build. Three sections, no complex navigation menu. If someone comes to my website, in five seconds they know what I do and can explore my projects.

## Bilingual from day one

One of the things that interested me the most was to have the website in Spanish and English. Not as a _nice to have_, but as something structural. The system I have set up translates the posts automatically using DeepL at the moment of the build. I write in Spanish, the machine translates, I proofread, and both versions are deployed together.

This allows me to write frictionlessly in my native language and have international reach without duplicating work.

## What's next: building in public

This website is not just a portfolio. From now on I want to use it as a development diary. I have several products in different phases:

- **Let's meet**, a social app to organize plans with friends, which is already in beta with a small group of testers.
- DevTools Suite\*\*, a set of tools for developers that I use myself every day.
- **Swiss Knife**, an Android app with everyday utilities that I'm preparing for the Play Store.
- And other more ambitious projects that are still in the idea phase.

My intention is to tell you here how I build them. Not generic tutorials, but real decisions: why I choose one technology over another, how I solve specific problems, what works and what does not. The kind of content I would have liked to find when I started.

## The complete stack

In case you're interested in the technical detail, here's what's under the hood:

- **Astro 5** with static generation
- **React** only for interactive components (islands)
- Tailwind CSS\*\* with custom properties for the theme
- TypeScript\*\* in strict mode
- Framer Motion\*\* for animations, with respect for `prefers-reduced-motion`.
- Satori + Sharp\*\* for generating dynamic Open Graph images for each post
- Vercel\*\* for hosting with automatic deploy on each push
- **GitHub Actions** for CI: lint, type checking, build and tests before merging

All the code is open source. If you are interested in how it is done, the repository is linked in each web project.

## Next step

Write. Publish. Iterate. The website is where I wanted it to be. Now it's time to fill it with real content and keep building products. If anything I do interests you, stick around. This has just begun.

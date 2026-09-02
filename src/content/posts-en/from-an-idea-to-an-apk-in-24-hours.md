---
title: From an idea to an APK in 24 hours
description: "Four design documents before writing a single line of code. That's how Bito, my FOSS habit-tracking app for Android, went from an idea to an APK installed on my phone."
date: 2026-08-14
draft: true
tags: ['android', 'kotlin', 'compose', 'foss', 'proceso', 'ia-engineering']
---

On the evening of August 13, I finished Bito’s first design document. By the evening of the 14th, I had the APK installed on my Pixel. Just over twenty-four hours, spread out over two afternoons.

It would be tempting to tout the speed. But the interesting part of the process is exactly the opposite: for almost all of that time, I didn’t write any code. I wrote four documents. The code came last—in three commits—and it was the easy part precisely because it came last.

## The Idea

Bito is a habit tracker for Android. 100% offline, no accounts, no servers, open-source software. It stems from a specific problem: the habit apps I’ve tried make the important parts complicated. Building a habit takes five screens. Noting that you drank water today takes three taps and a decision.

The guiding principle can be summed up in one sentence: **recording a habit should cost almost nothing**.

The other half of the product is Habi, a mascot. It’s not just for decoration. The project’s name comes from combining the two parts—Bito + Habi = habit—and Habi’s face is the only part of the app you don’t buy with points: it’s a direct reflection of your consistency over the last seven days.

## Four Documents Before a Single Line of Code

The design was divided into four phases, each with its own validated deliverable before moving on to the next. Each decision was marked as `[DECIDED]`, `[PROPOSAL]`, or `[PENDING — Phase 2]`, with a date. It sounds like bureaucracy until you’ve spent two days making decisions and need to know what’s been finalized.

### Phase 1 — What the App Does

Internally, every Bito habit is defined by four components: metric (check, quantity, duration), period (day, week, month), direction (minimum, maximum, zero), and goal. That model covers everything from “making the bed” to “social media, max 30 minutes a day” without any special branches.

The user never sees this: they choose from five presets that fill it in for them. A deliberate separation between what the system needs and what a person needs to see at seven in the morning.

The decision that most defines the product is another: **anti-drill sergeant**. The app doesn’t punish or prevent you from making corrections. Unlimited retroactive logging, breaks for vacations or injuries that don’t break your streak, and “freeze” features you can purchase with points you’ve already earned. Discipline is the only currency, but there’s always a safety valve.

Habi, moreover, is mandatory—there’s no toggle to disable it. The safety valve for those who don’t want drama isn’t a switch: it’s choosing the Neutral personality instead of the sergeant or the cheerleader.

### Phase 2 — How It’s Built

Native Kotlin with Jetpack Compose—and not just out of personal preference: Bito’s star features lie at the interface with the operating system—widgets, precise alarms without Google Play Services, quick actions within notifications. Cross-platform solutions address these boundaries with third-party bridge plugins, and each bridge is a potential point of failure that I have no control over. On a phone without Google, that’s critical. Add to that the fact that F-Droid compiles from source, and the decision makes itself.

The architecture consists of three layers in a single module:

```
com.alvarotc.bito
├── ui/ → Compose screens · Glance widget · notifications · theme
├── domain/  → the engine: logical day, streaks, stamping, points, mood
└── data/    → Room · DataStore · backup · repos
```

There’s one rule that applies to the entire diagram: `domain/` doesn’t care about anything related to Android. It’s pure Kotlin, with no internal clock (it receives `now` as a parameter). The result is that most of Bito’s potential bugs can be tested on the JVM—without an emulator—in milliseconds.

Second rule: **derived values are not stored**. Streaks, percentages, heatmaps, mood, and perfect days are calculated from the logs. No `streak` field that needs to be kept in sync and gets corrupted at the first opportunity. Retroactive logging simply works, because there’s nothing to fix.

And a decision that almost no one makes early enough: **backup is a core feature, not an extra**. There will be full export and import capabilities starting with the first usable build, in human-readable JSON, with round-trip testing and an explicit PR rule: any PR that modifies the schema must update the backup serializer in that very same PR. The backup never falls behind by even a single commit.

The claim that “it doesn’t touch the network” isn’t just a marketing promise either. It’s a line missing from the manifest:

```xml
<!-- Bito intentionally does not declare the INTERNET permission: the guarantee that “your data
 never leaves your phone” is verifiable by anyone in this manifest. -->
```

Anyone can unpack the APK and check it. That’s the difference between saying you respect privacy and making it verifiable.

### Phase 3 — How It Looks

Three visual direction briefs with distinct aesthetics—one dark and warm, one paper-cream, one cool pastel—and intentionally identical content, to compare only the aesthetics. “Crema” won, borrowing a touch from the dark one: the progress dots.

A single theme, with no light or dark mode. A conscious decision: half the visual work and a stronger identity.

The color tokens ended up in the code exactly as is:

```kotlin
// Bito color tokens — "Cream" style
val Paper = Color(0xFFF2ECE1)
val Card = Color(0xFFFBF8F2)
val Border = Color(0xFFE7DFD1)
val Ink = Color(0xFF3C352B)
val SoftInk = Color(0xFF9C9285)
val Paper = Color(0xFF57A06B)
val TintedPaper = Color(0xFFE3EDE0)
val Ember = Color(0xFFD9704F)
val EmberTint = Color(0xFFF7E3DB)
val Sage = Color(0xFFA9C9A1)
val Cheeks = Color(0xFFE8B4A8)
```

`Leaf` is the only interactive accent. `Ember` represents emotional heat—bursts, records, celebration—and is prohibited from appearing on a button. Boring rules that prevent the app from turning into a carnival on screen number twelve.

An idea also died here. The initial report on the mascot envisioned an art pipeline in Blender. The final approach is 2D vector art drawn in code: tintable layers and a parametric face where mood and personality emerge from drawing parameters, not from a single asset combined with others. Less ambitious on paper, infinitely cheaper to maintain.

### Phase 4 — Build Order

Eleven milestones, from M0 to M10, with one condition: each one must result in something installable or verifiable. No dates, because the actual pace is irregular; the commitment is that each session will deliver a complete deliverable.

The license and distribution were also finalized here. **GPL-3.0-or-later**, because of the copyleft: any derivative of Bito must remain free, which makes a clone with ads and tracking unfeasible—a real risk for FOSS apps that work well. And simultaneous release via Google Play, F-Droid, and GitHub Releases, because regular people—including my family—install apps from Play, not from an alternative repo.

The document concludes with a phrase I like: the rule of not writing code during the design phase has been fulfilled and honorably expired.

## M0: Three Commits and an APK

With all four documents validated, M0 (“Foundations”) went quickly because there were no outstanding decisions left. Three atomic commits:

```
33f7eb7  chore: add project baseline (license, readme, changelog, tooling)
f8b9a9f  chore: scaffold Android project with Gradle and CI
e457cb0  feat(ui): add Crema theme, Outfit typography, and Habi launcher icon
```

Includes: Gradle 8.11.1 with AGP 8.7.2 and Kotlin 2.1, minSdk 26, Compose declared in a version catalog, ktlint with a pre-commit hook via Lefthook, and a CI that runs `ktlintCheck lint test assembleDebug` on every push and every PR. Passes in three minutes.

What you see when you open the app is a screen that says “Hello, Bito” with the Habi icon on top—“Habi peeking out,” the bean entering from the bottom edge without a container: the character is the logo—. That’s it. A debug APK, versionName `0.0.1`, manually installed on my Pixel. There’s no release, no tag, and no real tests yet: the `domain/` package doesn’t exist yet, and the CI’s `test` currently runs empty. The real suite comes with the engine, on M1, using my actual list of habits as fixtures.

## What Didn’t Work: the JDK

The only real struggle of the session wasn’t with Gradle or Compose. It was with Java.

My system is Nobara, a Fedora derivative, and it comes with OpenJDK 25 by default. AGP 8.7.2 doesn’t support it. The logical thing to do was to use version 21, and the system said it had it: `/usr/lib/jvm/java-21-openjdk` existed. Inside, there was only a `man` directory. An empty shell, without a single binary.

The solution was to stop fighting with the system’s JDK. I manually downloaded Temurin 21 and had Gradle point to it globally:

```properties
# ~/.gradle/gradle.properties
org.gradle.java.home=/home/alvarotc/.jdks/jdk-21.0.12+8
```

Globally, not within the project, by the way: the repo is public, and there’s no reason for my machine’s path to be included in it. In CI, the problem doesn’t exist, because `setup-java` installs a clean Temurin 21. No “how to start an Android project” guide mentions this kind of friction, and that’s where the real time is spent.

## What I Learned

- **Designing slowly makes building fast.** M0 didn’t have a single discussion, because all the decisions had already been finalized and documented. Starting with the code would have meant making the same decisions, but on the fly, half-heartedly, and without a paper trail.
- **The “why” next to each decision is half the value of the document.** In three months, I won’t remember why I ruled out Flutter, or why I chose Room over SQLDelight. The document will.
- **This isn’t “vibe coding.”** I work with AI all the time, but the division of labor is explicit: I lead, decide, and review; the AI proposes alternatives and executes them. Every product, architecture, and design decision was made by me, signed and dated. The difference isn’t in speed—it’s in whether, in the end, you know why your app is the way it is.
- **A permission you don’t declare is worth more than a paragraph in a privacy policy.** Verifiable beats promised, every time.
- **Be careful not to confuse “what was planned” with “what was done.”** The plan stated that M0 would set up the three-package structure. In reality, it left `ui/theme` and little else. The plan is an intention; the repo is the current state.

The repository has been public since the first commit: [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito). Now it’s time for M1, the domain engine, which is where Bito stops being a pretty icon and starts knowing how to count streaks.

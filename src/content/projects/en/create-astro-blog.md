---
name: create-astro-blog
tagline: Create a customizable Astro blog with one command.
kind: cli
status: published
tier: lab
order: 6
visible: false
repo: https://github.com/alvarotorresc/create-astro-blog
url: https://www.npmjs.com/package/create-astro-blog
stack: [Node, CLI, Astro]
githubRepo: alvarotorresc/create-astro-blog
command: npx create-astro-blog my-blog
terminal:
  - '$ npx create-astro-blog my-blog'
  - ''
  - '✔ Blog name: › My Blog'
  - '✔ Tagline: › Backend notes and free software'
  - '✔ Domain (for SEO): › https://my-blog.com'
  - '✔ Color theme: › Ocean'
  - '✔ Enable multi-language (ES/EN)? › yes'
  - '✔ Enable newsletter? › yes'
  - '✔ Newsletter provider: › Buttondown'
  - ''
  - 'Installing dependencies...'
  - 'Done! Your blog is ready.'
  - '$ cd my-blog && npm run dev'
facts:
  - { label: 'Latest version', value: '[DATO]', mono: true }
  - { label: 'Node', value: '[DATO]', mono: true }
  - { label: 'License', value: '[DATO]', mono: true }
featuresIntro: 'A static blog with Astro 5, ready for your first post.'
features:
  - title: 'Static blog with Astro 5'
    text: 'Pages generated at build time. Deploys to any static host.'
  - title: 'Five colour themes or your own'
    text: 'Wine, ocean, forest, sunset and minimal, or a hex colour.'
  - title: 'Spanish and English'
    text: 'Multi-language with automatic translation through DeepL.'
  - title: 'Newsletter'
    text: 'With Buttondown, Brevo or Mailchimp.'
  - title: 'OG images at build time'
    text: 'Every post ships with its social image, without designing it by hand.'
  - title: 'Light and dark mode'
    text: 'The reader chooses how to read it.'
  - title: 'RSS'
    text: 'A feed ready for people who read with a reader.'
  - title: 'Vercel Analytics'
    text: 'Visits without setting anything else up if you deploy on Vercel.'
stepsIntro: 'The CLI asks six questions and saves everything in blog.config.ts. If you change your mind later, you edit that file.'
steps:
  - title: 'Name and tagline'
    text: 'The name comes from the directory and you can change it.'
  - title: 'Domain'
    text: 'For canonical URLs and SEO.'
  - title: 'Colour theme'
    text: 'wine, ocean, forest, sunset, minimal or custom with your hex colour.'
  - title: 'Social links'
    text: 'Twitter, Instagram and LinkedIn. All optional.'
  - title: 'Multi-language'
    text: 'Spanish and English. Automatic translation needs a DeepL key.'
  - title: 'Newsletter'
    text: 'If you want one, you pick the provider: Buttondown, Brevo or Mailchimp.'
after: 'cd my-blog && npm run dev'
built:
  - 'A Node CLI you run with npx, nothing to install.'
  - 'Generates a blog with Astro 5.'
  - 'Your answers end up in blog.config.ts, a file you read and edit.'
  - 'Code at [github.com/alvarotorresc/create-astro-blog](https://github.com/alvarotorresc/create-astro-blog).'
changelog:
  - { version: '[DATO]', note: '[DATO]' }
---

[DATO: why it exists, first paragraph]

[DATO: second paragraph]

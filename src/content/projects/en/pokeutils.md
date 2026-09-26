---
name: PokeUtils
tagline: 'Your retro Pokémon guide: competitive analysis, breeding and a full Pokédex.'
intro: 'If you play competitive, here you find out whether your team survives that attack. If you breed, who pairs with whom. And if you just want to check the dex, it is complete, in Spanish, and it does not ask you for an account.'
kind: web
status: published
tier: lab
order: 5
repo: https://github.com/alvarotorresc/PokeUtils
url: https://pokeutils.alvarotc.com
stack: [JavaScript, SPA]
githubRepo: alvarotorresc/PokeUtils
icon: '../../../assets/projects/pokeutils/icon.png'
cover: '../../../assets/projects/pokeutils/cover.png'
facts:
  - { label: 'Languages', value: 'Spanish and English' }
  - { label: 'Accounts', value: 'No accounts, no ads' }
screenshots:
  - src: '../../../assets/projects/pokeutils/pokedex.png'
    alt: 'The Pokédex list with the filter panel for type, generation and rarity'
    caption: 'Pokédex'
  - src: '../../../assets/projects/pokeutils/dano.png'
    alt: 'The damage calculator with attacker, defender, move and the resulting damage range'
    caption: 'Damage calculator'
  - src: '../../../assets/projects/pokeutils/sobrevive.png'
    alt: 'The Does it survive tool: the verdict and the minimum EVs to take the hit'
    caption: 'Does it survive'
toolsIntro: 'All 16 tools, each at its own address.'
tools:
  - name: 'Pokédex'
    text: 'All 1025 Pokémon with stats, types, abilities and weaknesses.'
    href: 'https://pokeutils.alvarotc.com/#/pokedex'
  - name: 'Compare'
    text: 'Up to four Pokémon side by side, by stats and weaknesses.'
    href: 'https://pokeutils.alvarotc.com/#/compare'
  - name: 'Egg groups'
    text: 'The 15 breeding groups and their compatibility rules.'
    href: 'https://pokeutils.alvarotc.com/#/egg'
  - name: 'Moves'
    text: '937 moves with filters and a detail page.'
    href: 'https://pokeutils.alvarotc.com/#/moves'
  - name: 'Abilities'
    text: '313 abilities with descriptions and search.'
    href: 'https://pokeutils.alvarotc.com/#/abilities'
  - name: 'Items'
    text: '1848 items with sprites and filters.'
    href: 'https://pokeutils.alvarotc.com/#/items'
  - name: 'Natures'
    text: 'All 25 natures and their modifiers in a 5×5 grid.'
    href: 'https://pokeutils.alvarotc.com/#/natures'
  - name: 'Type chart'
    text: 'Offensive and defensive effectiveness for each type.'
    href: 'https://pokeutils.alvarotc.com/#/types'
  - name: 'Team analysis'
    text: 'Up to six Pokémon: what threatens them and what they cover.'
    href: 'https://pokeutils.alvarotc.com/#/team'
  - name: 'Counter my team'
    text: 'Who threatens your team among 1259 candidates.'
    href: 'https://pokeutils.alvarotc.com/#/counter'
  - name: 'Speed'
    text: 'Speed ranking relative to one Pokémon.'
    href: 'https://pokeutils.alvarotc.com/#/speed'
  - name: 'Does it survive?'
    text: 'Damage range, verdict and the minimum EVs to take the hit.'
    href: 'https://pokeutils.alvarotc.com/#/survive'
  - name: 'Meta sets'
    text: 'Sets from real Smogon usage, in OU and VGC.'
    href: 'https://pokeutils.alvarotc.com/#/meta'
  - name: 'IV/EV calculator'
    text: 'Final stats or the possible IVs.'
    href: 'https://pokeutils.alvarotc.com/#/calculator'
  - name: 'Damage calculator'
    text: 'The damage formula from the fifth generation onwards.'
    href: 'https://pokeutils.alvarotc.com/#/calculator?tab=damage'
  - name: 'Catch calculator'
    text: 'Catch probability by ball, status and HP.'
    href: 'https://pokeutils.alvarotc.com/#/calculator?tab=catch'
featuresIntro: 'Build a team, breed without guessing and check the dex.'
features:
  - title: 'Your team'
    text: 'Up to six. You see which types threaten it and what coverage it lacks.'
    image: '../../../assets/projects/pokeutils/equipo.png'
  - title: 'Breeding'
    text: 'Who pairs with whom: 15 egg groups and the five real breeding rules.'
  - title: 'The dex'
    text: 'Complete and in Spanish, with filters that stay in the URL. No friction.'
    image: '../../../assets/projects/pokeutils/ficha.png'
  - title: 'Every Pokémon'
    text: '1025 Pokémon and 326 forms.'
  - title: 'One search for everything'
    text: 'Covers 1351 Pokémon, 937 moves, 313 abilities and 1848 items.'
  - title: 'Comparison'
    text: 'Up to four Pokémon, side by side.'
  - title: '16 tools'
    text: 'Pokédex, a page for each Pokémon, egg groups, moves and more.'
illustration: '../../../assets/projects/pokeutils/icon.png'
built:
  - 'JavaScript with no framework.'
  - 'A SPA with #/ routes: every view and every filter has its URL.'
  - 'No accounts and no ads.'
  - 'In Spanish and English.'
  - 'MIT license, code at [github.com/alvarotorresc/PokeUtils](https://github.com/alvarotorresc/PokeUtils).'
changelog:
  - {
      version: 'v1.0.0',
      date: 2026-08-28,
      note: 'The first full release of PokeUtils: 16 tools and 21 routes to play, breed and compete, with a retro look and zero frameworks.',
    }
---

A vanilla JavaScript single-page app, no framework, built to learn the platform.

If you play competitive, here you find out whether your team survives that attack and who can tear it apart. If you breed, who pairs with whom. And if you just want to check the dex, it is complete, in Spanish, and it does not ask you for an account.

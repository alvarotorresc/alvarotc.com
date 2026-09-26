---
name: PokeUtils
tagline: 'Tu guía Pokémon retro: análisis competitivo, crianza y Pokédex completa.'
intro: 'Si juegas competitivo, aquí sabes si tu equipo aguanta ese ataque. Si crías, con quién cruza cada uno. Y si solo vienes a consultar la dex, está entera, en español, y no te pide una cuenta.'
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
  - { label: 'Idiomas', value: 'Español e inglés' }
  - { label: 'Cuentas', value: 'Sin cuentas ni anuncios' }
screenshots:
  - src: '../../../assets/projects/pokeutils/pokedex.png'
    alt: 'La lista de la Pokédex con el panel de filtros por tipo, generación y rareza'
    caption: 'Pokédex'
  - src: '../../../assets/projects/pokeutils/dano.png'
    alt: 'La calculadora de daño con atacante, defensor, movimiento y el rango de daño resultante'
    caption: 'Calculadora de daño'
  - src: '../../../assets/projects/pokeutils/sobrevive.png'
    alt: 'La herramienta Sobrevive esto: el veredicto y los EVs mínimos para aguantar el golpe'
    caption: 'Sobrevive esto'
toolsIntro: 'Las 16 herramientas, cada una en su propia dirección.'
tools:
  - name: 'Pokédex'
    text: 'Los 1025 Pokémon con stats, tipos, habilidades y debilidades.'
    href: 'https://pokeutils.alvarotc.com/#/pokedex'
  - name: 'Comparador'
    text: 'Hasta cuatro Pokémon lado a lado, por stats y debilidades.'
    href: 'https://pokeutils.alvarotc.com/#/compare'
  - name: 'Grupos huevo'
    text: 'Los 15 grupos de cría y sus reglas de compatibilidad.'
    href: 'https://pokeutils.alvarotc.com/#/egg'
  - name: 'Movimientos'
    text: '937 movimientos con filtros y su ficha.'
    href: 'https://pokeutils.alvarotc.com/#/moves'
  - name: 'Habilidades'
    text: '313 habilidades con descripción y buscador.'
    href: 'https://pokeutils.alvarotc.com/#/abilities'
  - name: 'Objetos'
    text: '1848 objetos con sprite y filtros.'
    href: 'https://pokeutils.alvarotc.com/#/items'
  - name: 'Naturalezas'
    text: 'Las 25 naturalezas y sus modificadores en una rejilla de 5×5.'
    href: 'https://pokeutils.alvarotc.com/#/natures'
  - name: 'Tabla de tipos'
    text: 'Efectividad ofensiva y defensiva de cada tipo.'
    href: 'https://pokeutils.alvarotc.com/#/types'
  - name: 'Análisis de equipo'
    text: 'Hasta seis Pokémon: qué los amenaza y qué cobertura tienen.'
    href: 'https://pokeutils.alvarotc.com/#/team'
  - name: 'Contrarrestar mi equipo'
    text: 'Quién amenaza a tu equipo entre 1259 candidatos.'
    href: 'https://pokeutils.alvarotc.com/#/counter'
  - name: 'Velocidad'
    text: 'Ranking de velocidad relativo a un Pokémon.'
    href: 'https://pokeutils.alvarotc.com/#/speed'
  - name: '¿Sobrevive esto?'
    text: 'Rango de daño, veredicto y los EVs mínimos para aguantar el golpe.'
    href: 'https://pokeutils.alvarotc.com/#/survive'
  - name: 'Sets del meta'
    text: 'Sets de uso real de Smogon, en OU y VGC.'
    href: 'https://pokeutils.alvarotc.com/#/meta'
  - name: 'Calculadora IV/EV'
    text: 'Los stats finales o los IVs posibles.'
    href: 'https://pokeutils.alvarotc.com/#/calculator'
  - name: 'Calculadora de daño'
    text: 'La fórmula de daño de la quinta generación en adelante.'
    href: 'https://pokeutils.alvarotc.com/#/calculator?tab=damage'
  - name: 'Calculadora de captura'
    text: 'Probabilidad de captura según la ball, el estado y los PS.'
    href: 'https://pokeutils.alvarotc.com/#/calculator?tab=catch'
featuresIntro: 'Preparar un equipo, criar sin adivinar y consultar la dex.'
features:
  - title: 'Tu equipo'
    text: 'Hasta seis. Ves qué tipos lo amenazan y qué cobertura le falta.'
    image: '../../../assets/projects/pokeutils/equipo.png'
  - title: 'Cría'
    text: 'Con quién cruza cada uno: 15 grupos huevo y las cinco reglas de cría de verdad.'
  - title: 'La dex'
    text: 'Entera y en español, con filtros que quedan en la URL. Sin fricción.'
    image: '../../../assets/projects/pokeutils/ficha.png'
  - title: 'Todos los Pokémon'
    text: '1025 Pokémon y 326 formas.'
  - title: 'Un buscador para todo'
    text: 'Cruza 1351 Pokémon, 937 movimientos, 313 habilidades y 1848 objetos.'
  - title: 'Comparador'
    text: 'Hasta cuatro Pokémon, uno al lado del otro.'
  - title: '16 herramientas'
    text: 'Pokédex, ficha de cada Pokémon, grupos huevo, movimientos y más.'
illustration: '../../../assets/projects/pokeutils/icon.png'
built:
  - 'JavaScript sin framework.'
  - 'Una SPA con rutas #/: cada vista y cada filtro tienen su URL.'
  - 'Sin cuentas y sin anuncios.'
  - 'En español y en inglés.'
  - 'Licencia MIT, código en [github.com/alvarotorresc/PokeUtils](https://github.com/alvarotorresc/PokeUtils).'
changelog:
  - {
      version: 'v1.0.0',
      date: 2026-08-28,
      note: 'La primera versión completa de PokeUtils: 16 herramientas y 21 rutas para jugar, criar y competir, con estética retro y cero frameworks.',
    }
---

Una SPA en JavaScript sin framework, hecha para aprender la plataforma.

Si juegas competitivo, aquí sabes si tu equipo aguanta ese ataque y quién te lo puede reventar. Si crías, con quién cruza cada uno. Y si solo vienes a consultar la dex, está entera, en español, y no te pide una cuenta.

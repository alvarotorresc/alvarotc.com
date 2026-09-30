---
name: create-astro-blog
tagline: Crea un blog con Astro, personalizable, con un solo comando.
kind: cli
status: published
tier: lab
order: 6
visible: false
repo: https://github.com/alvarotorresc/create-astro-blog
url: https://www.npmjs.com/package/create-astro-blog
stack: [Node, CLI, Astro]
githubRepo: alvarotorresc/create-astro-blog
license: MIT
command: npx create-astro-blog my-blog
terminal:
  - '$ npx create-astro-blog my-blog'
  - ''
  - '✔ Blog name: › My Blog'
  - '✔ Tagline: › Notas de backend y software libre'
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
  - { label: 'Última versión', value: '1.0.0', mono: true }
  - { label: 'Node', value: '>=18.0.0', mono: true }
  - { label: 'Licencia', value: 'MIT', mono: true }
featuresIntro: 'Un blog estático con Astro 5, listo para escribir el primer post.'
features:
  - title: 'Blog estático con Astro 5'
    text: 'Páginas generadas en el build. Se despliega en cualquier hosting estático.'
  - title: 'Cinco temas de color o el tuyo'
    text: 'Wine, ocean, forest, sunset y minimal, o un color en hexadecimal.'
  - title: 'Español e inglés'
    text: 'Multiidioma con traducción automática por DeepL.'
  - title: 'Newsletter'
    text: 'Con Buttondown, Brevo o Mailchimp.'
  - title: 'Imágenes OG en el build'
    text: 'Cada post sale con su imagen para redes, sin diseñarla a mano.'
  - title: 'Modo claro y oscuro'
    text: 'El lector elige cómo lo lee.'
  - title: 'RSS'
    text: 'Feed listo para quien lee con lector.'
  - title: 'Vercel Analytics'
    text: 'Visitas sin montar nada aparte si despliegas en Vercel.'
stepsIntro: 'El CLI hace seis preguntas y lo guarda todo en blog.config.ts. Si luego cambias de idea, editas ese fichero.'
steps:
  - title: 'Nombre y tagline'
    text: 'El nombre sale del directorio y lo puedes cambiar.'
  - title: 'Dominio'
    text: 'Para las URL canónicas y el SEO.'
  - title: 'Tema de color'
    text: 'wine, ocean, forest, sunset, minimal o custom con tu hexadecimal.'
  - title: 'Redes'
    text: 'Twitter, Instagram y LinkedIn. Todas opcionales.'
  - title: 'Multiidioma'
    text: 'Español e inglés. La traducción automática pide una clave de DeepL.'
  - title: 'Newsletter'
    text: 'Si la quieres, eliges proveedor: Buttondown, Brevo o Mailchimp.'
after: 'cd my-blog && npm run dev'
built:
  - 'Un CLI en Node que se ejecuta con npx, sin instalar nada.'
  - 'Genera un blog con Astro 5.'
  - 'Tus respuestas quedan en blog.config.ts, un fichero que lees y editas.'
  - 'Código en [github.com/alvarotorresc/create-astro-blog](https://github.com/alvarotorresc/create-astro-blog).'
changelog:
  - { version: 'v1.0.0', note: '[DATO]' }
---

[DATO: por qué existe, primer párrafo]

[DATO: segundo párrafo]

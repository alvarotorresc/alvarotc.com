---
title: 'Cómo está hecha DevTools: Astro, Svelte y agentes con plan'
seoTitle: 'Cómo está hecha DevTools'
description: 'Islas de Svelte, una carpeta por herramienta, privacidad declarada en el código y una web entera hecha con agentes que ejecutan planes verificados.'
date: 2026-10-08
draft: false
image: '/blog/devtools/cover-es.png'
tags: ['producto', 'process', 'web', 'foss']
---

La primera versión de DevTools salió el 14 de febrero de 2026 con 14 herramientas, y era solo para mí. En septiembre quería tres cosas: que se viera mejor y más clara, añadir las herramientas que veía usar a mis compañeros de trabajo (sobre todo para rellenar datos contra la Administración pública) y que dejara de ser algo mío para ser de cualquiera.

Así que la rehice desde cero en Astro y Svelte, y la versión vieja quedó aparcada en `legacy/` hasta que la nueva tuvo todas sus herramientas. Lo interesante del proceso está en cómo la construí: yo hice de arquitecto y los obreros fueron agentes de código. La web está hecha entera así.

## Arquitecto y obreros: spec, planes y revisión

Mi parte del trabajo empieza antes del código. Escribo y reviso la spec de diseño (hay dos en `docs/superpowers/specs`: la plataforma y las herramientas nuevas), la parto en planes por lotes y reviso a mano cada PR antes de mergear. Hay cinco planes: plataforma A, plataforma B y tres lotes de herramientas. Cada uno abre con la misma instrucción para el agente: ejecutarlo tarea a tarea con subagent-driven development (la opción recomendada; la otra es executing-plans), marcando casillas. El plan B fija este orden: la Task 0 sola, las tareas 1 a 12 en paralelo, la fusión de sus ramas y la Task 13 sola para cerrar.

**Lo que hace que esto funcione está en cómo se escribe el plan.** Lo concreto en DevTools se resume en cuatro decisiones.

La primera es el contexto acotado. Cada tarea de herramienta toca solo su carpeta `src/tools/<id>/` y lista lo que consume del código compartido. Desde el plan B, si una tarea necesita algo compartido que no existe, el plan le dice que pare y avise en vez de inventarlo. Ese límite es lo que permite el paralelismo: en el plan B, la Task 0 va sola y deja pre-sembradas y comentadas las líneas de cada herramienta en el registro y en el componente que monta las islas, separadas por líneas en blanco:

```astro
// Estado tras la Task 0, copiado de docs/superpowers/plans/2026-09-26-plataforma-b.md // Plan B:
each tool task uncomments its import below and its line in the template. // Keep the blank lines
between them: they let the parallel branches merge without conflicts. // import Base64 from
'../tools/base64/Base64.svelte'; // import Url from '../tools/url/Url.svelte';
```

Después, las tareas paralelas corren cada una en su worktree y en su rama, y solo descomentan sus líneas. Cada rama cambia líneas distintas de esos dos archivos, que es lo que permite fusionarlas sin pisarse. En los tres lotes de herramientas eso se tradujo en 37 ramas `lote-N/<id>` fusionadas una a una (10, 14 y 13). En el lote 1 la fusión se simuló antes de escribir el plan con `git merge-file`: 11 fusiones, 0 conflictos, y el resultado coincidía con el archivo final.

La segunda: los planes se verifican antes de entregarse. En el lote 1 todo el código se escribió primero en un clon desechable de `main` y pasó format, lint, check, 487 tests, el build (54 páginas) y 69 tests e2e. Los bloques del plan se copiaron de esos archivos. Los vectores de prueba (DNI, CIF, IBAN, NSS, tarjetas Luhn, EAN e ISBN) se contrastaron con una implementación independiente en Node, y la tabla de IBAN, con la de la spec: 102 países, 0 diferencias.

La tercera son las restricciones globales que encabezan los planes, con las trampas ya pisadas: TypeScript `^6` porque la 7 rompe los peer deps de `@astrojs/check` y `@astrojs/svelte`, Astro 7 con un compilador en Rust que no perdona HTML inválido y `build.format: 'file'` porque Netlify respondía 301 a la URL sin barra final.

La cuarta es una regla para el obrero cuando la realidad no cuadra con el plan: adapta el componente al kit real, no al revés, y dilo en el commit.

Con todo eso, la revisión humana sigue siendo la puerta del merge. Lo que los obreros no dejaron fino a la primera lo pillé ahí: la pantalla donde sale el resultado no acababa de quedar bien, y la home al principio no tenía el listado de herramientas.

## Una carpeta por herramienta, islas de Svelte para lo interactivo

Astro genera una página estática por herramienta e idioma desde un registro tipado, `src/tools/registry.ts`. El layout, la barra lateral y los textos son HTML estático. Lo interactivo son islas: componentes de Svelte que Astro hidrata en el navegador dentro de esa página estática. En DevTools hay cuatro tipos de isla: la de cada herramienta (una por página), la paleta de comandos, el diálogo de atajos y el toaster. Fuera de ellas hay scripts sin framework en el layout y en algunos componentes de Astro: el que aplica el tema antes de pintar la página, la barra lateral, los favoritos y los atajos.

Cada herramienta es una carpeta autocontenida: `logic.ts` puro con sus tests, `meta.ts` con nombre, slugs y opciones, `strings.ts` con los textos de interfaz, `content.es.md` y `content.en.md` con la explicación, y su componente. En el plan B y en los lotes 1 y 2 la lógica no añadió dependencias: MD5 propio, SHA con WebCrypto, `BigInt`, `Intl` y el azar de `crypto.getRandomValues`. El lote 3 sí trae librerías, y son seis: `yaml` para el conversor de JSON, YAML y CSV; `marked` y `dompurify` para la vista previa de Markdown; `qrcode-generator` para el QR; `ua-parser-js` para el User-Agent, y `semver` para los rangos de versiones. Cada una se importa solo desde la carpeta de su herramienta, para que Vite la deje en el chunk de esa página y el resto de la web no la descargue. En todos los casos, `logic.ts` no toca `document`, `window` ni `localStorage`, así que se testea en Node. La letra del DNI cabe en una línea:

```ts
// src/lib/ids.ts
export function dniLetter(n: number): string {
  return DNI_LETTERS[n % 23];
}
```

## La privacidad, escrita en el código

La regla que no se negocia: sea cual sea la herramienta, la privacidad no se toca. Y está en el código. Las herramientas que manejan datos sensibles declaran en su `meta.ts` que no recuerdan lo que escribes: DNI, IBAN, NSS, teléfonos, tarjetas, JWT, cURL, contraseñas y hashes llevan `rememberInput: false`:

```ts
// src/tools/dni/meta.ts
export const meta: ToolMeta = {
  id: 'dni',
  category: 'ids',
  slug: { es: 'validador-dni-nie', en: 'spanish-dni-nie-validator' },
  // …
  rememberInput: false,
  // …
};
```

La de URL añade un filtro más: una URL con contraseña (`usuario:clave@`) no se guarda nunca, aunque la herramienta recuerde el resto.

El almacenamiento de las herramientas pasa por [`src/lib/storage.ts`](https://github.com/alvarotorresc/devtools/blob/main/src/lib/storage.ts), y ese módulo nunca lanza. Si el navegador bloquea `localStorage` o está lleno, la web sigue funcionando sin recordar nada:

```ts
export function writeString(key: string, value: string, kind: Area = 'local'): void {
  try {
    area(kind)?.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // Storage blocked or full: the app keeps working without persistence.
  }
}
```

Nunca me costó una funcionalidad, porque nunca diseñé una herramienta sin tener la privacidad en mente desde el principio. No hubo nada que quitar al final.

Lo único que se ejecuta fuera de tu navegador es una función edge de Netlify: código que corre en el CDN antes de servir la página. Solo atiende a `/` y responde un 302 a `/es` o `/en`. Para decidir lee primero la cookie funcional `nf_lang`, donde la web guarda el idioma de la última página que visitaste; si no está, mira `Accept-Language`, y si tampoco, inglés. No ve nada de lo que pegas en una herramienta.

```ts
// netlify/lib/root-language.ts
export function rootLocale(cookie: string | null, acceptLanguage: string | null): RootLocale {
  return cookieLocale(cookie) ?? headerLocale(acceptLanguage) ?? 'en';
}
```

Antes de esa función usé las reglas de idioma de `_redirects` de Netlify, y el CDN las cacheaba: servía el idioma de un visitante al siguiente. Por eso la respuesta lleva `Cache-Control: private, no-store`. Aparte de la función edge salen dos cosas más, que ya conté en el post de presentación: el contador de visitas de Umami y la descarga de los tipos de cambio del BCE, que la herramienta pide a `api.frankfurter.dev` (un servicio que los publica) en una sola petición sin parámetros: ni el importe ni las divisas salen de tu equipo.

## Primero lo que puede salir mal

Añadir una herramienta hay que pensarlo con todas sus posibilidades y, sobre todo, empezando por lo que puede salir mal. Los commits `fix` del repo lo enseñan mejor que cualquier regla:

- `fix(curl)`: no alterar `__proto__` en el cuerpo JSON. Y en el conversor de CSV y JSON, las claves `__proto__` se perdían.
- `fix(markdown)`: añadir `popover`, `popovertarget` y `name` a `FORBID_ATTR` del saneador.
- `fix(percent)`: `toPrecision(12)` redondeaba mal desde 13 dígitos. 1 234 567 890 123 más un 10 % daba 1 358 024 679 140 en vez de 1 358 024 679 135,3.
- `fix(cron)`: se guardaba la zona horaria detectada en vez de solo la elegida.
- Y una ristra de `fix(...)` que pluralizan avisos, en dos idiomas, herramienta a herramienta.

## Tres temas, y el terminal fue el que más costó

La v1 tenía un único tema, verde de terminal. La v2 tiene tres (claro, oscuro y terminal) y me costó varias vueltas que quedaran bien los tres. El terminal fue el dolor de cabeza. Usa IBM Plex Mono para todo, títulos y cuerpo, sin radios y con brillo verde:

```css
/* src/styles/tokens.css: un solo tipo de letra y tres verdes para la jerarquía */
:root[data-theme='terminal'] {
  /* … */
  --text: #33ff33;
  --text-dim: #1fae1f;
  --accent: #33ff33;
  --on-accent: #0a0a0a;
  --accent-text: #66ff66;
  /* … */
  --font-display: var(--font-mono);
  --font-body: var(--font-mono);
  --radius: 0;
  --radius-lg: 0;
  --radius-pill: 0;
  --glow: 0 0 4px rgb(51 255 51 / 0.45);
  /* … */
}
```

Con una sola fuente monoespaciada todo se leía peor que en los otros dos temas, y la jerarquía no salía sola. Hubo que definirla a mano con tamaño, peso y esos tonos de verde.

![El validador de matrículas en el tema terminal: título con «>» delante, M-1234-AB en grande como resultado y las etiquetas Formato y Provincia en un verde más apagado que sus valores.](../../assets/projects/devtools/tool-24-plate-es.png)

Al principio el terminal era el tema por defecto. Luego pasó a serlo el claro, porque se lee mejor para el público general y el terminal es muy específico para desarrolladores. Encaja con el motivo de la v2: dejar de ser una web hecha para mí.

## Lo que aprendí

- **La privacidad es una restricción de diseño, no una capa.** Si cada herramienta nace con la pregunta de qué se guarda, nunca hay que quitarle nada después.
- **Un plan se verifica antes de dárselo a un agente.** Ejecutar su código en un clon desechable y simular la fusión cuesta menos que descubrir el fallo en doce ramas a la vez.
- **El obrero se adapta al kit real, no al revés.** Si el plan y el código divergen, manda el código que existe.
- **Primero lo que puede salir mal.** `__proto__`, el redondeo o el plural en dos idiomas no salen en la demo; salen en el uso.

Si llegas directo aquí, el porqué de DevTools está en el [post de presentación](/es/blog/devtools-tres-pestanas-una-web/) y la ficha, en [/projects/devtools](/es/projects/devtools/). La web está en [devtools.alvarotc.com](https://devtools.alvarotc.com/es) y el código, con licencia MIT, en [github.com/alvarotorresc/devtools](https://github.com/alvarotorresc/devtools). Si quieres añadir una herramienta o encuentras un fallo, abre un issue o un PR: ahí lo leo y ahí contesto, en abierto.

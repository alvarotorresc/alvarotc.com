---
name: BaseCero
tagline: Tu dinero, desde cero. Finanzas personales que viven enteras en tu dispositivo.
intro: 'Una web que se instala como app en el móvil y funciona sin conexión. Te dice cuánto te queda de verdad hasta el próximo cobro. Sin servidor, sin cuentas, sin telemetría.'
kind: hybrid
status: published
tier: lab
order: 4
repo: https://github.com/alvarotorresc/basecero
url: https://basecero.alvarotc.com
license: MIT
platform: 'Navegador, en escritorio y móvil'
stack: [JavaScript, SQLite (WebAssembly), PWA]
githubRepo: alvarotorresc/basecero
icon: '../../../assets/projects/basecero/icon.png'
cover: '../../../assets/projects/basecero/cover-es.png'
coverMobile: '../../../assets/projects/basecero/cover-mobile-es.png'
promo: '../../../assets/projects/basecero/promo-es.png'
playground: { kind: pwa, src: 'https://basecero.alvarotc.com/app/' }
facts:
  - { label: 'Se instala como app', value: 'PWA, sin conexión' }
  - { label: 'Datos', value: 'En tu dispositivo, sin servidor' }
  - { label: 'Temas', value: 'Claro y oscuro' }
screenshotsIntro: 'Cada categoría tiene su color y lo lleva por toda la app. Fondo aluminio en claro, grafito en oscuro.'
screenshots:
  - src: '../../../assets/projects/basecero/01-inicio-es.png'
    alt: 'Pantalla de Inicio de BaseCero en tema claro: hoy puedes gastar 40,78 €, quedan 530,17 € de 2.000,00 € en el periodo de septiembre, saldo de la cuenta corriente, lo que Marta te debe, el gasto de la semana y un 30 % de ahorro'
    caption: 'Inicio'
  - src: '../../../assets/projects/basecero/02-registro-es.png'
    alt: 'Registro de un gasto de 3,40 € en Restauración › Bares y cafés, con la rejilla de categorías por colores y el aviso de lo que queda del límite de Restauración'
    caption: 'Registrar'
  - src: '../../../assets/projects/basecero/03-movimientos-es.png'
    alt: 'Movimientos de septiembre en tema oscuro: 1.469,83 € gastados de 2.000,00 €, buscador, filtros por categoría y la lista agrupada por día'
    caption: 'Movimientos'
  - src: '../../../assets/projects/basecero/04-gasto-categoria-es.png'
    alt: 'Gasto por categoría de septiembre: cada categoría con su color, su barra y su límite; Casa y Coche avisan de que llevan más del 95 % del límite'
    caption: 'Gasto por categoría'
  - src: '../../../assets/projects/basecero/05-patrimonio-es.png'
    alt: 'Patrimonio en tema oscuro: 3.906,36 € netos, 606,17 € más este periodo, lo que tienes frente a lo que debes y las cuentas corriente, de ahorro y la hucha de vacaciones'
    caption: 'Patrimonio'
  - src: '../../../assets/projects/basecero/06-informe-es.png'
    alt: 'Informe del periodo: ahorras el 30 % de lo que ingresas, 2.100,00 € ingresados frente a 1.469,83 € gastados, la comparación con agosto y el botón para descargar el PDF'
    caption: 'Informe'
featuresIntro: 'Cuentas que siguen tu nómina, no el calendario.'
features:
  - title: 'De nómina a nómina'
    text: 'Los periodos van de una nómina a la siguiente, no del 1 al 30. Con los recurrentes, ves el disponible real hasta el próximo cobro.'
  - title: 'Registrar rápido'
    text: 'El importe con el teclado del móvil y la categoría en una rejilla de colores. O escribes «12,50 en el bar con Marta» y la app saca el importe, el comercio y con quién lo compartes.'
  - title: 'Gastos compartidos'
    text: 'En las dos direcciones: lo que debes y lo que te deben. Liquidar enseña el neto y lo cierra de golpe.'
  - title: 'Patrimonio'
    text: 'El neto, tus cuentas, los pasivos y los objetivos de ahorro, en una sola vista.'
    image: '../../../assets/projects/basecero/05-patrimonio-es.png'
  - title: 'Categorías con límites'
    text: '41 categorías en dos niveles, todas editables, cada una con su color, y el gasto de cada una frente a su límite.'
  - title: 'Informe en PDF'
    text: 'Ingresado, gastado y ahorrado frente al periodo anterior. El PDF se genera en tu móvil.'
  - title: 'Importa el CSV del banco'
    text: 'El de N26 se reconoce solo; para el resto, un asistente pregunta qué es cada columna.'
  - title: 'Claro, oscuro y dos idiomas'
    text: 'Eliges tema o sigues al sistema. En español e inglés, con la moneda y el formato que elijas.'
illustration: '../../../assets/projects/basecero/icon.png'
built:
  - 'JavaScript sin framework ni bundler. SQLite en WebAssembly, sin servidor.'
  - 'Local-first: todos los datos viven en tu dispositivo.'
  - 'PWA instalable, funciona sin conexión.'
  - 'Sin cuentas y sin telemetría. El dictado es opcional y lo hace el navegador; escrito, todo se queda en el móvil.'
  - 'Exporta a una hoja .xlsx que es tuya, y copias cifradas con contraseña.'
  - 'Más de 1500 tests con el runner nativo de Node.'
  - 'Software libre bajo MIT, código en [github.com/alvarotorresc/basecero](https://github.com/alvarotorresc/basecero).'
changelog:
  - {
      version: 'v1.1.0',
      date: 2026-09-30,
      note: 'Rediseño entero con tema claro y oscuro; inicio con el saldo primero y día de cobro; registro por frase, voz o foto del ticket; informe en PDF; radar de suscripciones; filtros múltiples y revisión del extracto antes de importarlo.',
    }
  - {
      version: 'v1.0.0',
      date: 2026-09-02,
      note: 'La primera versión para compartir. BaseCero ya se instala desde el navegador de cualquiera y funciona sin conexión, sin cuentas y sin nube.',
    }
---

Probé unas cuantas apps de finanzas y casi todas fallaban en lo mismo: eran gratis porque el negocio eran tus datos, de pago pero con tus cuentas en su nube, o locales pero cerradas. No encontré ninguna que fuera a la vez sin servidor, sin cuenta, offline de verdad y con el código a la vista.

Así que la hice. Es para quien lleva sus gastos a mano y quiere seguir siendo dueño de sus datos: si mañana BaseCero desapareciera, tus cuentas seguirían siendo tuyas, en una hoja de cálculo que abres con cualquier programa.

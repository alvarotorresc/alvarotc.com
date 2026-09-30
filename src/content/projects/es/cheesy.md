---
name: Cheesy
tagline: 'Aperturas, finales y táctica, en tu navegador.'
intro: 'Juegas aperturas y finales contra el ordenador, buscas la jugada en posiciones tácticas y analizas con motor. Sin cuenta, sin instalar nada y sin anuncios: tu progreso se queda en tu navegador.'
kind: web
status: published
tier: lab
order: 8
repo: https://github.com/alvarotorresc/cheesy
url: https://cheesy.alvarotc.com
license: GPL-3.0
stack: [Angular, TypeScript, Stockfish]
githubRepo: alvarotorresc/cheesy
icon: '../../../assets/projects/cheesy/icon.png'
cover: '../../../assets/projects/cheesy/cover-es.png'
coverMobile: '../../../assets/projects/cheesy/cover-mobile-es.png'
promo: '../../../assets/projects/cheesy/promo-es.png'
facts:
  - { label: 'Contenido', value: '21 aperturas, 14 finales y 13 posiciones' }
  - { label: 'Idiomas', value: 'Español e inglés' }
  - { label: 'Cuentas', value: 'Sin cuentas; el progreso, en tu navegador' }
  - { label: 'Motor', value: 'Stockfish 19, en el navegador' }
screenshotsIntro: 'Las cuatro secciones, en tema claro y en oscuro.'
screenshots:
  - src: '../../../assets/projects/cheesy/screen-01-aperturas-es.png'
    alt: 'El catálogo de aperturas: los filtros por primera jugada, familia, bando y progreso, y la fila «1.e4 e5: juegos abiertos» con cuatro aperturas, cada una con su minitablero, su progreso y los botones «Jugar» y «Practicar».'
    caption: 'Las 21 aperturas, con filtros'
  - src: '../../../assets/projects/cheesy/screen-02-jugar-es.png'
    alt: 'Una partida de la Apertura Española con blancas, en el tema oscuro: el tablero tras 5…Ae7, el aviso «Te toca mover», el panel de teoría con la Variante Cerrada y la nota «Estás dentro de nuestras líneas», y la lista de jugadas.'
    caption: 'Una apertura, con su teoría'
  - src: '../../../assets/projects/cheesy/screen-03-practicar-es.png'
    alt: 'La práctica de la línea principal de la Siciliana Najdorf con negras: el tablero visto desde las negras tras 6.Ag5, el avance «Jugada 6 de 13», el contador de fallos en esta jugada a 0 de 3 y la lista de jugadas.'
    caption: 'Una línea, jugada de memoria'
  - src: '../../../assets/projects/cheesy/screen-05-final-es.png'
    alt: 'La Posición de Lucena, a ganar con blancas: el tablero, la lista de objetivos con «La victoria sigue en juego» y el panel de la tablebase abierto, con el resultado teórico «Ganas», «Das mate en 17» y el botón «Ver pista».'
    caption: 'Un final contra la tablebase'
  - src: '../../../assets/projects/cheesy/screen-07-posicion-es.png'
    alt: 'Un ejercicio táctico sin resolver: el tablero, la indicación «Juegan negras · 1 jugada tuya», la instrucción «Encuentra la jugada ganadora» y los botones «Pista» y «Ver solución».'
    caption: 'Una posición por resolver'
  - src: '../../../assets/projects/cheesy/screen-08-analisis-es.png'
    alt: 'El tablero de análisis en el tema oscuro con una partida de la Apertura Española: el motor encendido a profundidad 20, la barra de evaluación, las tres mejores líneas, una flecha verde con la mejor jugada y la lista de jugadas con una variación plegada.'
    caption: 'Análisis con motor y variaciones'
featuresIntro: 'Cuatro secciones, y lo que comparten.'
featureBlockLimit: 4
features:
  - title: 'Aperturas para jugar y para practicar'
    text: 'En Jugar, el rival responde con las líneas cubiertas o es Stockfish en cinco niveles; un panel de teoría nombra la variante y avisa cuando te sales. En Practicar solo vale la jugada de la línea, que queda dominada tras tres pasadas seguidas sin fallos.'
    image: '../../../assets/projects/cheesy/screen-02-jugar-es.png'
  - title: 'Finales contra un rival perfecto'
    text: 'Ganas los finales ganados y aguantas quince jugadas los de tablas. El rival juega con la tablebase de Lichess y un panel da el veredicto teórico de la posición.'
    image: '../../../assets/projects/cheesy/screen-04-finales-es.png'
  - title: 'Posiciones que no se delatan'
    text: 'Buscas la jugada ganadora. El nombre y el tema de cada posición no se ven hasta que la resuelves, para que no te digan qué buscar.'
    image: '../../../assets/projects/cheesy/screen-06-posiciones-es.png'
  - title: 'Análisis con variaciones y motor'
    text: 'Un tablero libre, con las jugadas en un árbol con variaciones. El motor es opcional: barra de evaluación, tres mejores líneas y flecha. Importa FEN y PGN y da enlaces para compartir.'
    image: '../../../assets/projects/cheesy/screen-08-analisis-es.png'
  - title: 'Sin cuenta y en tu navegador'
    text: 'No hay cuentas, servidor propio ni anuncios. El progreso se guarda en tu navegador y las visitas se cuentan con Umami, sin cookies.'
  - title: 'Contenido comprobado por máquina'
    text: 'Antes de publicarse, todo pasa una validación automática: jugadas legales con chessops, comprobaciones con Stockfish y los finales contra la tablebase de Lichess.'
  - title: 'Español e inglés, claro y oscuro'
    text: 'La interfaz está en los dos idiomas y el tema sigue al del sistema.'
  - title: 'Software libre'
    text: 'Bajo GPL-3.0, con el código en GitHub.'
illustration: '../../../assets/projects/cheesy/icon.png'
built:
  - 'Angular 22 y TypeScript. El tablero es chessground y las reglas, chessops.'
  - 'Stockfish 19, versión lite de un solo hilo, en un Web Worker del navegador.'
  - 'En los finales, la posición se consulta en la tablebase de Lichess.'
  - 'El progreso se guarda en IndexedDB, en tu navegador. Sin backend.'
  - 'Unos 1560 tests de la app y 225 del contenido.'
  - 'Alojada en Netlify. Las visitas se cuentan con un Umami propio, sin cookies.'
  - 'Software libre bajo GPL-3.0, código en [github.com/alvarotorresc/cheesy](https://github.com/alvarotorresc/cheesy).'
changelog:
  - version: 'v0.1.0'
    date: 2026-09-30
    note: 'La primera versión: 21 aperturas para jugar y practicar, 14 finales contra la tablebase de Lichess, 13 posiciones tácticas y un tablero de análisis con motor, en español e inglés.'
---

Juego al ajedrez cada semana con mi hermano y quería un solo sitio donde practicar aperturas, finales y táctica contra el ordenador, sin crear una cuenta.

También quería un tablero que no te bloquee: salvo en Practicar, que es estricto a propósito, puedes hacer cualquier jugada legal y la app responde a lo que has jugado.

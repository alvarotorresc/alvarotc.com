# Imágenes y vídeos de los proyectos: qué pide cada destino

Brief para generar el material gráfico de los proyectos de una sola vez y servir dos destinos: las
fichas de alvarotc.com y las fichas de Google Play. Los dos usan las mismas capturas, pero con
recortes y resoluciones distintas. La regla es generar todo en alta resolución y recortar desde ahí.

Fecha: 2026-09-25. Esquema de referencia: `src/content.config.ts` (`projectSchema`). Assets en
`src/assets/projects/<slug>/`. Frontmatter en `src/content/projects/{en,es}/<slug>.md`.

---

## 1. Principios comunes

- **Capturas limpias.** Sin texto superpuesto, sin marco de dispositivo, sin barra de estado
  inventada. La web pinta sus propios marcos (móvil, navegador, terminal). Las versiones
  "decoradas" con titular solo se hacen para la store.
- **Tema oscuro por defecto** en todas las capturas; una variante clara de la pantalla principal
  para la galería si la app tiene tema claro.
- **Idiomas.** La web es bilingüe: si la app tiene interfaz en español e inglés, dos juegos de
  capturas (`-es` y `-en`, como ya hace BaseCero). Si solo tiene uno, un juego vale para ambas
  fichas.
- **Datos realistas y no personales.** Nombres y cifras de demo creíbles, nunca datos reales de
  nadie. Sin lorem ipsum.
- **Formatos de entrega.** PNG para lo que tenga texto o bordes nítidos; JPEG calidad 85 para
  fotografías. La web convierte todo a webp en el build; la store no acepta webp.
- **Todo se ve a tamaño completo.** En la ficha, cada captura, imagen de característica y
  miniatura de herramienta se abre en un visor a pantalla completa (hasta 1600 px de ancho). Nada
  de texto ilegible: lo que se lea mal ampliado no vale.
- **Nombres de fichero.** Minúsculas, sin espacios ni tildes, con sufijo de idioma si aplica:
  `icon.png`, `promo.png`, `cover.png`, `cover-mobile.png`, `shot-01-calendario.png`,
  `feat-recordatorios.png`, `illustration.png`.

## 2. Lo que consume alvarotc.com

Cada campo del frontmatter, dónde se ve y qué medida debe tener el fichero fuente.

| Campo                              | Dónde se ve                                                         | Ratio                   | Tamaño fuente mínimo  | Notas                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------- | ----------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`                             | Cabecera de la ficha (56 o 72 px) e `illustration` del "Por qué"    | 1:1                     | 512×512 PNG           | Sin esquinas redondeadas ni sombra: la web las pone. Fondo sólido, no transparente.                                                                   |
| `promo`                            | Tarjeta de la home y del listado (`ProjectCard`, 640 px de ancho)   | 16:9                    | 1920×1080 PNG         | Composición de marketing: móvil o pantalla sobre fondo de color. Si falta, se usa `cover`. Si es vertical se muestra entera sobre fondo gris; evitar. |
| `cover` en `kind: mobile`          | Marco de móvil grande (`DeviceFrame hero`, 390×800)                 | 9:19.5                  | 1080×2340 PNG         | Captura de pantalla nativa del móvil, sin barra de estado ni de navegación.                                                                           |
| `cover` en `kind: web`             | Marco de navegador (`BrowserFrame hero`, 16:10)                     | 16:10                   | 1600×1000 PNG         | Captura de la app a 1600 px de ancho, sin el chrome del navegador.                                                                                    |
| `cover` en `kind: hybrid`          | Navegador estrecho (520 px) al lado de un móvil pequeño             | 16:10                   | 1600×1000 PNG         | Igual que web; el móvil va en `coverMobile`.                                                                                                          |
| `coverMobile`                      | Móvil pequeño de las fichas híbridas (`DeviceFrame small`, 200×420) | 9:19.5                  | 1080×2340 PNG         | Misma pantalla que `cover` pero en el layout móvil.                                                                                                   |
| `screenshots[].src`                | Galería con pie (`ProjectScreens`)                                  | 9:19.5 apps, 16:10 web  | 1080×2340 o 1600×1000 | De 4 a 6. Cada una lleva `alt` y `caption` en ambos idiomas.                                                                                          |
| `features[].image`                 | Miniatura junto a cada característica                               | 100:217 apps, 16:10 web | 1080×2340 o 1600×1000 | Opcional. Vale la misma captura de la galería recortada.                                                                                              |
| `tools[].image`                    | Tarjeta de cada herramienta (`ProjectTools`, 480 px)                | 16:10                   | 1600×1000 PNG         | Opcional. Se abre en el visor; sin imagen, la tarjeta muestra el nombre en mono.                                                                      |
| `illustration`                     | Columna del "Por qué" (320 px)                                      | 1:1 o libre             | 800 px de lado        | Hoy los proyectos usan el icono; puede ser un detalle de pantalla o una ilustración.                                                                  |
| `playground.src` con `kind: video` | Reproductor embebido en la ficha                                    | 16:9                    | No es un fichero      | URL embebible (YouTube o PeerTube). Con `kind: pwa` o `iframe` se embebe la app en vivo.                                                              |

Los `kind: cli` (create-astro-blog) no llevan imágenes: la ficha usa el campo `terminal`.

## 3. Lo que pide Google Play

Ficha de Play Console → Presencia en la tienda → Ficha principal. Cifras oficiales:

| Recurso                                | Obligatorio  | Formato                     | Medida                                      | Notas                                                                                                                                                     |
| -------------------------------------- | ------------ | --------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icono de la app                        | Sí           | PNG 32 bits                 | 512×512, ≤ 1 MB                             | Play recorta las esquinas él mismo. Es el mismo fichero que `icon` de la web.                                                                             |
| Gráfico de funciones (feature graphic) | Sí           | JPEG o PNG 24 bits sin alfa | 1024×500                                    | Ratio 2,05:1. No es el `promo` 16:9: pedir la misma composición con márgenes para poder recortar ambos. Sin texto pequeño; se usa como portada del vídeo. |
| Capturas de móvil                      | Sí, de 2 a 8 | JPEG o PNG 24 bits sin alfa | Lado entre 320 y 3840 px, ratio 16:9 o 9:16 | El lado largo no puede superar el doble del corto: 1080×2340 (9:19.5) **no vale**, hay que recortar a 1080×1920. Aquí sí se admite titular superpuesto.   |
| Capturas tablet 7"                     | No           | Igual                       | 320 a 3840 px, 16:9 o 16:10                 | Solo si la app tiene layout de tablet.                                                                                                                    |
| Capturas tablet 10"                    | No           | Igual                       | 1080 a 7680 px                              | Ídem.                                                                                                                                                     |
| Vídeo promocional                      | No           | URL de YouTube              | 16:9, público o no listado                  | Sin anuncios, sin restricción de edad, no una lista. Entre 30 s y 2 min.                                                                                  |

Aviso: Play rechaza la ficha si las capturas "no representan la app" (composiciones puramente
publicitarias sin pantalla real) o si hay texto ilegible. Lo seguro es captura real ocupando al
menos dos tercios del lienzo y un titular corto arriba.

## 4. Qué pedir, por proyecto

Estado actual de cada carpeta en `src/assets/projects/` y lo que falta.

Quedamos y PokeUtils tienen su spec en su propio repo
(`docs/superpowers/specs/2026-09-26-media-web-design.md` en cada uno). Lo decidido: capturas con
Playwright, galería mitad en tema oscuro y mitad en claro, vídeo de Quedamos de 29 s en MP4 nativo
servido desde esta web, y PokeUtils sin vídeo y con 16 capturas de herramientas (`tools[].image`).

### Bito (`kind: mobile`, Android 10+, en publicación)

Tiene: icono 256, portada 400×844, promo 1280×720, seis capturas JPEG de baja calidad (4 a 10 KB).
Falta todo en calidad final.

- `icon.png` 1024×1024 (fondo sólido).
- `cover.png` 1080×2340: pantalla principal.
- `promo.png` 1920×1080 y `feature-graphic.png` 1024×500 de la misma composición.
- Capturas 1080×2340: hábitos, recordatorio, estadísticas, widget, insignias, revisión. Las
  mismas recortadas a 1080×1920 con titular para Play.
- `illustration.png`: hoy usa `habi.jpg`; pedir la mascota a 800×800 con fondo transparente o
  sólido.
- Vídeo 1080p 16:9 de 45 a 60 s: crear hábito, marcar el día, ver racha, widget.

### Huellas (`kind: hybrid`, en diseño)

Sin assets. No publicar imágenes hasta tener pantallas reales; mientras tanto solo `icon.png`
1024×1024 y, si hay maquetas de diseño, `promo.png` 1920×1080 marcada como maqueta. Nada para
Play todavía.

### BaseCero (`kind: hybrid`, PWA, publicado)

Tiene: icono 512, portada 1600×900 PNG, ocho capturas webp en dos idiomas. Solo falta:

- `cover.png` recortada a 16:10 (1600×1000) en vez de 16:9, y `promo.png` 1920×1080 aparte con
  composición de marketing (hoy `promo` reutiliza `cover`).
- Capturas móvil 1080×2340 en ambos idiomas para `coverMobile` y la galería.
- No está en Play: sin feature graphic ni capturas de store.

### DevTools (`kind: web`, publicado)

Sin assets. Pedir `icon.png` 1024×1024, `cover.png` 1600×1000 y cuatro capturas 1600×1000 de las
herramientas más usadas. No está en Play.

### create-astro-blog (`kind: cli`)

Sin imágenes. Opcional: un GIF o vídeo corto de la terminal para `playground` (URL).

## 5. Cómo entregar

1. Una carpeta por proyecto con los ficheros nombrados como en la sección 1, en PNG o JPEG a la
   resolución fuente. Nada de webp: la web los convierte en el build.
2. Copiar a `src/assets/projects/<slug>/` y referenciar desde el frontmatter de los dos idiomas
   con rutas relativas `'../../../assets/projects/<slug>/<fichero>'`.
3. Rellenar `alt` y `caption` de cada captura en español y en inglés. El `alt` describe lo que se
   ve; el `caption` es el nombre de la pantalla.
4. Para Play, una subcarpeta `store/` aparte con icono 512, feature graphic 1024×500 y capturas
   1080×1920. No se sube al repo de la web.
5. Vídeo: subir a YouTube como no listado, pegar la URL en `playground: { kind: video, src }` y
   en la ficha de Play. Miniatura del vídeo: el feature graphic.
6. Comprobar con `npm run build` que no queda ningún asset por encima de 400 KB en `dist/_astro`
   y que las tarjetas de la home no muestran imágenes verticales en `promo`.

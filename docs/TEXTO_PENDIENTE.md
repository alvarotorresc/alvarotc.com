# Texto pendiente: lo que tienes que escribir o revisar

Fecha: 2026-09-30 · Rama: `redesign/cv-web`

Cada pieza existe en español y en inglés. Lo que cambies en `es` hay que replicarlo en `en`.
Para ver las páginas: `npx astro dev` y abre `http://localhost:4321`.
Para comprobar que no queda ningún hueco: `RELEASE_CHECK=1 npx vitest run`.

---

## A. Por escribir (bloquea el lanzamiento)

### A1. Sobre mí

Ficheros: `src/content/about/es.md` y `src/content/about/en.md` · Página: `/es/about/` y `/about/`

Son 25 huecos `[DATO]` por idioma.

**2018 · Desarrollo de Aplicaciones Web**

- [x] Ficha: `os`
- [x] Ficha: `stack`

**2020 · Z1 Digital Studio**

- [x] Ficha: `place`
- [x] Ficha: `os`

**2022 · Therapyside**

- [x] Ficha: `place`
- [x] Ficha: `os`

**2025 · Soltel**

- [x] Ficha: `place`
- [x] Ficha: `os`

**2026 · Mis propias cosas**

- [x] Ficha: `os`
- [x] Ficha: `stack`

**Principios · Por qué lo publico todo libre**

- [x] Frase «Autoalojo [DATO].» (qué autoalojas)
- [x] Pie de foto «[DATO] · desde [DATO]» (dos huecos)
- [x] Ficha: `year`
- [x] Ficha: `os`
- [x] Ficha: `stack`

**Gatos, y por qué soy vegano**

- [x] Párrafo 1: «Soy vegano y me importan los animales. [DATO]»
- [x] Párrafo 2: «Colaboro con refugios de gatos en Sevilla desde 2024 ([DATO])»

**Guitarra eléctrica**

- [x] Ficha: `year`
- [x] Ficha: `os`

**Ajedrez**

- [x] Frase «Siempre listo para una partida: [DATO].» (tu usuario de Lichess)
- [x] Pie de foto «Lichess · [DATO]»
- [x] Ficha: `year`
- [x] Ficha: `os`

**Boxeo**

- [x] Ficha: `year`

**Fotos y sus textos alternativos**

Las diez fotos de `src/assets/about/` son de relleno. Hacen falta fotos reales en 4:5 y reescribir
cada `photoAlt`, que hoy dice «Placeholder: …».

- [ ] `ies-2018.jpg` y su texto alternativo
- [ ] `z1-2020.jpg` y su texto alternativo
- [ ] `therapyside-2022.jpg` y su texto alternativo
- [ ] `soltel-2025.jpg` y su texto alternativo
- [ ] `desk-2026.jpg` y su texto alternativo
- [ ] `linux.jpg` y su texto alternativo
- [ ] `cats.jpg` y su texto alternativo
- [ ] `guitar.jpg` y su texto alternativo
- [ ] `chess.jpg` y su texto alternativo
- [ ] `boxing.jpg` y su texto alternativo

- [x] Todo lo anterior replicado en `en.md`

### A2. Quedamos

Ficheros: `src/content/projects/{es,en}/quedamos.md` · Página: `/es/projects/quedamos/`

- [x] «Por qué existe»: solo está la primera frase; falta el resto (línea 124)
- [x] Lo mismo en inglés

### A3. Huellas

Ficheros: `src/content/projects/{es,en}/huellas.md` · Página: `/es/projects/huellas/`

- [x] Último punto de «Cómo está hecho» (línea 42)
- [x] «Por qué existe»: está en tercera persona («una experiencia concreta de su creador»);
      reescribirlo en tu voz
- [x] Lo mismo en inglés

### A4. create-astro-blog (no bloquea: está con `visible: false`)

Ficheros: `src/content/projects/{es,en}/create-astro-blog.md`

- [ ] «Por qué existe», primer párrafo
- [ ] «Por qué existe», segundo párrafo
- [ ] Nota de la versión v1.0.0 en el changelog
- [ ] Lo mismo en inglés
- [ ] Quitar `visible: false` cuando esté completo

---

## B. Por revisar (texto ya escrito)

### B1. Home

Página: `/es/` y `/` · Textos de interfaz en `src/i18n/translations.ts`

- [x] Hero (`hero.intro`): «Software Engineer. Construyo software robusto y escalable. Firme
      defensor del software libre y la privacidad. También me gusta escribir sobre ello.»
- [x] Descripción del sitio en `site.config.ts` (SEO, RSS, OG): «Desarrollador backend. Apps
      offline-first, infraestructura autoalojada, software libre.» No coincide con el «Software
      Engineer» del hero: decidir cuál
- [x] Los dos párrafos de «Sobre mí» en la home (fijos en `src/components/home/About.astro`)
- [x] «Lo que me importa»: las cuatro tarjetas de valores (arriba de `about/es.md`)
- [x] Etiquetas de Sobre mí (`about.tag.*`): en español una dice «Seguridad» y en inglés
      «Offline-first»; igualarlas
- [x] Proyectos (`projects.statusText`): «Todas las apps y servicios se vigilan las 24 horas.»
- [x] Fuera del teclado: `src/content/interests/guitar.yaml`
- [x] Fuera del teclado: `src/content/interests/chess.yaml`
- [x] Fuera del teclado: `src/content/interests/boxing.yaml`
- [x] Fuera del teclado: `src/content/interests/vegan.yaml`
- [x] Ahora (`src/content/now/now.yaml`): 7 libros
- [x] Ahora: 6 canciones
- [x] Ahora: 14 herramientas
- [x] Ahora: «construyendo: Huellas»
- [x] Contacto (`contact.open`): «Abierto a roles backend y full-stack»
- [x] Contacto (`contact.responseValue`): «Suelo responder en dos días»
- [x] Contacto (`contact.note`): «Enviado por un servicio propio, sin rastreo.»
- [x] Contacto: mensajes de error del formulario (`contact.error.*`)
- [x] Pie (`footer.privacy`): «Sin cookies ni rastreadores. Analítica autoalojada con Umami.
      Código bajo MIT.»

### B2. Experiencia

Ficheros: `src/content/experience/*.yaml` · Se ve en la home y en el CV

En cada uno: fechas, ubicación, resumen, logros y stack, en los dos idiomas.

- [x] `2018-daw.yaml` (IES Velázquez, freeCodeCamp, Codefest de Everis)
- [x] `2020-z1.yaml` (Z1 Digital Studio, sep 2020 a jun 2022, Sevilla híbrido)
- [x] `2022-therapyside.yaml` (Therapyside, jul 2022 a dic 2024, Madrid remoto)
- [x] `2025-soltel.yaml` (Soltel, desde ene 2025, Sevilla remoto)

### B3. Sobre mí (lo ya escrito)

- [x] Título e introducción de la página
- [x] 2018: párrafo del ciclo, freeCodeCamp y Codefest
- [x] Z1: «clientes de Estados Unidos y Canadá en energía, seguridad y redes sociales»
- [x] Therapyside: «más de cinco mil usuarios activos al día», migración de Python 2.7 a 3.7
- [x] Soltel: microservicios y el sistema de baremación con Drools
- [x] Mis propias cosas: los dos párrafos. Nombra Bito, Quedamos, BaseCero y Huellas; decidir si
      entra Cheesy
- [x] Ajedrez: decidir si la frase enlaza a Cheesy
- [x] Principios: «Llevo más de cinco años haciéndolo en producción»
- [ ] Gatos: «desde 2024»
- [x] Guitarra, ajedrez y boxeo: una frase cada uno

### B4. Fichas de proyecto

Ficheros: `src/content/projects/{es,en}/` · En cada una: tagline, intro, datos, funciones, «Cómo
está hecho», changelog y «Por qué existe».

- [x] Bito (`/es/projects/bito/`)
- [x] Bito en inglés
- [x] Quedamos (`/es/projects/quedamos/`): las notas de v0.2.2 a v0.3.1 salen del historial del repo
- [x] Quedamos en inglés
- [x] BaseCero (`/es/projects/basecero/`): «Por qué existe» son dos líneas sueltas; ampliarlo
- [x] BaseCero en inglés
- [x] PokeUtils (`/es/projects/pokeutils/`): «Por qué existe» repite la intro
- [x] PokeUtils en inglés
- [x] DevTools (`/es/projects/devtools/`): 52 herramientas con su descripción
- [x] DevTools en inglés
- [x] Huellas (`/es/projects/huellas/`): «Definición aprobada, sin código», «12 documentos», lista
      del MVP
- [x] Huellas en inglés
- [x] Cheesy (`/es/projects/cheesy/`, añadido el 30 sep): «Por qué existe», datos («21
      aperturas, 14 finales y 13 posiciones»), «Unos 1560 tests de la app y 225 del contenido»
- [x] Cheesy en inglés

### B5. Blog

Ficheros: `src/content/posts/` (español) y `src/content/posts-en/` (inglés, traducido con DeepL)

- [x] «Nueva web, nuevo rumbo» (16 feb): describe la web anterior (índigo eléctrico, Framer
      Motion, tres secciones). Decidir: actualizarlo, añadir una nota o dejarlo como histórico
- [x] «New website, new direction» (inglés)
- [ ] «VPS con observabilidad completa» (26 mar)
- [x] «How I set up my VPS with full observability for less than $5/month» (inglés)
- [ ] «De una idea a una APK en 24h» (14 ago)
- [x] «From an idea to an APK in 24 hours» (inglés)
- [ ] «FreshRSS en VPS con Docker y Caddy» (2 sep)
- [x] «Set up a service on your VPS today and move it to your home lab tomorrow» (inglés)
- [ ] «BaseCero: tu dinero no vive en el servidor de nadie» (7 sep)
- [x] «BaseCero: your money doesn't have to sit on someone else's server» (inglés)

### B6. Páginas legales

**Aviso legal** · `src/pages/es/legal.astro` y `src/pages/legal.astro`

- [x] Titular: persona física, sin actividad comercial, sin NIF ni dirección postal
- [x] Propiedad intelectual: textos e imágenes con todos los derechos reservados
- [x] Código bajo MIT
- [x] Enlaces externos y ley española
- [x] Versión en inglés

**Privacidad** · `src/pages/es/privacy.astro` y `src/pages/privacy.astro`

Confirma que cada afirmación es cierta.

- [x] El servicio de contacto está en Hetzner (Alemania)
- [x] El buzón está en Proton Mail
- [x] «Guardo la conversación mientras dure y la borro después»
- [x] El servicio solo registra fecha, resultado y un hash de la IP
- [x] Umami autoalojado, sin cookies y con la IP anonimizada
- [x] Vercel guarda registros técnicos de acceso
- [x] Derechos RGPD y reclamación ante la AEPD
- [x] Versión en inglés

### B7. CV

Página: `/es/cv/` y `/cv/` · Se genera de Experiencia y Proyectos

- [ ] Idiomas (`cv.languagesValue`): «Español nativo, inglés B2 (Trinity College London)»
- [ ] Ubicación (`cv.location`): «España, remoto» en español y «Spain, remote friendly» en
      inglés; igualarlas
- [ ] Subtítulo (`cv.subtitle`) y texto del blog (`cv.writingText`)
- [ ] Imprimirlo a PDF y leerlo entero en los dos idiomas

### B8. Menores

- [ ] 404 (`error.text`): «Esta página no existe o se ha movido a otro sitio.»
- [ ] Stats (`/es/stats/`, fuera del menú): subtítulo y frases que acompañan a las cifras
      (`stats.*`)
- [ ] Enlaces sociales en `site.config.ts`: GitHub `alvarotorresc`, LinkedIn
      `alvaro-torres-carrasco`, X `torresc_alvaro`, dev.to `alvarotorresc`

---

## C. Documentación interna (no se publica)

**`docs/CONTINUIDAD.md`**

- [ ] Gestor de contraseñas y quién más tiene acceso
- [ ] Renovación automática y tarjeta válida en Cloudflare Registrar (el dominio caduca el
      2027-04-25)
- [ ] Renovaciones de Cloudflare, Hetzner, Proton y DeepL

**`RUNBOOK.md`**

- [ ] Protección de despliegues de Vercel: decidir si se activa (línea 76)
- [ ] Ruta del compose de Caddy en el VPS (línea 81)
- [ ] Ruta del compose de Umami en el VPS (línea 88)

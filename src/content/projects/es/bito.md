---
name: Bito
tagline: 'Registra un hábito en un toque, sin cuentas ni nube.'
intro: 'La app de hábitos que no te roba tiempo. Vive entera en tu móvil: sin cuentas, sin nube y sin una sola línea que salga a internet.'
kind: mobile
applicationCategory: LifestyleApplication
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0-or-later
platform: Android 8.0+
stack: [Kotlin, Jetpack Compose, Room]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.png'
cover: '../../../assets/projects/bito/cover-es.png'
promo: '../../../assets/projects/bito/promo-es.png'
playground: { kind: file, src: '/video/bito-promo-es.mp4' }
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.3.0/app-release.apk
  label: '6,4 MB'
facts:
  - label: 'Tamaño del APK'
    value: '6,4 MB'
    mono: true
  - label: 'Permisos de Android'
    value: '4 propios, ninguno es internet'
  - label: 'Dependencias de Google'
    value: '0'
    mono: true
screenshotsIntro: 'La 1.3.0 en Android, con los datos de una usuaria de demostración.'
screenshots:
  - src: '../../../assets/projects/bito/shot-01-habitos-es.png'
    alt: 'Detalle del hábito Beber agua, con una racha de 130 días'
    caption: 'Detalle del hábito'
  - src: '../../../assets/projects/bito/shot-02-recordatorio-es.png'
    alt: 'Persiana de notificaciones con un recordatorio de Bito y su botón para registrar sin abrir la app'
    caption: 'Recordatorio'
  - src: '../../../assets/projects/bito/shot-03-estadisticas-es.png'
    alt: 'Estadísticas con los días perfectos del año y la semana de cada hábito'
    caption: 'Estadísticas'
  - src: '../../../assets/projects/bito/shot-04-widget-es.png'
    alt: 'Widget de Bito en la pantalla de inicio con los hábitos de hoy'
    caption: 'Widget'
  - src: '../../../assets/projects/bito/shot-05-insignias-es.png'
    alt: 'Pantalla de logros con los ganados, entre ellos la Semana redonda'
    caption: 'Logros'
  - src: '../../../assets/projects/bito/shot-06-revision-es.png'
    alt: 'Repaso del día con los hábitos pendientes y el botón Sellar el día'
    caption: 'Repaso del día'
featuresIntro: 'Tres maneras de registrar un hábito, tareas con un temporizador para empezarlas y un rato para respirar con Habi.'
featureBlockLimit: 5
features:
  - title: 'Desde la pantalla de inicio'
    text: 'El widget enseña lo de hoy y se registra con un toque, sin entrar en ninguna parte. Y si solo te importa un hábito, hay un widget pequeño para él solo.'
    image: '../../../assets/projects/bito/shot-04-widget-es.png'
  - title: 'Desde la notificación'
    text: 'El recordatorio llega con el botón puesto. Lo pulsas y queda apuntado sin desbloquear nada más.'
    image: '../../../assets/projects/bito/shot-02-recordatorio-es.png'
  - title: 'En el repaso de la noche'
    text: 'Una pantalla al final del día para cerrar lo que quedó suelto. Sellas el día y se acabó.'
    image: '../../../assets/projects/bito/shot-06-revision-es.png'
  - title: 'Tareas con plazo y foco'
    text: 'La llamada, el papeleo, el correo. Cada tarea con su plazo, un primer paso si te ayuda a arrancar y un temporizador de 5, 10 o 25 minutos con Habi al lado.'
    image: '../../../assets/projects/bito/feat-tareas-es.png'
  - title: 'Respirar con Habi'
    text: 'Unos dos minutos siguiendo su respiración cuando el día se te echa encima. Tres modos y nada más que elegir. No da puntos ni cuenta para rachas.'
    image: '../../../assets/projects/bito/feat-respiracion-es.png'
  - title: 'Copias de seguridad que son tuyas'
    text: 'Cada copia lleva todo y va a la carpeta que tú elijas. En claro es un JSON que abres con el bloc de notas; con contraseña, no la abre nadie, ni siquiera Bito.'
  - title: 'Rachas que no te castigan'
    text: 'Fallar un día no borra un mes. Hay congeladores para los días imposibles y puedes apuntar hacia atrás cuando te acuerdes tarde.'
  - title: 'Cantidades, duraciones y cosas que dejar'
    text: 'Ocho vasos de agua, veinte minutos de lectura o un día más sin fumar. Cada tipo se registra como pide su forma.'
  - title: 'Recordatorios con la voz que elijas'
    text: 'El aviso cambia de tono según la hora del día y según a quién le hayas dado la voz. Por la mañana plantea el día; por la noche te ayuda a cerrarlo.'
  - title: 'Logros y estadísticas de verdad'
    text: 'Mapas de calor, récords y logros que se ganan solos. Los números están para que veas cómo vas, no para presumir en ningún sitio.'
illustration: '../../../assets/projects/bito/illustration.png'
built:
  - 'Kotlin 2.1 y Jetpack Compose, para Android 8.0 o superior.'
  - 'Offline-first: todos los datos viven en el móvil.'
  - '4 permisos propios, y ninguno es internet. La app no puede llamar a casa.'
  - '0 dependencias de Google Play Services. Funciona igual en GrapheneOS.'
  - 'Copias cifradas con Argon2id y AES-256-GCM cuando les pones contraseña.'
  - 'Software libre bajo GPL-3.0-or-later, código en [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - version: 'v1.3.0'
    date: 2026-09-27
    note: 'Pulido de Hoy, del widget de un hábito, del temporizador, de Respirar y de Ajustes.'
  - version: 'v1.2.0'
    date: 2026-09-27
    note: 'Respirar con Habi: tres modos, un contador honesto y un recordatorio diario opcional.'
  - version: 'v1.1.0'
    date: 2026-09-26
    note: 'Tareas con plazo, foco con temporizador y avisos de tareas a mediodía.'
  - version: 'v1.0.0'
    date: 2026-08-26
    note: 'La primera versión para compartir. Widget de un solo hábito, avisos con la voz de Habi, sonido y vibración al registrar.'
---

Todas las apps de hábitos que probé pedían una cuenta, luego una suscripción, luego mis datos. Bito pide un toque. Guarda todo en el móvil, hace copias de seguridad en la carpeta que tú elijas y no llama a casa.

Hice el primer prototipo en un día para probar la idea, y lo conté. Por el camino llegó Habi, que anima sin dar la lata. Después llegaron las tareas, con un temporizador para empezarlas, y un rato para respirar cuando el día aprieta.

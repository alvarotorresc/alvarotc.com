---
name: Bito
tagline: Registra un hábito en un toque, sin cuentas ni nube.
intro: 'La app de hábitos que no te roba tiempo. Vive entera en tu móvil: sin cuentas, sin nube, ni una línea a internet.'
kind: mobile
status: publishing
tier: featured
order: 1
repo: https://github.com/alvarotorresc/bito
url: https://bito.alvarotc.com
license: GPL-3.0
platform: Android 10+
stack: [Kotlin, Offline-first, Privacy]
githubRepo: alvarotorresc/bito
icon: '../../../assets/projects/bito/icon.jpg'
cover: '../../../assets/projects/bito/cover.jpg'
download:
  url: https://github.com/alvarotorresc/bito/releases/download/v1.0.0/app-release.apk
  label: '4,7 MB'
facts:
  - { label: 'Tamaño del APK', value: '4,7 MB', mono: true }
  - { label: 'Red', value: 'Sin permiso de red' }
screenshots:
  - src: '../../../assets/projects/bito/widget.jpg'
    alt: 'Widget en la pantalla de inicio'
    caption: 'Widget'
  - src: '../../../assets/projects/bito/reminder.jpg'
    alt: 'Recordatorio con botón de registrar'
    caption: 'Recordatorio'
  - src: '../../../assets/projects/bito/review.jpg'
    alt: 'Revisión nocturna'
    caption: 'Revisión nocturna'
  - src: '../../../assets/projects/bito/stats.jpg'
    alt: 'Estadísticas con mapa de calor y récords'
    caption: 'Estadísticas'
  - src: '../../../assets/projects/bito/badges.jpg'
    alt: 'Insignias'
    caption: 'Insignias'
featuresIntro: 'Tres formas de registrar, dos sin abrir la app.'
features:
  - title: 'Desde la pantalla de inicio'
    text: 'El widget registra el hábito con un toque. No hace falta abrir la app.'
    image: '../../../assets/projects/bito/widget.jpg'
  - title: 'Desde el recordatorio'
    text: 'La notificación trae su propio botón. Lo pulsas y queda hecho.'
    image: '../../../assets/projects/bito/reminder.jpg'
  - title: 'Al final del día'
    text: 'La revisión nocturna: una sola pantalla para cerrar el día.'
    image: '../../../assets/projects/bito/review.jpg'
  - title: 'Rachas que no castigan'
    text: 'Congeladores para días imposibles y registro con fecha atrás.'
  - title: 'Más que marcar sí o no'
    text: 'Cantidades (8 vasos de agua), duraciones (20 min de lectura) y cosas que dejar (un día más sin fumar).'
  - title: 'Recordatorios con voz'
    text: 'Eliges la voz, y el tono cambia según la hora.'
  - title: 'Estadísticas reales'
    text: 'Mapas de calor, récords e insignias.'
illustration: '../../../assets/projects/bito/habi.jpg'
built:
  - 'Kotlin, para Android 10+.'
  - 'Offline-first: todos los datos viven en el móvil.'
  - 'Sin permiso de red. La app no puede llamar a casa.'
  - 'Exporta a un fichero plano que es tuyo.'
  - 'Software libre bajo GPL-3.0, código en [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito).'
changelog:
  - { version: 'v2.0.0', note: 'Habi como compañera, fichas de tienda y widget.' }
  - {
      version: 'v1.0.0',
      date: 2026-08-26,
      note: 'Primera versión pública. Registro en un toque, rachas, exportar a fichero.',
    }
  - { version: 'v0.1.0', note: 'El prototipo de 24 horas.' }
---

Todas las apps de hábitos que probé pedían una cuenta, luego una suscripción, luego mis datos. Bito pide un toque. Guarda todo en el móvil, exporta a un fichero plano y no llama a casa.

Hice la primera versión en un día para probar la idea, y lo conté. La segunda añade a Habi, una compañera que anima sin dar la lata, y es la que va a las tiendas.

---
name: Quedamos
tagline: Tu grupo quiere verse. Nadie sabe cuándo.
intro: 'Quedamos hace la pregunta y os avisa cuando podéis todos. Un calendario compartido para tu cuadrilla, sin más pantallas de las necesarias.'
kind: hybrid
status: beta
tier: featured
order: 2
repo: https://github.com/alvarotorresc/quedamos-app
url: https://quedamos.alvarotc.com
license: MIT
platform: 'Web y Android 6.0+'
stack: [React, Ionic, Capacitor, NestJS, Prisma, Supabase]
githubRepo: alvarotorresc/quedamos-app
download:
  { url: 'https://github.com/alvarotorresc/quedamos-app/releases/latest', label: 'Android 6.0+' }
icon: '../../../assets/projects/quedamos/icon.jpg'
cover: '../../../assets/projects/quedamos/calendario.jpg'
coverMobile: '../../../assets/projects/quedamos/grupo.jpg'
promo: '../../../assets/projects/quedamos/promo.png'
facts:
  - { label: 'Idiomas', value: 'Español e inglés' }
  - { label: 'Tests', value: '1.400 (608 API + 792 app)', mono: true }
  - { label: 'Publicidad', value: 'Sin anuncios' }
screenshots:
  - src: '../../../assets/projects/quedamos/calendario.jpg'
    alt: 'Calendario semanal con un aro por día y las acciones del sábado seleccionado'
    caption: 'Calendario'
  - src: '../../../assets/projects/quedamos/preguntar.jpg'
    alt: 'Hoja para preguntar al grupo por un día y una franja'
    caption: 'Preguntar al grupo'
  - src: '../../../assets/projects/quedamos/quedadas.jpg'
    alt: 'Lista de quedadas con el aro de confirmaciones de cada una'
    caption: 'Quedadas'
  - src: '../../../assets/projects/quedamos/grupo.jpg'
    alt: 'Pantalla de grupo con los miembros y sus colores'
    caption: 'Grupo'
  - src: '../../../assets/projects/quedamos/perfil.jpg'
    alt: 'Perfil con la identidad del usuario y los ajustes en mosaico'
    caption: 'Perfil'
  - src: '../../../assets/projects/quedamos/calendario-claro.jpg'
    alt: 'El calendario semanal en tema claro'
    caption: 'Tema claro'
featuresIntro: 'Quedar con seis personas es una cadena de mensajes que nadie quiere leer. Quedamos la sustituye por tres pasos.'
features:
  - title: 'Sondear'
    text: 'Alguien pregunta un día desde el calendario: «¿Podéis el sábado por la noche?». Cada uno contesta con un toque: puedo, no puedo, aún no sé.'
    image: '../../../assets/projects/quedamos/preguntar.jpg'
  - title: 'El aro se cierra'
    text: 'Cada persona es un arco de un color en un círculo. El hueco es quien no ha respondido. Cuando el aro se cierra, podéis todos y os llega el aviso.'
    image: '../../../assets/projects/quedamos/grupo.jpg'
  - title: 'Quedamos'
    text: 'Alguien propone plan, hora y sitio. Quien confirma cierra su arco. La quedada queda sellada y va al calendario de cada uno.'
    image: '../../../assets/projects/quedamos/quedadas.jpg'
  - title: 'Disponibilidad como te salga'
    text: 'Día completo, franjas de mañana, tarde y noche con las horas que tú definas, o un rango exacto. Vistas de semana, mes y lista, con el mejor día calculado.'
  - title: 'Propuestas'
    text: '«¿Escapada a la Alpujarra?» se vota a favor o en contra y, si sale, se convierte en quedada con un toque.'
  - title: 'Quedadas de verdad'
    text: 'Con sitio que abre el mapa, enlace de reunión si es online, descarga para tu calendario y una tarjeta para compartir por donde quieras.'
  - title: 'Avisos que valen la pena'
    text: 'Nueva quedada, el aro que se cierra, un recordatorio 24 horas antes, quién no viene. Cada tipo se apaga por separado.'
  - title: 'Widgets en Android'
    text: 'La semana y el mejor día en la pantalla de inicio, sin abrir la app.'
  - title: 'Seis colores. El tuyo es el tuyo.'
    text: 'Cada miembro tiene un color en el grupo y lo lleva a todas partes: al aro, a las quedadas, a su perfil.'
illustration: '../../../assets/projects/quedamos/icon.jpg'
built:
  - 'Ionic React 8 y Capacitor 7 empaquetan la web para Android.'
  - '[NestJS](https://nestjs.com) 10, [Prisma](https://www.prisma.io) 6 y PostgreSQL en la API.'
  - '[Supabase](https://supabase.com) para autenticación, base de datos y tiempo real.'
  - 'Firebase Cloud Messaging para las notificaciones push.'
  - 'Widgets de Android en Kotlin, con RemoteViews y WorkManager.'
  - 'Web en [Vercel](https://vercel.com); API en Docker.'
changelog:
  - {
      version: 'v1.0.0',
      date: 2026-09-09,
      note: 'El rediseño completo. En producción para la beta.',
    }
  - { version: 'v0.3.3', date: 2026-04-09, note: 'Mejora la UI y corrige la exportación a ICS.' }
  - {
      version: 'v0.3.2',
      date: 2026-04-09,
      note: 'Eventos en línea, fix de crash en producción y estabilidad de color de miembro.',
    }
  - { version: 'v0.3.1', date: 2026-04-05, note: '[DATO]' }
  - { version: 'v0.3.0', date: 2026-04-05, note: '[DATO]' }
  - { version: 'v0.2.5', date: 2026-03-27, note: '[DATO]' }
  - { version: 'v0.2.4', date: 2026-03-26, note: 'Hotfix de CSP/CORS y mejoras de observabilidad.' }
  - { version: 'v0.2.3', date: 2026-03-18, note: '[DATO]' }
  - { version: 'v0.2.2', date: 2026-03-17, note: '[DATO]' }
  - {
      version: 'v0.2.1',
      date: 2026-03-12,
      note: 'Auth con Supabase, i18n, calendario, grupos y toggle de tema.',
    }
mock: false
---

Quedar con seis personas es una cadena de mensajes que nadie quiere leer. Quedamos la sustituye por tres pasos.

[DATO]

---
name: Huellas
tagline: Una plataforma para reunir mascotas perdidas con sus familias.
intro: 'Huellas es el canal que no se puede arrancar de la farola y que llega al barrio: una app y una web para buscar, encontrar y anunciar mascotas perdidas, con las protectoras dentro desde el primer día.'
kind: hybrid
status: design
tier: featured
order: 3
repo: https://github.com/alvarotorresc/huellas
license: AGPL-3.0
stack: [Capacitor, PostGIS, MapLibre, Docker]
githubRepo: alvarotorresc/huellas
facts:
  - { label: 'Fase', value: 'Definición aprobada, sin código' }
  - { label: 'Documentos', value: '12', mono: true }
featuresIntro: 'Lo previsto para el primer lanzamiento (MVP): perros y gatos, España, español.'
features:
  - title: 'Alta de un anuncio de pérdida'
    text: 'Publicar que se ha perdido un animal, con cartel imprimible y QR, y un enlace público sin necesidad de iniciar sesión.'
  - title: 'Avisos sin cuenta'
    text: 'Cualquiera puede avisar de "lo he visto" o "lo tengo conmigo" sin crear una cuenta.'
  - title: 'Matching entre avisos y anuncios'
    text: 'El sistema sugiere avisos a cada anuncio y el dueño decide, siempre a mano: Aplica, No aplica o No estoy seguro.'
  - title: 'Mapa y lista con difuminado'
    text: 'Explorar anuncios y avisos en mapa o en lista, ordenados por distancia y difuminados por defecto.'
  - title: 'Zonas de alerta'
    text: 'Hasta tres zonas por usuario, de 500 m a 10 km, con avisos de "Perdido cerca de ti" y silencio horario configurable.'
  - title: 'Panel de protectoras'
    text: 'Ficha pública para protectoras, con sus recogidos, adopciones y varias personas al frente de la cuenta.'
  - title: 'Difuminado manual de imágenes sensibles'
    text: 'Quien publica marca a mano qué fotos difuminar; no hay detección automática en el MVP.'
  - title: 'Donaciones'
    text: 'Propina al creador, disponible en la web y en la app, sin nada digital a cambio.'
  - title: 'Fuera del MVP'
    text: 'Quedan para más adelante el chat, la IA para comparar fotos y el seguimiento de ubicación en segundo plano.'
built:
  - 'Webapp única envuelta con Capacitor, con el framework web todavía por decidir, para poder salir a iOS más adelante.'
  - 'Backend propio: Postgres con la extensión PostGIS para las búsquedas por cercanía.'
  - 'API propia y base de datos en un VPS, con Docker Compose detrás de Caddy. Sin Supabase.'
  - 'Mapas con MapLibre.'
  - 'Web pública en Vercel mientras siga siendo gratuito.'
  - '[DATO]'
changelog: []
mock: false
---

Huellas no nace de un hueco de mercado, sino de una experiencia concreta de su creador: «tengo un gato que recogí de la calle, nadie me escuchó en mi barrio, me quitaban los carteles que puse y me sentí totalmente mudo». No es una competición frente a otras apps ni busca rédito económico: las donaciones solo cubren costes, como propina al creador.

En el MVP: perros y gatos, en España y en español. Lo que se mide son animales reunidos y personas escuchadas, no crecimiento.

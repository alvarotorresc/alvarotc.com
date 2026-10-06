---
title: 'DevTools: 52 herramientas de desarrollo que no se llevan lo que pegas'
seoTitle: 'DevTools: utilidades sin servidor'
description: 'Por qué rehice mi web de utilidades para desarrolladores: 52 herramientas que corren en el navegador, validadores de DNI o IBAN y cómo la construí.'
date: 2026-10-06
draft: false
tags: ['foss', 'privacidad', 'astro', 'svelte', 'proyectos', 'ia-engineering']
---

Todos lo hemos hecho. Te llega un JWT de producción, quieres ver qué lleva dentro y lo pegas en la primera web que sale en Google. Lo mismo con un JSON que trae datos de clientes, con un IBAN para comprobar un formulario o con un cURL que lleva el token en la cabecera. No sabes quién está detrás de esa web ni qué hace con lo que le mandas, y aun así se lo mandas, porque tienes prisa.

En febrero me cansé y me hice mi propia caja de herramientas: catorce utilidades en una sola página, para no tener que pegar nada en webs que no conozco. En septiembre la rehice entera y hoy son 52. Se llama [DevTools](https://devtools.alvarotc.com/es) y este post cuenta qué es y cómo la hice.

## Qué es

Una web con las herramientas que abro veinte veces al día, juntas y en español e inglés. Formatear un JSON, decodificar un JWT, probar una regex, comparar dos textos, pasar un timestamp a fecha, sacar el hash de un archivo, generar UUID o mil filas de datos de prueba con semilla para que salgan siempre iguales.

Están repartidas en ocho categorías, pero casi nunca navego por ellas. Pulso `Ctrl K`, escribo «base64», «iva» o «cron» y entro. Hay más atajos (`/` para buscar, `c` para copiar el resultado, `?` para ver todos), favoritos y recientes en la barra lateral, y tres temas: claro, oscuro y uno de terminal, en verde sobre negro.

## Lo que pegas se queda en tu equipo

DevTools no tiene backend. La web son ficheros estáticos y todo el trabajo lo hace tu navegador. Cuando pegas un token en el [decodificador de JWT](https://devtools.alvarotc.com/es/decodificador-jwt), la cabecera, el payload y la fecha de caducidad se sacan ahí mismo, en tu pestaña. No hay ninguna petición con tu texto dentro, porque no hay ningún servidor al que mandarlo.

Para ser exactos, de la web salen dos cosas: un contador de visitas (Umami, en mi propio servidor y sin cookies) y la descarga de los tipos de cambio del BCE para el conversor de divisas. Ninguna de las dos lleva nada de lo que escribes.

Algunas herramientas recuerdan lo último que pusiste, para que el JSON o la regex sigan ahí al volver. Las que pueden tocar datos personales no lo hacen nunca: DNI, IBAN, número de la Seguridad Social, teléfonos, tarjetas, JWT, cURL, contraseñas y hashes no se guardan ni en tu propio navegador.

No hace falta que te fíes de mí. El código está en [GitHub con licencia MIT](https://github.com/alvarotorresc/devtools) y se puede comprobar todo lo anterior.

## Lo español, sin buscarlo

La otra razón para hacerla es que las herramientas que más uso trabajando en España no estaban juntas en ningún sitio. Cada vez que necesitaba un DNI de prueba válido o comprobar un CIF acababa en una web distinta, normalmente llena de anuncios.

Ahora hay una categoría entera para eso. El [validador de DNI y NIE](https://devtools.alvarotc.com/es/validador-dni-nie) calcula la letra y genera documentos ficticios para tests. El de IBAN desglosa una cuenta española en entidad, oficina y dígitos de control. También hay CIF, número de la Seguridad Social, matrículas, teléfonos y códigos postales con su provincia.

Y para quien factura como autónomo, la [calculadora de retención de IRPF](https://devtools.alvarotc.com/es/calculadora-retencion-irpf) monta la factura con IVA y retención, partiendo de la base o de lo que quieres cobrar, y la [calculadora de días hábiles](https://devtools.alvarotc.com/es/calculadora-dias-habiles) cuenta los días entre dos fechas descontando los festivos nacionales.

## De una página con almohadillas a una web de verdad

La primera versión era una SPA con Vite y TypeScript sin framework. Una sola página, y cada herramienta vivía en una ruta con almohadilla: `#json`, `#jwt`. Funcionaba bien para mí, pero para un buscador era una única página con un título. Si alguien buscaba «decodificar JWT», DevTools no existía.

El 26 de septiembre la rehice en Astro 7 con islas de Svelte 5. Ahora cada herramienta es una página estática con su propia URL en cada idioma, su título, su descripción y un texto que explica para qué sirve. El navegador solo carga el JavaScript del componente de esa herramienta, nada más. Los enlaces viejos con almohadilla siguen funcionando y redirigen a la página nueva.

Al día siguiente pasó de 14 a 52 herramientas, en tres lotes.

## Cómo la hice

Esta vez lo hice distinto que con [Bito](/es/blog/de-una-idea-a-una-apk-en-24h/). Antes de tocar código escribí la especificación de la plataforma y la de las herramientas nuevas, y un plan por cada bloque de trabajo. Están en el repositorio, en `docs/superpowers`. La mayor parte del código la escribieron agentes de IA siguiendo esos planes. Lo que decidí yo fue qué entraba, cómo tenía que comportarse cada herramienta y qué tenía que pasar para dar algo por terminado.

Ese último punto es el que hace que funcione. La lógica de cada herramienta es TypeScript puro, sin DOM, con sus tests en Vitest. Cada herramienta tiene además su test en navegador con Playwright. Los tests fallan si a una herramienta le falta un texto, un slug o su contenido en alguno de los dos idiomas. Y en cada PR la integración continua pasa el linter, comprueba los tipos, corre los tests unitarios, construye la web, revisa el CSS y el SEO del build y acaba con los tests de navegador. Si algo de eso falla, no entra.

## SEO sin trucos

Hacer una herramienta útil no sirve de mucho si nadie la encuentra. En octubre dediqué dos sesiones a que cada página se pudiera encontrar por lo que hace: un título, una descripción y un `h1` propios para cada herramienta, páginas de categoría con texto escrito para cada una (como la de [identificadores](https://devtools.alvarotc.com/es/identificadores)), miga de pan, herramientas relacionadas al final de cada página, un sitemap con la fecha real de cada cambio y un aviso a IndexNow en cada despliegue.

Todo eso lo vigila un script en la integración continua que falla si una página se queda sin título, se sale de rango o pierde los enlaces internos. No hay texto escondido ni páginas de relleno. Si alguien busca «validar IBAN» y acaba en DevTools, quiero que sea porque la página hace justo eso.

## Lo que viene

No tengo una lista de herramientas nuevas cerrada. Lo siguiente lo van a decidir las búsquedas reales: cuando Search Console me diga con qué llega la gente, sabré si faltan herramientas o si faltan explicaciones al lado de las que ya hay, del tipo «qué significa chmod 755».

Mientras tanto, [DevTools está aquí](https://devtools.alvarotc.com/es), sin cuenta y sin nada que instalar. Si echas en falta una herramienta o alguna hace algo raro, abre un issue en [el repositorio](https://github.com/alvarotorresc/devtools/issues). Los leo.

---
title: 'De una idea a una APK en 24h'
description: 'Cuatro documentos de diseño antes de escribir una sola línea de código. Así pasó Bito, mi app de hábitos FOSS para Android, de idea a APK instalada en el móvil.'
date: 2026-08-14
draft: false
tags: ['android', 'kotlin', 'compose', 'foss', 'proceso', 'ia-engineering']
---

El 13 de agosto por la noche cerré el primer documento de diseño de Bito. La noche del 14 tenía la APK instalada en mi Pixel. Poco más de veinticuatro horas de reloj, repartidas en dos tardes.

Lo tentador sería vender velocidad. Pero lo interesante del proceso es justo lo contrario: durante casi todo ese tiempo no escribí código. Escribí cuatro documentos. El código llegó al final, en tres commits, y fue la parte fácil precisamente porque llegó al final.

## La idea

Bito es un tracker de hábitos para Android. Cien por cien offline, sin cuentas, sin servidores, software libre. Nace de un problema concreto: las apps de hábitos que he probado hacen caro lo importante. Crear un hábito son cinco pantallas. Apuntar que hoy has bebido agua son tres taps y una decisión.

El principio rector cabe en una frase: **registrar un hábito debe costar casi cero**.

La otra mitad del producto es Habi, una mascota. No es decoración. El nombre del proyecto sale de juntar las dos piezas —Bito + Habi = hábito— y su cara es lo único de la app que no se compra con puntos: es el reflejo directo de tu constancia en los últimos siete días.

## Cuatro documentos antes de una línea de código

El diseño se dividió en cuatro fases, cada una con su entregable validado antes de pasar a la siguiente. Cada decisión quedó marcada como `[DECIDIDO]`, `[PROPUESTA]` o `[PENDIENTE — Fase 2]`, con fecha. Suena a burocracia hasta que llevas dos días decidiendo y necesitas saber qué está cerrado.

### Fase 1 — Qué hace la app

Internamente, todo hábito de Bito se define con cuatro piezas: métrica (check, cantidad, duración), período (día, semana, mes), dirección (al menos, como máximo, cero) y objetivo. Ese modelo cubre desde "hacer la cama" hasta "redes sociales, máximo 30 minutos al día" sin ramas especiales.

El usuario no lo ve jamás: elige entre cinco presets que lo rellenan por él. Una separación deliberada entre lo que necesita el dominio y lo que necesita ver una persona a las siete de la mañana.

La decisión que más define el producto es otra: **anti-sargento**. La app no castiga ni impide corregir. Registro retroactivo sin límite, pausas por vacaciones o lesión que no rompen la racha, y congeladores que se compran con los puntos que ya has ganado. La disciplina es la única moneda, pero siempre hay una válvula.

Habi, además, es obligatoria, sin toggle para desactivarla. La válvula para quien no quiera teatro no es un interruptor: es elegir la personalidad Neutra en vez del sargento o la animadora.

### Fase 2 — Cómo se construye

Kotlin nativo con Jetpack Compose, y no por preferencia personal: las features estrella de Bito viven en la frontera con el sistema operativo —widget, alarmas exactas sin Google Play Services, acciones rápidas dentro de la notificación—. Cross-platform resuelve esas fronteras con plugins-puente de terceros, y cada puente es un punto de fallo que no controlo. En un móvil sin Google, eso es crítico. Súmale que F-Droid compila desde fuente y la decisión se toma sola.

La arquitectura es de tres capas en un solo módulo:

```
com.alvarotc.bito
├── ui/      → pantallas Compose · widget Glance · notificaciones · tema
├── domain/  → el motor: día lógico, rachas, sellado, puntos, mood
└── data/    → Room · DataStore · backup · repos
```

Con una regla que vale por todo el diagrama: `domain/` no importa nada de Android. Es Kotlin puro, sin reloj propio (recibe el `now` como parámetro). La consecuencia es que la mayoría de los bugs posibles de Bito se van a poder testear en JVM, sin emulador, en milisegundos.

Segunda regla: **lo derivado no se almacena**. Rachas, porcentajes, heatmaps, mood y días perfectos se calculan desde los registros. Nada de un campo `streak` que hay que mantener sincronizado y que se corrompe a la primera. El registro retroactivo simplemente funciona, porque no hay nada que reparar.

Y una decisión que casi nadie toma a tiempo: **el backup es una feature core, no un extra**. Habrá export e import completos desde el primer build usable, en un JSON legible, con test de round-trip y una regla de PR explícita: todo PR que toque el esquema actualiza el serializador de backup en ese mismo PR. El backup no se queda atrás ni un commit.

Lo de "no toca red" tampoco es una promesa de marketing. Es una línea que falta en el manifest:

```xml
<!-- Bito no declara el permiso INTERNET a propósito: la garantía "tus datos
     jamás salen del móvil" es verificable por cualquiera en este manifest. -->
```

Cualquiera puede descomprimir el APK y comprobarlo. Esa es la diferencia entre decir que respetas la privacidad y que sea verificable.

### Fase 3 — Cómo se ve

Tres briefs de dirección visual con estética distinta —una oscura y cálida, una crema de papel, una pastel fría— y contenido idéntico a propósito, para comparar solo la estética. Ganó Crema, con un hurto de la oscura: los puntitos de progreso.

Tema único, sin modo claro ni oscuro. Decisión consciente: la mitad de trabajo visual y una identidad más fuerte.

Los tokens acabaron en código tal cual:

```kotlin
// Tokens de color de Bito — dirección "Crema"
val Papel = Color(0xFFF2ECE1)
val Tarjeta = Color(0xFFFBF8F2)
val Borde = Color(0xFFE7DFD1)
val Tinta = Color(0xFF3C352B)
val TintaSuave = Color(0xFF9C9285)
val Hoja = Color(0xFF57A06B)
val HojaTinte = Color(0xFFE3EDE0)
val Brasa = Color(0xFFD9704F)
val BrasaTinte = Color(0xFFF7E3DB)
val HabiSalvia = Color(0xFFA9C9A1)
val Mofletes = Color(0xFFE8B4A8)
```

`Hoja` es el único acento interactivo. `Brasa` es calor emocional —rachas, récords, celebración— y tiene prohibido aparecer en un botón. Reglas aburridas que evitan que la app se vuelva un carnaval en la pantalla número doce.

También murió una idea aquí. El informe inicial sobre la mascota contemplaba un pipeline de arte en Blender. La vía final es 2D vectorial dibujado en código: capas tintables y una cara paramétrica donde mood y personalidad salen de parámetros de dibujo, no de un asset por combinación. Menos ambicioso sobre el papel, infinitamente más barato de mantener.

### Fase 4 — En qué orden se construye

Once milestones, de M0 a M10, con una condición: cada uno termina en algo instalable o verificable. Sin fechas, porque la cadencia real es irregular; el compromiso es que cada sesión cierre algo completo.

Aquí se cerraron también la licencia y la distribución. **GPL-3.0-or-later**, por el copyleft: cualquier Bito derivado tiene que seguir siendo libre, lo que hace inviable el clon con anuncios y tracking —un riesgo real para apps FOSS que funcionan bien—. Y salida simultánea por Google Play, F-Droid y GitHub Releases, porque la gente normal, mi familia incluida, instala desde Play y no desde un repo alternativo.

El documento se cierra con una frase que me gusta: la regla de no escribir código durante el diseño queda satisfecha, y expirada con honores.

## M0: tres commits y una APK

Con los cuatro documentos validados, M0 ("Cimientos") fue rápido porque no quedaba ninguna decisión abierta. Tres commits atómicos:

```
33f7eb7  chore: add project baseline (license, readme, changelog, tooling)
f8b9a9f  chore: scaffold android project with gradle and ci
e457cb0  feat(ui): add crema theme, outfit typography and habi launcher icon
```

Dentro: Gradle 8.11.1 con AGP 8.7.2 y Kotlin 2.1, minSdk 26, Compose declarado en un version catalog, ktlint con hook de pre-commit vía Lefthook, y un CI que en cada push y cada PR ejecuta `ktlintCheck lint test assembleDebug`. Verde en tres minutos.

Lo que se ve al abrir la app es una pantalla que dice "Hola, Bito" con el icono de Habi encima —"Habi asomando", el bean entrando desde el borde inferior sin contenedor: el personaje es el logo—. Eso es todo. Una APK debug, versionName `0.0.1`, instalada a mano en mi Pixel. No hay release, ni tag, ni tests reales todavía: el paquete `domain/` aún no existe y el `test` del CI hoy pasa en vacío. La suite de verdad llega con el motor, en M1, con mi lista real de hábitos como fixtures.

## Lo que no funcionó: el JDK

La única pelea de verdad de la sesión no fue con Gradle ni con Compose. Fue con Java.

Mi sistema es Nobara, derivado de Fedora, y trae OpenJDK 25 por defecto. AGP 8.7.2 no lo soporta. Lo lógico era usar el 21, y el sistema decía tenerlo: `/usr/lib/jvm/java-21-openjdk` existía. Dentro solo había un directorio `man`. Una carcasa vacía, sin un solo binario.

La solución fue dejar de pelearme con el JDK del sistema. Temurin 21 descargado a mano y Gradle apuntando ahí de forma global:

```properties
# ~/.gradle/gradle.properties
org.gradle.java.home=/home/tu-usuario/.jdks/jdk-21.0.12+8
```

Global y no en el proyecto, a propósito: el repo es público y la ruta de mi máquina no tiene por qué viajar dentro de él. En CI el problema no existe, porque `setup-java` instala un Temurin 21 limpio. Ninguna guía de "cómo empezar un proyecto Android" menciona esta clase de fricción, y es donde se va el tiempo de verdad.

## Lo que aprendí

- **Diseñar despacio hace que construir sea rápido.** M0 no tuvo ni una discusión, porque todas estaban ya cerradas y escritas. Empezar por el código habría significado tomar las mismas decisiones, pero en caliente, a medias y sin dejar rastro.
- **El "por qué" al lado de cada decisión es la mitad del valor del documento.** Dentro de tres meses no me voy a acordar de por qué descarté Flutter, ni de por qué Room y no SQLDelight. El documento sí.
- **Esto no es vibe coding.** Trabajo con IA todo el rato, pero el reparto es explícito: yo dirijo, decido y reviso; la IA argumenta alternativas y ejecuta. Cada decisión de producto, arquitectura y diseño la tomé yo, firmada y fechada. La diferencia no está en la velocidad: está en si al final sabes por qué tu app es como es.
- **Un permiso que no declaras vale más que un párrafo de política de privacidad.** Verificable gana a prometido, siempre.
- **Cuidado con confundir "lo planificado" con "lo hecho".** El plan decía que M0 dejaba montada la estructura de tres paquetes. La realidad es que dejó `ui/theme` y poco más. El plan es una intención; el repo es el estado.

El repositorio es público desde el primer commit: [github.com/alvarotorresc/bito](https://github.com/alvarotorresc/bito). Ahora toca M1, el motor de dominio, que es donde Bito deja de ser un icono bonito y empieza a saber contar rachas.

**Actualización, septiembre de 2026.** M1 llegó, y lo que vino detrás también: Bito publicó su [versión 1.0.0](https://github.com/alvarotorresc/bito/releases/latest) el 26 de agosto, doce días después de este post. Las decisiones de estos cuatro documentos siguen en pie en el código.

---
title: 'BaseCero: tu dinero no tiene por qué vivir en el servidor de nadie'
description: 'Por qué he hecho una app de finanzas personales sin servidor, sin cuentas y de código abierto, cuando ya existen miles. Qué defiende, a qué renuncias a cambio y cómo instalarla.'
date: 2026-09-07
draft: false
tags: ['foss', 'privacidad', 'local-first', 'pwa', 'finanzas', 'producto']
---

Instala una app de finanzas cualquiera y mira lo que te pide antes de dejarte apuntar el primer gasto. Un correo. Una contraseña. Casi siempre, las credenciales de tu banco, para «sincronizar tus movimientos automáticamente». A cambio no pagas nada.

Ese trato tiene una parte que no sale en la pantalla de registro. Alguien está montando, en un servidor que no es tuyo, la lista de dónde compras, cuánto ganas, cuándo cambias de trabajo y qué te preocupa lo suficiente como para apuntarlo. Es probablemente el archivo más íntimo que existe sobre una persona, y cuanto más crece y más manos lo tocan, más gente que no eres tú decide qué se hace con él. La regla es vieja y no falla: si es gratis y necesita tus datos bancarios, la pregunta correcta es qué se está vendiendo.

## Por qué otra app de finanzas si ya hay miles

Hay miles, es verdad, y he probado unas cuantas. Casi todas fallan en el mismo sitio: son gratis porque el negocio son los datos, o son de pago pero igualmente guardan tus cuentas en su nube, o son locales pero cerradas, con lo que su promesa de privacidad es exactamente eso, una promesa que no puedes comprobar.

Lo que no encontré fue una que cumpliera las cuatro cosas a la vez: sin servidor, sin cuenta, offline de verdad y con el código a la vista. Todas cumplían dos o tres. La que caía era siempre la que más me importaba.

## Qué es BaseCero

BaseCero es una app de finanzas personales que vive entera en tu dispositivo. No tiene servidor, no tiene registro y no tiene nube. Se abre en el navegador, se instala como una aplicación y funciona en modo avión.

Por dentro hace lo que le pido a una app así. **Tu mes empieza el día que cobras**, no el 1: ordena el dinero en periodos de nómina a nómina y te dice cuánto te queda de verdad en cada momento, descontando lo que todavía está comprometido. Tiene una pantalla de gasto por categoría, ordenada por lo que llevas gastado, donde pones límite solo donde te sirve. Lleva los gastos a medias con otra persona en las dos direcciones —quién pagó y qué parte es tuya— y los liquida por el neto. Y guarda tu patrimonio: cuentas, deudas con su cuota y objetivos de ahorro. Si tu banco te da el extracto en CSV, lo importa y evita los duplicados.

Lo que defiende cabe en cuatro frases:

- **Todo local, siempre.** Los datos viven en una base de datos de tu propio navegador. No hay backend del que se puedan filtrar, porque no hay nada al otro lado.
- **Cero telemetría, cero analytics, cero cookies.** La app no mide nada ni informa a nadie. Por eso tampoco hay banner que aceptar: no hay nada que consentir.
- **Tu dato es una hoja de cálculo.** Exportas un `.xlsx` que abres en LibreOffice o en Google Sheets, y que la propia app vuelve a importar entero. Nada se queda atrapado dentro. Si mañana BaseCero desapareciera, tus cuentas seguirían siendo tuyas y seguirían siendo legibles.
- **Y si quieres guardarla a salvo, cifrada.** Además del `.xlsx` en claro hay una copia cifrada con contraseña, para dejarla donde tú decidas.

## Por qué sin servidor

No tener servidor no es una decisión técnica, es de producto, y es la primera de una cadena.

Un servidor obliga a tener cuentas. Las cuentas obligan a guardar correos y contraseñas. Eso obliga a una política de privacidad, a un banner, a alguien que responda cuando haya una brecha y, tarde o temprano, a un modelo de negocio que justifique la factura de ese servidor a fin de mes. Cuando el usuario no paga, ese modelo de negocio suele estar sentado justo encima de sus datos.

Quitando la primera pieza se caen todas las demás. Sin servidor no hay registro que rellenar, no hay una cuenta mía que puedan reventar y no hay factura mensual que haya que justificar vendiendo algo. La única forma honesta de prometer que no miro tus datos es no tener manera de mirarlos.

## Por qué de código abierto

Porque «no recogemos tus datos» es una frase, y una frase no se puede verificar. El código sí. Está en GitHub con licencia MIT: cualquiera puede leer qué hace la app, comprobar que no hay llamadas de red escondidas y llevárselo si le sirve. Las demás te piden confianza; yo prefiero poner el código delante para que no haga falta.

Hay además un motivo menos noble y más real. BaseCero no nació como producto: era mi propia herramienta, una hoja de cálculo con scripts encima, hecha a la medida de mi vida y con mis categorías dentro. Funcionaba tan bien que acabó siendo la app que uso todos los días, y en algún momento dejó de tener sentido que solo la usara yo. Sacar mi vida del código —el nombre de la otra persona, mis categorías, mi banco, mi idioma, mi moneda— fue casi todo el trabajo de la versión 1.0. Abrirla después fue la consecuencia lógica: si la herramienta ya no da por hecho que eres yo, no hay ninguna razón para que no sea de todos.

## Lo que este trato te cuesta

Nada de esto sale gratis, y prefiero escribirlo aquí que dejar que lo descubras tú solo.

Si pierdes el dispositivo y no habías exportado nada, pierdes tus datos. No hay copia en un servidor que te los devuelva, porque ese servidor no existe. Si desinstalas la app, se van con ella. Y si cifras una copia y olvidas la contraseña, no hay «recuperar contraseña»: esa clave no está guardada en ningún sitio, ni siquiera en el mío.

Un matiz más, por honestidad: lo cifrado son las copias, no la base de datos local. Esa vive en el almacenamiento privado del navegador y la protege el propio dispositivo, así que quien tenga tu móvil desbloqueado tiene tus cuentas.

Es el mismo trato que con las llaves de casa. A cambio de que no exista ninguna copia en manos de otro, la responsabilidad de no perderlas pasa a ser tuya. Me parece un intercambio justo, pero es un intercambio, y quería que estuviera dicho antes de que instales nada.

## Cómo se consigue y cómo se instala

No hay tienda ni instalador. BaseCero es una web que tu navegador guarda como aplicación: icono propio, pantalla completa y funcionamiento sin conexión. Abre [basecero.alvarotc.com](https://basecero.alvarotc.com) y, según lo que uses:

- **Android, con Chrome.** Acepta el aviso «Instalar aplicación» si aparece. Si no aparece: menú ⋮ → «Añadir a pantalla de inicio».
- **iPhone y iPad, solo con Safari.** Botón Compartir → «Añadir a pantalla de inicio». Tiene que ser Safari: iOS no permite instalar aplicaciones web desde Chrome ni Firefox. Es una limitación de Apple, no de BaseCero.
- **Escritorio, con Chrome o Edge.** Icono de instalar, a la derecha de la barra de direcciones → «Instalar BaseCero».

Tarda diez segundos y no pide nada a cambio: ni correo, ni registro, ni permisos. A partir de ahí la abres desde su icono y funciona sin conexión. Para desinstalarla basta con borrar el icono, y con él se van tus datos — así que exporta una copia antes.

## Empieza en cero

El código está en [github.com/alvarotorresc/basecero](https://github.com/alvarotorresc/basecero), con licencia MIT y sin nada escondido. Si llevas tus gastos a mano y quieres seguir siendo dueño de ellos, BaseCero es tuya: pruébala una tarde con el mes que estés cursando y verás enseguida si te encaja.

Y si le falta algo, o algo no cuadra, el sitio para decirlo es el repositorio. Ahí lo leo y ahí contesto, en abierto.

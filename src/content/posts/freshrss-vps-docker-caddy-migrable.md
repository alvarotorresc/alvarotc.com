---
title: 'Monta un servicio en tu VPS hoy y múdalo a tu homelab mañana: FreshRSS con Docker y Caddy'
description: 'Cómo desplegar un lector RSS autoalojado de forma que migrarlo después cueste un rsync y un cambio de DNS. Subdominio o ruta, CLI dentro del contenedor, WebSub y un backup que sí se ha restaurado.'
date: 2026-09-02
draft: false
tags: ['self-hosted', 'docker', 'caddy', 'vps', 'homelab', 'rss']
---

Quería un lector RSS propio y lo quería ya. El homelab que lo va a alojar todavía no tiene ni sistema operativo. Así que lo desplegué en el VPS que ya tengo, con una condición: que mudarlo a casa dentro de unas semanas cueste un `rsync` y un cambio de DNS.

Este post es ese despliegue. Pero sobre todo son las decisiones que hacen que un servicio sea portable desde el primer día, que valen para cualquier cosa que montes con Docker.

## El contexto

El punto de partida es un VPS con Docker Compose y Caddy como proxy inverso, con varios servicios en producción bajo `/opt/services/`. El servicio nuevo es [FreshRSS](https://freshrss.org/): PHP con SQLite, un solo contenedor, y una API compatible con Google Reader que entienden los clientes móviles sin escribir nada.

La elección de SQLite no es un detalle. Significa que **todo el estado del servicio vive en un directorio**: base de datos, configuración, usuarios y contraseña de la API. Y un servicio cuyo estado cabe en un directorio es un servicio que se muda con un `tar`.

## Diseñar para migrar: cinco reglas

Antes de tocar el servidor, fijé cinco condiciones. Si se cumplen, la migración es trivial. Si falta una, se convierte en un proyecto.

1. **Docker Compose desde el minuto uno**, versionado en git. Nada instalado a mano en el host.
2. **Todo el estado en un único directorio** con bind mounts. Migrar es parar, copiar el directorio y arrancar.
3. **Configuración y secretos fuera de la imagen**: en un `.env` o en la interfaz de la aplicación, nunca en el código.
4. **Subdominio propio con TTL bajo**. Cambiar de máquina será cambiar un registro.
5. **Nada del proveedor del VPS**: ni base de datos gestionada, ni almacenamiento de objetos suyo, ni unidades de systemd ajustadas a mano.

## Subdominio o ruta: la decisión que más pesa

El plan inicial era servir el lector en una ruta, `https://example.com/rss`, "sobre el dominio que ya sirve el proxy". Antes de tocar nada hice la comprobación más barata que existe:

```bash
getent hosts example.com
```

Y la raíz del dominio no apuntaba al VPS. Estaba en otro proveedor, sirviendo una web estática. El VPS solo servía subdominios. La premisa del plan era falsa, y nadie lo habría sabido hasta ver un 404 misterioso.

Aunque hubiera sido cierta, la ruta tiene dos problemas estructurales:

- **Ata el servicio a la máquina que sirva la raíz.** Mientras viva en `/rss`, no puede moverse sin mover también todo lo que cuelga del dominio, o sin dejar el proxy viejo reenviando tráfico al sitio nuevo. Y entonces la máquina vieja no se jubila.
- **Es el punto delicado de cualquier aplicación web.** El proxy tiene que decidir si elimina el prefijo o lo conserva, la aplicación tiene que conocer su URL pública completa, y si las dos cosas no coinciden el síntoma es CSS roto o redirecciones en bucle.

Con un subdominio, `rss.example.com`, la migración es un registro DNS y el bloque del proxy son dos líneas. Lección: **la primera regla de "detecta, no asumas" se aplica también al plan que te dice que detectes.**

## El despliegue

Estructura en el host:

```
/opt/services/rss/
  compose.yaml
  data/          # todo el estado: SQLite, config, usuarios, favicons
  extensions/    # vacío
```

El `compose.yaml` completo:

```yaml
services:
  freshrss:
    image: freshrss/freshrss:latest
    container_name: freshrss
    restart: unless-stopped
    environment:
      TZ: Europe/Madrid
      CRON_MIN: '13,43' # refresco de feeds dos veces por hora
      FRESHRSS_ENV: production
    volumes:
      - ./data:/var/www/FreshRSS/data
      - ./extensions:/var/www/FreshRSS/extensions
    networks:
      - proxy

networks:
  proxy:
    external: true # la red que comparte con Caddy
```

No publica puertos. Caddy llega al contenedor por la red interna `proxy`, y el contenedor solo escucha en el puerto 80 de esa red. La imagen oficial, además, ajusta sola los permisos de `data/` al arrancar (los directorios quedan de `root:www-data`), así que no hay que hacer el clásico `chown` a ciegas.

El bloque de Caddy, siguiendo el mismo patrón que el resto de servicios del servidor:

```
rss.example.com {
    reverse_proxy freshrss:80
}
```

Antes, un registro A en el DNS apuntando `rss` a la IP del VPS. Si tu DNS está en Cloudflare, **sin proxy** (nube gris): Caddy necesita recibir directamente el reto de Let's Encrypt.

Y el paso que más miedo da en un servidor con cosas en producción, recargar el proxy, no tiene por qué darlo:

```bash
docker exec caddy caddy validate --config /etc/caddy/Caddyfile
docker exec caddy caddy reload   --config /etc/caddy/Caddyfile
```

Validar primero, recargar después. La recarga es en caliente: los otros servicios no se enteran. Diez segundos más tarde el log de Caddy muestra el reto `http-01` llegando desde dos IPs de Let's Encrypt y un `certificate obtained successfully`. HTTPS válido, cero configuración de certificados.

## Configurar por CLI sin que las contraseñas pasen por la terminal

El asistente web lo completa una persona en el navegador: base de datos SQLite, usuario, contraseña. Es la forma de que la contraseña no aparezca en ningún historial ni en ningún log.

El resto va por CLI. FreshRSS trae sus scripts en `cli/`, y hay que ejecutarlos como el usuario del servidor web:

```bash
docker compose exec -T --user www-data freshrss ./cli/reconfigure.php --api-enabled
```

Eso habilita la API que usan los clientes móviles. La `base_url` la detectó sola a partir de las cabeceras que envía Caddy, precisamente porque el servicio vive en la raíz de un subdominio.

Dos trampas que me costaron minutos:

**`docker exec` se come la entrada estándar.** Si lanzas un guion por `ssh host 'bash -s' <<EOF`, cualquier `docker exec` dentro hereda stdin y absorbe el resto del guion. Bash se queda sin líneas y termina limpio, sin error. Las líneas siguientes nunca se ejecutan. Arreglo: `</dev/null` en cada `docker exec`.

**No hay CLI para borrar un feed.** El asistente crea un feed de ejemplo y quería empezar en blanco. La tentación es abrir la SQLite y hacer un `DELETE`. La opción sana es usar la API interna de la aplicación, reutilizando el mismo arranque que usan sus scripts oficiales:

```php
<?php
require '/var/www/FreshRSS/cli/_cli.php';
cliInitUser('admin');
$feedDAO = FreshRSS_Factory::createFeedDao();
$feed = $feedDAO->searchByUrl('https://github.com/FreshRSS/FreshRSS/releases.atom');
if ($feed !== null) {
    $feedDAO->deleteFeed($feed->id());
}
```

Se copia al contenedor con `docker compose cp` y se ejecuta con `php`, como `www-data`. Doce líneas, y la base de datos la toca la aplicación, no yo.

Las suscripciones iniciales van en un OPML e importadas también por CLI, con `import-for-user.php --user admin --filename /tmp/feeds.opml`.

## Dos sorpresas en el primer refresco

**Un feed devolvía HTTP 202.** No es un error, es "aceptado", y por eso FreshRSS no sabía qué hacer con él. Probé el mismo feed desde el VPS con tres user-agents: con el de curl, 200 y XML; con el de FreshRSS, 200 y XML; con el de un navegador, 202 y página vacía. Era la CDN del medio sirviendo su reto antibots, y lo decide por heurística: al mismo cliente le da 200 una vez y 202 la siguiente. No merece la pena pelearse con el user-agent. Cambié la fuente por otra equivalente.

**Otro feed se suscribió solo.** En el log apareció `WebSub subscribe … 204`. Ese medio anuncia un _hub_, FreshRSS le pidió que le avisara al publicar y el hub aceptó. Los artículos llegan por push, en segundos, sin esperar al refresco. Tiene una consecuencia para la migración: el push funciona porque el servicio es alcanzable desde internet. Si en el homelab acaba detrás de una VPN, el hub no podrá llamar al _callback_ y volverá al sondeo. No es grave, pero es un dato que inclina la balanza hacia un proxy inverso público.

## Backup: parar, comprimir, arrancar, y restaurar de verdad

Con SQLite el backup coherente más simple es parar el contenedor un instante. El script completo:

```bash
#!/usr/bin/env bash
set -euo pipefail
SRC=/opt/services/rss
DEST=/opt/backups/rss
KEEP_DAYS=14
FILE="$DEST/rss-data-$(date +%Y-%m-%d_%H%M).tar.gz"

mkdir -p "$DEST"
cd "$SRC"
docker compose stop freshrss >/dev/null
trap 'docker compose start freshrss >/dev/null' EXIT   # pase lo que pase, arranca

tar -czf "$FILE" --numeric-owner data
find "$DEST" -name 'rss-data-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) OK $FILE"
```

El `trap` es la línea importante: si el `tar` falla, el contenedor arranca igual. Parada medida: un segundo. Programado en `/etc/cron.d/rss-backup` como root, porque `data/` no es legible por el usuario normal:

```
17 4 * * * root /opt/services/rss/backup.sh >> /var/log/rss-backup.log 2>&1
```

Y lo que casi nadie hace: **probar la restauración el mismo día**. Extraer la copia en un temporal y preguntarle a la base si está entera:

```bash
T=$(mktemp -d) && sudo tar -xzf "$FILE" -C "$T"
sudo python3 -c "
import sqlite3; c = sqlite3.connect('$T/data/users/admin/db.sqlite')
print(c.execute('pragma integrity_check').fetchone()[0])
print(c.execute('select count(*) from feed').fetchone()[0], 'feeds')"
```

`ok`, y el número de feeds que esperaba. Un backup que nunca se ha restaurado es una esperanza, no un backup.

Esto cubre errores de aplicación: una categoría borrada, una actualización de `latest` que rompe la base. No cubre la muerte del VPS. Para eso, la copia de máquina entera del proveedor es la capa complementaria: barata, sin mantenimiento, y con siete días de retención. Son dos capas para dos fallos distintos.

## La migración que viene

Cuando el homelab esté listo, el procedimiento entero:

```bash
# En el VPS
docker compose stop freshrss
sudo rsync -a --numeric-ids /opt/services/rss/ homelab:/opt/services/rss/
# En el homelab
docker network create proxy
docker compose pull && docker compose up -d
# Cambiar el registro A de rss.example.com
```

Una regla: la versión de la imagen en destino debe ser **igual o más nueva** que en origen. SQLite se actualiza hacia delante y no hay vuelta atrás. Y el cliente móvil no necesita ningún cambio: misma URL, mismo usuario.

## Lo que aprendí

- **Un servicio con el estado en un directorio es un servicio portable.** Si la aplicación te deja elegir SQLite y eres un solo usuario, elígelo.
- **Subdominio antes que ruta**, siempre que puedas. La ruta te ata a quien sirva la raíz y es donde se rompen las cosas.
- **Comprueba el DNS antes de creerte el plan.** Un `getent hosts` cuesta un segundo y te ahorra un despliegue en falso.
- **Valida y recarga el proxy en caliente.** No hace falta reiniciar nada en producción para añadir un servicio.
- **Si no hay CLI para algo, usa la API interna de la aplicación**, no su base de datos.
- **Cada `docker exec` dentro de un guion por stdin necesita `</dev/null`.** Lo verás en todos los scripts de despliegue del mundo una vez lo sepas.
- **El backup se prueba el mismo día que se crea.** `pragma integrity_check` son dos palabras.

El homelab todavía no existe. Y ya tiene su primer servicio en producción esperándole.

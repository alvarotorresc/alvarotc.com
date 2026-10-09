# Runbook — alvarotc.com

Operación del sitio y de los servicios que dependen de él. Ver también `docs/CONTINUIDAD.md` (proveedores y accesos) y `LAUNCH_GATE_REPORT.md` (estado de lanzamiento, no modificar).

## Despliegue

- Producción se despliega automáticamente en Vercel al hacer push/merge a `main` (integración GitHub ↔ Vercel del repo `alvarotorresc/alvarotc.com`).
- Cada Pull Request genera un preview automático en Vercel con su propia URL (`https://alvarotc-<hash>-alvarotorrescs-projects.vercel.app`, por ejemplo). Los previews llevan `x-robots-tag: noindex`.
- `.github/workflows/ci.yml` corre en push a `main` y en PRs contra `main`: lint, `astro check`, `npm run build`, `npm run test` y Lighthouse CI (móvil y escritorio). `main` está protegida (desde el 2026-10-09): solo entra por PR, con los checks `check` y `lighthouse` en verde, sin force-push y sin excepción para administradores. Vercel despliega cada push a `main`, así que el gate es la protección de la rama.
- Comandos locales antes de mergear:
  ```bash
  npm ci
  npm run lint
  npm run build
  npm run test
  ```

## Rollback

1. Vercel dashboard → proyecto `alvarotc.com` → pestaña **Deployments**.
2. Localizar el despliegue de producción anterior que funcionaba bien.
3. Menú `···` de ese despliegue → **Promote to Production**.
4. Confirmar en `https://alvarotc.com` (el apex es el host que sirve el contenido; `www` y `http` redirigen 308 al apex, comprobado el 2026-10-06).

No hace falta revertir commits en git para un rollback rápido: promocionar un despliegue anterior no borra el historial ni el commit en `main`.

## Restauración

- **Contenido** (posts, proyectos, páginas): vive en `src/content/` bajo git. Para recuperar una versión anterior de un fichero o carpeta:

  ```bash
  git checkout <commit> -- src/content/<ruta>
  ```

  y hacer commit del resultado. Alternativa sin tocar git: promocionar un despliegue anterior en Vercel (ver Rollback).

- **`src/data/generated/stats.json`**: lo regenera `.github/workflows/refresh-stats.yml` cada día a las 05:00 UTC. Cuidado: `npm run stats` en local **sin** las credenciales completas no restaura nada — `scripts/fetch-data.mjs` marca cada fuente sin credenciales como "omitida" (no como "fallo"), y `buildStats()` (`scripts/lib/stats-file.mjs`) solo conserva el dato anterior cuando una fuente _falla_, no cuando se omite; con las variables vacías el fichero se sobrescribe con esas secciones en `null`. Opciones seguras para restaurar o forzar el refresco:
  1. Recuperar la versión anterior desde git:
     ```bash
     git checkout <commit> -- src/data/generated/stats.json
     ```
  2. Forzar el workflow (tiene `workflow_dispatch`):
     ```bash
     gh workflow run refresh-stats.yml --repo alvarotorresc/alvarotc.com
     ```
  3. Ejecutarlo en local con todas las credenciales presentes:
     ```bash
     GITHUB_TOKEN=$(gh auth token) UMAMI_API_KEY=<clave> UMAMI_WEBSITE_ID=<id> npm run stats
     ```
  4. Esperar al cron diario.

  Aviso: el workflow hace commit y push directo a `main` cuando el JSON cambia, lo que dispara un nuevo despliegue de producción cada vez que hay datos nuevos.

## Rotación de secretos

| Secreto                                                                                                                                                                                            | Se genera en                                                                                                                                                                              | Se pega en                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEEPL_API_KEY`                                                                                                                                                                                    | Cuenta DeepL (plan API Free) → Claves API                                                                                                                                                 | `.env` local de cada máquina de desarrollo (no es secreto de GitHub Actions: solo lo usa el hook `pre-commit` y `npm run translate` en local)                                                                                                        |
| `STATS_GITHUB_TOKEN`                                                                                                                                                                               | GitHub → Settings de usuario → Developer settings → Personal access tokens (o dejar sin definir: el workflow cae en `secrets.GITHUB_TOKEN`, el token automático del propio run)           | Repo `alvarotorresc/alvarotc.com` → Settings → Secrets and variables → Actions                                                                                                                                                                       |
| `UMAMI_API_KEY`                                                                                                                                                                                    | Panel de Umami (`https://analytics.alvarotc.com`) → Settings → API keys (Umami 3.4+)                                                                                                      | Repo `alvarotorresc/alvarotc.com` → Settings → Secrets and variables → Actions                                                                                                                                                                       |
| `UMAMI_WEBSITE_ID`                                                                                                                                                                                 | Panel de Umami → Settings → Websites → sitio → ID                                                                                                                                         | Como secreto de Actions (`UMAMI_WEBSITE_ID`) y como variable de entorno de Vercel `PUBLIC_UMAMI_WEBSITE_ID` (Vercel → proyecto `alvarotc.com` → Settings → Environment Variables) — esta última se lee en build, así que un cambio exige un redeploy |
| `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` / `VPS_SSH_FINGERPRINT`                                                                                                                                    | Par de claves SSH de un usuario de despliegue en el VPS; huella con `ssh-keyscan -t ed25519 <host> \| ssh-keygen -lf -`                                                                   | Repo `alvarotorresc/alvarotc-contact` → Settings → Secrets and variables → Actions (secretos creados el 2026-09-26)                                                                                                                                  |
| Variables del `.env` del servicio de contacto (`SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`, `MAIL_TO`, `ALLOWED_ORIGINS`, `IP_HASH_SALT`, `RATE_GUARD`, `RATE_LIMIT`, `RATE_WINDOW_MS`, `MIN_FILL_MS`) | Directamente en el VPS: `SMTP_USER`/`SMTP_PASS` los da Proton Mail Bridge (re-ejecutar `bridge init` → `login` → `info`, ver sección Contacto); `IP_HASH_SALT` con `openssl rand -hex 32` | `/opt/services/alvarotc-contact/.env` en el VPS, luego `docker compose up -d contact` para recargar                                                                                                                                                  |
| Token de Telegram (Upptime)                                                                                                                                                                        | Bot creado con @BotFather (`NOTIFICATION_TELEGRAM_BOT_KEY`) y `chat_id` del canal/grupo (`NOTIFICATION_TELEGRAM_CHAT_ID`)                                                                 | Repo `alvarotorresc/upptime` → Settings → Secrets and variables → Actions (ya existen, junto con `GH_PAT` y `NOTIFICATION_TELEGRAM`)                                                                                                                 |

Comprobado el 2026-09-25: `gh secret list --repo alvarotorresc/alvarotc.com` no devuelve ningún secreto. Es decir, `STATS_GITHUB_TOKEN`, `UMAMI_API_KEY` y `UMAMI_WEBSITE_ID` probablemente **no están creados todavía** en ese repositorio — hay que darlos de alta, no solo rotarlos, antes de que el cron de stats tenga datos reales de Umami.

## Mantenimiento / página temporal

No hay un modo de mantenimiento configurado (`vercel.json` solo tiene redirecciones, cabeceras y `trailingSlash`). Mientras no se añada, la forma disponible con las herramientas actuales es reutilizar el mecanismo de rollback:

1. Preparar un despliegue mínimo (una página estática de aviso) y dejarlo desplegado como preview en Vercel.
2. Vercel → Deployments → ese preview → **Promote to Production**.
3. Cuando termine el mantenimiento, promocionar de nuevo el despliegue de producción real (el que estaba activo antes) de la misma forma.

Decidido el 2026-10-09: la protección de despliegues de Vercel se queda sin activar. Los previews ya llevan `x-robots-tag: noindex` y el rollback de arriba basta como página temporal.

## Logs

- **Vercel**: dashboard → proyecto `alvarotc.com` → cada despliegue tiene sus **Build Logs**; el sitio es estático (`output: 'static'` en `astro.config.mjs`), así que no hay logs de funciones serverless en tiempo real más allá de esos logs de build.
- **Caddy (VPS)**: `docker logs caddy`, o `docker compose logs caddy` desde `/opt/services/caddy`. El Caddyfile está en `/opt/services/caddy/Caddyfile` (contenedor `caddy`, red `proxy`); tras editarlo, `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`.
- **Servicio de contacto (VPS)**:
  ```bash
  cd /opt/services/alvarotc-contact
  docker compose logs contact
  docker compose logs protonmail-bridge
  ```
- **Umami (VPS)**: autoalojado en `analytics.alvarotc.com`, mismo VPS que el contacto; contenedores `umami` y `umami-db` del compose `/opt/services/docker-compose.yml` (proyecto `services`; comprobado el 2026-10-09). Logs: `cd /opt/services && docker compose logs umami`.

## Servicio de contacto

Estado a día de hoy (2026-09-25): **no está desplegado**. `contact.alvarotc.com` no tiene registro DNS y el repositorio `alvarotorresc/alvarotc-contact` no existe todavía en GitHub (`gh repo view alvarotorresc/alvarotc-contact` falla). Lo que sigue es el procedimiento documentado en el README de `alvarotc-contact` para cuando se despliegue (ver también `LAUNCH_GATE_REPORT.md`, acción 1 / ABU-03).

- **Health check**:

  ```bash
  curl -s https://contact.alvarotc.com/health
  ```

  Responde `{"ok":true,"smtp":true}`. Da 503 si Proton Mail Bridge no acepta SMTP, 500 si el propio chequeo lanza un error inesperado. `docker ps` puede marcar el contenedor `contact` como `unhealthy` justo después de un reinicio del VPS mientras Bridge reconecta — es esperado; comprobar `docker compose logs protonmail-bridge`.

- **Redeploy normal**: push a `main` en `alvarotc-contact` dispara CI (build + test + `docker build`) y, si pasa, `deploy.yml` construye la imagen, la publica en `ghcr.io/alvarotorresc/alvarotc-contact` y la despliega por SSH en el VPS automáticamente.

- **Redeploy manual en el VPS**:

  ```bash
  cd /opt/services/alvarotc-contact
  docker compose pull contact
  docker compose up -d contact
  ```

- **Rollback**: en `compose.yaml`, fijar la imagen del servicio `contact` al tag `sha-<commit>` que funcionaba, luego `docker compose pull contact && docker compose up -d contact`. Quitar el pin en cuanto se resuelva: si se deja, el siguiente deploy normal compara el digest recién construido contra el antiguo fijado y falla.

- **Proton Mail Bridge**: primer login (interactivo, requiere plan de pago de Proton y 2FA):

  ```bash
  docker compose up -d protonmail-bridge
  docker compose stop protonmail-bridge
  docker run --rm -it -v alvarotc-contact_protonmail-bridge:/root shenxn/protonmail-bridge:3.19.0-build init
  ```

  Dentro de la CLI de Bridge: `login` (sigue los pasos de 2FA), luego `info` para leer `SMTP_USER`/`SMTP_PASS` y pegarlos en `.env`. Salir con `exit`.

- **Caddy**: añadir/actualizar `deploy/Caddyfile.snippet` en el Caddyfile del VPS y recargar:

  ```bash
  docker exec caddy caddy reload --config /etc/caddy/Caddyfile
  ```

- **Prueba de extremo a extremo** tras cualquier cambio (no saltársela):
  ```bash
  curl -X POST https://contact.alvarotc.com/send \
    -H 'content-type: application/json' -H 'origin: https://alvarotc.com' \
    -d '{"from":"tu-correo@ejemplo.com","subject":"Prueba","body":"Mensaje de prueba con longitud suficiente.","website":"","elapsed":5000}'
  ```
  Confirmar que llega al buzón de Proton con el asunto prefijado `[contact form]` y la cabecera `X-Contact-Source: alvarotc.com`.

## Exclusión del tráfico propio en Umami

En la consola del navegador, sobre el dominio que sirve el contenido (`https://alvarotc.com`; `www` y `http` redirigen 308 al apex, comprobado el 2026-10-06):

```js
localStorage.setItem('umami.disabled', '1');
```

Es por origen y por perfil de navegador: hay que repetirlo en cada navegador/dispositivo propio que se use para revisar la web, y de nuevo si el host canónico deja de ser el apex.

## Coste mensual estimado

No inventar cifras; rellenar cuando se tengan las facturas o los paneles de facturación a mano.

| Proveedor          | Servicio                                     | Coste mensual estimado |
| ------------------ | -------------------------------------------- | ---------------------- |
| Vercel             | Hosting                                      | pendiente              |
| Hetzner            | VPS (Umami + servicio de contacto)           | pendiente              |
| Cloudflare         | Registro del dominio + DNS                   | pendiente              |
| DeepL              | API (plan Free)                              | pendiente              |
| Proton             | Correo + Mail Bridge (requiere plan de pago) | pendiente              |
| GitHub             | Actions (repo público)                       | pendiente              |
| **Total estimado** |                                              | **pendiente**          |

## Recordatorio mensual: dependencias

Una vez al mes:

```bash
npm outdated
```

A fecha del último Launch Gate (2026-09-24) había majors pendientes: React 19, Framer Motion 13, `@astrojs/react` 7 y TypeScript 7. Dependabot security updates estaba desactivado en el repo (`LAUNCH_GATE_REPORT.md` SEC-11) — revisar si sigue así y activarlo o añadir `.github/dependabot.yml`.

## Contactos y soporte por proveedor

- **Vercel**: `vercel.com/help` · estado: `https://www.vercel-status.com`
- **GitHub**: `support.github.com` · estado: `https://www.githubstatus.com`
- **Cloudflare**: soporte desde el dashboard (`dash.cloudflare.com`) · estado: `https://www.cloudflarestatus.com`
- **Hetzner**: ticket desde `console.hetzner.cloud` · estado: `https://status.hetzner.com`
- **DeepL**: `support.deepl.com`
- **Proton**: `proton.me/support` · estado: `https://status.proton.me`
- **Telegram** (bot de Upptime): `core.telegram.org/bots` (sin cuenta de soporte comercial)
- **Umami** (autoalojado, sin soporte comercial): incidencias en `github.com/umami-software/umami`

## Pendiente de rellenar por el dueño

- Cifras reales de la tabla de coste mensual, por proveedor.
- Crear (si aún no existen) los secretos `STATS_GITHUB_TOKEN`, `UMAMI_API_KEY` y `UMAMI_WEBSITE_ID` en `alvarotorresc/alvarotc.com` → Settings → Secrets and variables → Actions (a día de hoy `gh secret list` no devuelve ninguno).
- Crear el repositorio `alvarotorresc/alvarotc-contact` en GitHub y sus secretos `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_FINGERPRINT` (hoy no existe).
- Ruta exacta del `docker compose` de Caddy y del de Umami en el VPS, para poder documentar sus logs con precisión.
- Confirmar si el panel de Vercel tiene enlazado el CI como gate obligatorio antes de desplegar.
- Decidir si se quiere una página de mantenimiento real (`vercel.json` con redirección, o Deployment Protection de Vercel) en vez del procedimiento manual descrito arriba.
- Alertas de gasto activadas (o no) en Vercel, Hetzner, Cloudflare y DeepL, y su umbral.

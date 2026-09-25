# Lanzamiento de alvarotc.com: lo que queda por tu parte

Fecha: 2026-09-25 · Rama: `redesign/cv-web` · Base: `LAUNCH_GATE_REPORT.md` (24 sep)

Lo que se podía resolver en código ya está en la rama: cabeceras de seguridad y CSP, aviso legal y
política de privacidad, licencia AGPL coherente, pie con enlaces legales y estado, OG por defecto,
iconos y manifest, SEO de títulos y descripciones, LCP del listado de proyectos, dependencias,
Dependabot, lint limpio, tests estables en checkout limpio, `security.txt`, barra final, runbook,
continuidad y changelog.

Lo que sigue no se puede hacer desde el repo. Está ordenado por lo que bloquea el lanzamiento.

---

## 1. Vercel: poner `alvarotc.com` como dominio principal

Hoy Vercel redirige el apex a `www`, pero todo el sitio (canonicals, sitemap, hreflang, OG, feeds)
está generado con `https://alvarotc.com`. Cada URL que compartas o indexe Google pasa por un 308.

1. Vercel → proyecto → Settings → Domains.
2. En `alvarotc.com` elige **Set as primary** (o edita y marca "Primary").
3. En `www.alvarotc.com` deja **Redirect to alvarotc.com** con código 308.
4. Comprueba:

```bash
curl -sI https://alvarotc.com/ | head -1        # HTTP/2 200
curl -sI https://www.alvarotc.com/ | grep -i location   # https://alvarotc.com/
```

No hace falta tocar DNS en Cloudflare para esto: los registros que ya apuntan a Vercel siguen
valiendo.

## 2. Desplegar el servicio del formulario de contacto

El formulario envía a `https://contact.alvarotc.com/send` y ese host no existe. El servicio ya está
programado y probado en `~/Documents/apps/alvarotc-contact` (commit `bf67fc4`), pero no tiene repo
en GitHub ni está en el VPS. El README de ese repo tiene el runbook completo; este es el resumen en
orden:

1. **GitHub**: crea el repo `alvarotorresc/alvarotc-contact` y súbelo.

   ```bash
   cd ~/Documents/apps/alvarotc-contact
   gh repo create alvarotorresc/alvarotc-contact --public --source=. --push
   ```

2. **Secretos del repo** (Settings → Secrets and variables → Actions): `VPS_HOST`, `VPS_USER`
   (usuario que pueda ejecutar `docker compose` en `/opt/services/alvarotc-contact`),
   `VPS_SSH_KEY` (clave privada de ese usuario) y `VPS_SSH_FINGERPRINT`:

   ```bash
   ssh-keyscan -t ed25519 <ip-del-vps> | ssh-keygen -lf -    # copia el valor SHA256:...
   ```

3. **VPS, carpeta y .env**:

   ```bash
   mkdir -p /opt/services/alvarotc-contact && cd /opt/services/alvarotc-contact
   # copia compose.yaml y .env.example desde el repo
   cp .env.example .env
   sed -i "s/^IP_HASH_SALT=.*/IP_HASH_SALT=$(openssl rand -hex 32)/" .env
   chmod 600 .env
   ```

   Rellena `MAIL_FROM` (tu dirección de Proton) y deja `MAIL_TO=hello@alvarotc.com`. Hace falta que
   la red Docker externa `proxy` exista y que Caddy esté en ella (`docker network ls`).

4. **Proton Mail Bridge** (necesita plan de pago de Proton y 2FA una sola vez):

   ```bash
   docker compose up -d protonmail-bridge && docker compose stop protonmail-bridge
   docker run --rm -it -v alvarotc-contact_protonmail-bridge:/root shenxn/protonmail-bridge:3.19.0-build init
   ```

   Dentro: `login`, sigue el 2FA, `info` para leer usuario y contraseña SMTP, `exit`. Pega esos
   valores en `.env` como `SMTP_USER` y `SMTP_PASS`.

5. **Cloudflare DNS**: registro `A contact` → IP del VPS, **nube gris** (DNS only). Con la nube
   naranja el límite por IP dejaría de funcionar porque todos los visitantes llegarían con IPs de
   Cloudflare.

6. **Primer despliegue**: haz push a `main` del repo del servicio. CI construye la imagen en
   `ghcr.io/alvarotorresc/alvarotc-contact` y el job Deploy la arranca por SSH. Si la imagen queda
   privada, o la haces pública (GitHub → Packages → Change visibility) o haces `docker login ghcr.io`
   en el VPS con un token `read:packages`.

7. **Caddy**: añade el bloque de `deploy/Caddyfile.snippet` al Caddyfile del VPS y recarga:

   ```bash
   docker exec caddy caddy reload --config /etc/caddy/Caddyfile
   ```

8. **Comprobación**:

   ```bash
   curl -s https://contact.alvarotc.com/health      # {"ok":true,"smtp":true}
   curl -X POST https://contact.alvarotc.com/send -H 'content-type: application/json' \
     -H 'origin: https://alvarotc.com' \
     -d '{"from":"tu@correo.real","subject":"Prueba","body":"Mensaje de prueba suficientemente largo.","website":"","elapsed":5000}'
   ```

   El correo debe llegar a tu buzón con el prefijo `[contact form]` y tu dirección en reply-to. Luego
   manda uno más desde el formulario de la web (preview de Vercel vale) y otro a `hello@alvarotc.com`
   directamente. Para probar el límite: 20 envíos seguidos desde una preview deben acabar rechazados.

9. **Upptime**: añade `https://contact.alvarotc.com/health` en `.upptimerc.yml` del repo
   `alvarotorresc/upptime`.

## 3. Cloudflare DNS: correo y certificados

Tres registros TXT/CAA, en Cloudflare → DNS → Records:

| Tipo | Nombre   | Contenido                                                                                                         |
| ---- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| TXT  | `@`      | `v=spf1 include:_spf.mx.cloudflare.net -all` (cambia `~all` por `-all`)                                           |
| TXT  | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:hello@alvarotc.com` (sube a `p=reject` tras dos semanas sin falsos positivos) |
| CAA  | `@`      | `0 issue "letsencrypt.org"`                                                                                       |

Vercel emite con Let's Encrypt. Antes de guardar el CAA mira en la documentación de Vercel si
menciona otra CA (Google Trust Services, por ejemplo) y añádela con otro registro `issue`.

## 4. GitHub: secretos y ajustes del repo de la web

En `alvarotorresc/alvarotc.com`:

1. **Secretos de Actions** (hoy no hay ninguno; el cron diario de `stats.json` corre sin datos):
   `STATS_GITHUB_TOKEN` (token clásico o fine-grained con lectura de repos públicos),
   `UMAMI_API_KEY` y `UMAMI_WEBSITE_ID` (Umami → Settings → API keys / Websites).
2. **Dependabot security updates**: Settings → Code security → activar "Dependabot security
   updates". El fichero `.github/dependabot.yml` ya está en la rama.
3. **Vercel env**: confirma que `PUBLIC_UMAMI_WEBSITE_ID` está en Production.

## 5. Contenido que sigue con datos de relleno

Se publicaría tal cual, y es visible:

- `[DATO]` en `src/content/about/*.md` (ambos idiomas) y en los proyectos `quedamos` y `huellas`
  (`src/content/projects/{es,en}/`). Están marcados en el HTML de `/about/`, `/projects/quedamos/`
  y `/projects/huellas/`.
- Fotos de las polaroids de About: hoy son de relleno. Hacen falta cuatro fotos 4:5.
- Experiencia (`src/content/experience/*.yaml`): la rellenas tú.
- Imágenes y vídeos de los proyectos: el formato por campo está en la conversación del 25 sep
  (icono 512, promo 16:9, capturas 390×844 o 16:10, vídeo como URL de YouTube).

Si algún dato no va a estar para el lanzamiento, retira la sección en vez de dejar el marcador.

## 6. Tres decisiones que he tomado y debes confirmar

1. **Licencia AGPL-3.0-or-later** para el código. El pie ya lo decía; el README decía MIT y había un
   LICENSE MIT del scaffold. Si prefieres MIT, se cambian `LICENSE`, `package.json`, README y las
   dos claves `footer.privacy*` de `translations.ts`.
2. **Vercel Web Analytics**: retirado el 25 sep 2026 (`@vercel/analytics` fuera del layout y de
   `package.json`, párrafo borrado de las páginas de privacidad). Umami autoalojado es la única
   analítica.
3. **Hook de pre-commit que traduce con DeepL**: cualquier edición de un post en español retraduce
   y sobreescribe el post en inglés emparejado. Hoy ha estado a punto de destrozar cuatro posts; se
   evitó porque el worktree no tenía `DEEPL_API_KEY`. Recomiendo que el hook solo traduzca cuando
   el fichero inglés no exista. Dime si lo cambio.

## 7. Antes de mergear a `main`

1. Abre el PR `redesign/cv-web` → `main`. Es la primera vez que CI corre para esta rama: lint,
   `astro check`, build, tests y Lighthouse CI. Si Lighthouse baja de 0,95 en rendimiento, avísame:
   se ha retirado el preload de Manrope (mejora FCP, retrasa la fuente) y puede mover la cifra.
2. En la preview de Vercel del PR:

   ```bash
   P=https://<preview>.vercel.app
   curl -sI $P/ | grep -iE 'content-security-policy|x-frame|referrer|permissions'
   curl -sI $P/.well-known/security.txt | head -1     # 200, no 308
   curl -sI $P/blog/de-una-idea-a-una-apk-en-24h.md | head -1   # 200, no 308 (ruta es: /es/blog/...)
   curl -sI $P/blog | head -1                          # 308 hacia /blog/
   ```

   Abre la preview con la consola: la barra de Vercel (`vercel.live`) puede dar violaciones de CSP
   solo en previews, no en producción. Cualquier otra violación, me la pasas.

3. Revisa el PR con la lista OWASP a mano (tarea QA-06 del gate). Son 160 commits.
4. Mergea y crea el tag:

   ```bash
   git tag -a v1.0.0 -m "alvarotc.com 1.0.0" && git push origin v1.0.0
   ```

## 8. El día del lanzamiento

1. Producción: repite los `curl` del punto 7 contra `https://alvarotc.com`.
2. Search Console: el TXT de verificación ya está en DNS. Envía `https://alvarotc.com/sitemap-index.xml`
   y comprueba que no da errores. Lo mismo en Bing Webmaster.
3. Comparte la home y un post por WhatsApp o Slack para ver la OG nueva.
4. Upptime en verde, `stats.json` refrescado por el cron, consola limpia en producción.
5. Pon `localStorage.setItem('umami.disabled', '1')` en la consola de tus navegadores para no
   contarte a ti mismo.

## 9. Cuentas y seguridad (checklist)

- [ ] Cloudflare Registrar: renovación automática activa y tarjeta válida (`alvarotc.com` caduca
      2027-04-25). Alerta de caducidad activada.
- [ ] 2FA y correo de recuperación en Cloudflare, Vercel, GitHub, Hetzner, Umami, DeepL, Proton y
      Telegram.
- [ ] Alertas de gasto en Vercel, Hetzner, Cloudflare y DeepL. GitHub Actions sin minutos de pago
      (repo público).
- [ ] Confirma que `alvarotorresc` (GitHub), `alvaro-torres-carrasco` (LinkedIn) y
      `torresc_alvaro` (X) son tuyos: son los que enlaza el pie.
- [ ] Rellena los «por confirmar» de `RUNBOOK.md` y `docs/CONTINUIDAD.md` (costes, gestor de
      contraseñas, persona de contacto).

## 10. Pruebas manuales que no puedo hacer

- Home, un proyecto, un post y el formulario en un iPhone y un Android físicos, vertical y
  horizontal, con el teclado abierto.
- Las mismas páginas en Firefox y Safari de escritorio con la consola abierta: cero errores.
- Home y formulario con Orca o VoiceOver sin mirar la pantalla.
- DevTools con "Slow 3G" y CPU 4x: el texto debe aparecer antes que las islas.

## 11. Pendientes de código no bloqueantes (los hago cuando quieras)

- Paleta de comandos con `client:idle` carga 43 KB de React en la home; pasarla a carga bajo
  demanda (PERF-05).
- Cinco PNG/JPG originales quedan huérfanos en `dist/_astro` (379 KB el de BaseCero) porque
  `isVerticalImage` lee `.height` del asset; nadie los enlaza, solo pesan en el deploy.
- `src/pages/es/404.astro` se compila a `es/404/index.html` y Vercel nunca lo sirve como 404.
- `public/screenshot.png` pesa 0 bytes.
- Pasar ZAP baseline contra una preview y guardar el informe (SEC-20).
- Siete avisos altos de `npm audit` quedan en `@lhci/cli`, solo CI; se pueden ignorar o mover a
  `npx @lhci/cli` en el workflow.

# Continuidad — alvarotc.com

Qué proveedores sostienen el sitio, qué depende de cada uno y qué hacer si el titular (Álvaro Torres Carrasco) no está disponible. Complementa `RUNBOOK.md`.

## Proveedores y qué depende de cada uno

| Proveedor      | Cuenta / uso                                                                                                                                                                                                                                                                             | Qué se cae si falla el acceso                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Cloudflare** | Registrador del dominio `alvarotc.com`, DNS de todos los subdominios (`www`, `analytics`, `status`, `contact`), Email Routing de `hello@alvarotc.com`                                                                                                                                    | Todo: sin DNS no resuelve nada; sin renovación, se pierde el dominio                                                                 |
| **Vercel**     | Hosting del sitio (build y deploy desde GitHub), certificado TLS (renovación automática vía Let's Encrypt), variable de entorno `PUBLIC_UMAMI_WEBSITE_ID`, Vercel Analytics                                                                                                              | El sitio en sí (`alvarotc.com` / `www.alvarotc.com`)                                                                                 |
| **GitHub**     | Repositorio `alvarotorresc/alvarotc.com` (código y contenido, dispara cada deploy), Actions (CI y cron `refresh-stats.yml`), repositorio `alvarotorresc/alvarotc-contact` (cuando exista, build/deploy del servicio de contacto), repositorio `alvarotorresc/upptime` (estado del sitio) | Todo el flujo de despliegue y actualización de contenido; el sitio ya desplegado sigue vivo en Vercel aunque GitHub esté inaccesible |
| **Hetzner**    | VPS (IP `178.104.74.7`) que aloja Umami (`analytics.alvarotc.com`) y, cuando se despliegue, el servicio de contacto (`contact.alvarotc.com`)                                                                                                                                             | Analítica y el formulario de contacto; no el sitio principal                                                                         |
| **Umami**      | Panel autoalojado en `analytics.alvarotc.com` (no es un proveedor de pago externo, pero tiene login y API key propios)                                                                                                                                                                   | Analítica del sitio y el bloque de `/stats` que depende de su API                                                                    |
| **DeepL**      | API (plan Free), usada solo en local por el hook de pre-commit y `npm run translate` para traducir posts ES→EN                                                                                                                                                                           | Nada en producción; sin ella, los posts nuevos hay que traducirlos a mano                                                            |
| **Proton**     | Cuenta de correo (`MAIL_FROM`) y Proton Mail Bridge, que entrega los mensajes del formulario de contacto a la bandeja real                                                                                                                                                               | La entrega de los mensajes del formulario de contacto                                                                                |
| **Telegram**   | Bot y chat usados por Upptime para las alertas de caída                                                                                                                                                                                                                                  | Las notificaciones de caída (no el propio monitor ni `status.alvarotc.com`)                                                          |
| **Cal.com**    | Previsto en la especificación de diseño (`docs/superpowers/specs/2026-09-19-cv-web-redesign-design.md`) para un botón de "reservar llamada" enlazando a la página pública de Cal.com                                                                                                     | No implementado en el código todavía; no depende de ninguna cuenta activa a día de hoy                                               |

## Dónde están las credenciales

Gestor de contraseñas: **por confirmar**. Anotar aquí cuál se usa (1Password, Bitwarden, etc.) y quién más tiene acceso a la bóveda compartida, si la hay.

## 2FA y correo de recuperación

Marcar cuando esté confirmado (no anotar aquí los correos de recuperación ni las claves reales — solo que existen y están al día):

- [ ] Cloudflare — 2FA activo, correo de recuperación válido
- [ ] Vercel — 2FA activo, correo de recuperación válido
- [ ] GitHub — 2FA activo, correo de recuperación válido, llaves de recuperación guardadas
- [ ] Hetzner — 2FA activo, correo de recuperación válido
- [ ] Umami — contraseña de administrador guardada en el gestor de contraseñas
- [ ] DeepL — 2FA activo (si el plan lo permite), correo de recuperación válido
- [ ] Proton — 2FA activo, frase de recuperación (recovery phrase) guardada
- [ ] Telegram — verificación en dos pasos activa en la cuenta del bot/administrador

## Fechas conocidas

- **Dominio `alvarotc.com`**: caduca el **2027-04-25** (WHOIS, comprobado 2026-09-24). Bloqueo de transferencia (`clientTransferProhibited`) activo. Renovación automática y tarjeta válida en Cloudflare Registrar: **por confirmar**.
- **Certificado TLS**: lo emite y renueva Vercel automáticamente vía Let's Encrypt; no requiere acción manual. El certificado visto el 2026-09-24 fue emitido el 2026-08-20 y caduca el 2026-11-18 (ya se ha renovado solo al menos una vez).
- Renovaciones anuales o de plan de Cloudflare (si hay plan de pago), Hetzner, Proton y DeepL: **por confirmar**.

## Si el titular no está disponible

Es un proyecto personal sin equipo: no hay una persona "de guardia" salvo que se designe una explícitamente. Recomendado dejar preparado, con antelación:

1. **Acceso al gestor de contraseñas** (o al menos a las entradas de Cloudflare, GitHub, Vercel y Hetzner) para una persona de confianza, aunque sea solo de lectura de emergencia.
2. **El dominio no caduque**: sin acceso a Cloudflare, nadie puede renovar `alvarotc.com` antes del 2027-04-25 (o la fecha que corresponda tras cada renovación). Es la prioridad número uno.
3. **El VPS de Hetzner siga pagado**: si deja de pagarse, se caen `analytics.alvarotc.com` y (cuando exista) `contact.alvarotc.com`; el sitio principal en Vercel sigue funcionando igualmente.
4. El repositorio de GitHub es público: el código y el contenido no se pierden aunque la cuenta quede inaccesible, pero sin acceso no se puede desplegar nada nuevo ni rotar secretos.
5. Si no hay nadie que se ocupe del correo del formulario de contacto, lo más simple es retirar el formulario o sustituirlo por un `mailto:` directo (cambio de código, no cubierto por este documento).

## Pendiente de rellenar por el dueño

- Gestor de contraseñas usado y quién tiene acceso a la bóveda compartida.
- Checklist de 2FA y correos de recuperación de la sección anterior.
- Renovación automática y validez de la tarjeta en Cloudflare Registrar.
- Persona de confianza designada como contacto de emergencia (nombre y cómo localizarla).
- Fechas de renovación de planes de pago (Cloudflare, Hetzner, Proton, DeepL) si existen.

---
title: 'Cómo monté mi VPS con observabilidad completa por menos de 5€/mes'
description: 'Docker Compose, Caddy, Upptime, Sentry, Firebase Analytics y Umami. Todo lo que necesitas para saber qué pasa en tu infra.'
date: 2026-03-26
draft: false
tags: ['devops', 'docker', 'observabilidad', 'vps', 'self-hosted']
---

Tenía varios productos desplegados en servicios gestionados. Un backend en Railway, frontends en Vercel, base de datos en Supabase. Todo funcionaba, pero no tenía ni idea de qué pasaba cuando no estaba mirando. ¿Se caía algo? ¿Cuánta gente usaba mis apps? ¿Qué errores ocurrían en producción? No tenía respuesta a ninguna de esas preguntas.

Así que me monté un VPS en Hetzner, migré lo que tenía sentido migrar, y construí un stack de observabilidad completo. Todo por menos de 5€ al mes. Aquí explico cómo, paso a paso, para que puedas replicarlo.

## El VPS: Hetzner + Docker Compose + Caddy

### Por qué Hetzner

Precio imbatible. Un CAX11 (2 vCPU ARM, 4GB RAM, 40GB disco) cuesta 3,79€/mes. Para un desarrollador indie que necesita correr un par de APIs y servicios auxiliares, es más que suficiente. Alternativas como DigitalOcean o Linode cuestan el doble por lo mismo.

Un aviso: es ARM. Las imágenes Docker que despliegues tienen que estar compiladas para `arm64`. Las oficiales lo están casi todas; las tuyas dependen de que tu CI las construya para esa arquitectura.

### Hardening básico

Lo primero después de crear el servidor: cerrarlo todo. En este orden, porque si desactivas la contraseña antes de tener tu clave dentro, te quedas fuera.

```bash
# 1. Usuario propio con sudo, y tu clave SSH copiada a ese usuario
adduser tu-usuario
usermod -aG sudo tu-usuario
# desde tu máquina: ssh-copy-id tu-usuario@tu-vps

# 2. Firewall: solo SSH, HTTP y HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 3. Protección contra fuerza bruta
sudo apt install fail2ban
sudo systemctl enable --now fail2ban
```

Y en `/etc/ssh/sshd_config`, ya con tu clave funcionando, solo clave y nada de root:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Reinicia SSH con `sudo systemctl restart ssh` **sin cerrar la sesión actual**, y prueba a entrar desde otra terminal antes de salir. Tres minutos de trabajo que te ahorran problemas serios.

### Docker Compose como orquestador

No necesitas Kubernetes. No necesitas Nomad. Docker Compose es perfecto para un VPS con pocos servicios. La estructura es simple:

```
/opt/services/
├── docker-compose.yml
├── .env.mi-api
├── .env.umami
└── caddy/
    └── Caddyfile
```

El `docker-compose.yml` define todos los servicios en un solo archivo:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '443:443/udp'
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - proxy

  mi-api:
    image: ghcr.io/tu-usuario/mi-api:latest
    restart: unless-stopped
    env_file:
      - .env.mi-api
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - proxy

volumes:
  caddy_data:
  caddy_config:

networks:
  proxy:
    name: proxy
    driver: bridge
```

### Caddy como reverse proxy

Caddy es la mejor decisión que he tomado en infra. Dos líneas por servicio, HTTPS automático con Let's Encrypt, HTTP/2, y cero configuración de certificados.

```
mi-api.tu-dominio.com {
    reverse_proxy mi-api:3001
}
```

Eso es todo. Caddy detecta el dominio, solicita el certificado, lo renueva automáticamente, y hace reverse proxy al contenedor. Comparado con Nginx + Certbot, es otra galaxia.

### Deploy automático con GitHub Actions

Cada push a `main` dispara un workflow que construye la imagen Docker, la sube a `ghcr.io`, y hace SSH al VPS para hacer pull y recrear el contenedor. La conexión usa una clave SSH dedicada al deploy, guardada como secret del repositorio:

```yaml
- name: Deploy to VPS
  run: |
    ssh usuario@tu-vps "cd /opt/services && \
      docker compose pull mi-api && \
      docker compose up -d mi-api"
```

Hay unos segundos de corte mientras Compose recrea el contenedor. Para un proyecto indie es aceptable, y Caddy devuelve un 502 limpio mientras tanto. Si algún día necesitas cero cortes, la respuesta es un segundo contenedor y un cambio de destino en el proxy, no más comandos.

## La observabilidad: 4 herramientas, 4 problemas

Con el VPS funcionando, el siguiente paso era responder cuatro preguntas:

1. **¿Están mis servicios vivos?** → Upptime
2. **¿Qué errores ocurren en producción?** → Sentry
3. **¿Cómo usan mi app los usuarios?** → Firebase Analytics
4. **¿Cuánta gente visita mis webs?** → Umami

### 1. Upptime: status page pública + alertas Telegram

[Upptime](https://upptime.js.org) es un monitor de uptime que funciona 100% en GitHub Actions. No necesita servidor. Crea un repo, configuras qué monitorizar, y GitHub Actions comprueba tus endpoints cada 5 minutos. Si algo cae, te llega un mensaje a Telegram.

El archivo de configuración es un `.upptimerc.yml`:

```yaml
sites:
  - name: Mi API
    url: https://mi-api.tu-dominio.com/health
    expectedStatusCodes:
      - 200
  - name: Mi Web
    url: https://tu-dominio.com

status-website:
  cname: status.tu-dominio.com
  name: System Status
  theme: dark

notifications:
  - type: telegram
    botKey: $NOTIFICATION_TELEGRAM_BOT_KEY
    chatId: $NOTIFICATION_TELEGRAM_CHAT_ID
```

Tres cosas que aprendí montándolo:

- Necesitas un **GitHub PAT** (Fine-grained Personal Access Token) con permisos de Actions, Contents, Issues, Workflows y Administration. Sin él, el workflow que genera los gráficos falla silenciosamente.
- Para las notificaciones de Telegram necesitas **tres** secrets, no dos: `NOTIFICATION_TELEGRAM` (valor: `true`), `NOTIFICATION_TELEGRAM_BOT_KEY` y `NOTIFICATION_TELEGRAM_CHAT_ID`. El primero es un flag de activación que no está documentado de forma obvia.
- El DNS del subdominio (`status.tu-dominio.com`) debe apuntar con un CNAME a `tu-usuario.github.io`. Si usas Cloudflare, desactiva el proxy (nube gris).

Resultado: una [status page pública](https://status.alvarotc.com) con histórico de uptime, gráficos de response time, y alertas instantáneas por Telegram cuando algo cae.

### 2. Sentry: error tracking sin ruido

[Sentry](https://sentry.io) captura errores en producción con contexto completo: stack trace, request data, breadcrumbs. El free tier da 5.000 eventos al mes, más que suficiente para un proyecto indie.

La integración con NestJS es directa. Un archivo `instrument.ts` que se importa como primera línea en `main.ts`:

```typescript
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.2'),
  enabled: !!process.env.SENTRY_DSN,
  beforeSend(event) {
    // Scrub sensitive data from exception messages
    if (event.exception?.values) {
      for (const ex of event.exception.values) {
        if (ex.value) {
          ex.value = ex.value
            .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g, '[JWT_REDACTED]')
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
        }
      }
    }
    return event;
  },
});
```

Un error que cometí al principio: usar el decorador `@SentryExceptionCaptured()` en el exception filter global. Eso captura **todas** las excepciones, incluyendo 400 Bad Request, 401 Unauthorized, 404 Not Found... Errores del cliente que son completamente normales y te llenan la cuota de Sentry de ruido.

La solución es capturar manualmente solo lo que importa:

```typescript
catch(exception: unknown, host: ArgumentsHost) {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    if (status >= 500) {
      Sentry.captureException(exception);
    }
    // ... return response
  }

  // Unknown exceptions: these are real bugs
  Sentry.captureException(exception);
  // ... return 500
}
```

Así solo recibes alertas de errores reales: excepciones no controladas y errores 500 explícitos.

### 3. Firebase Analytics: qué hacen los usuarios

Para apps móviles (Capacitor/React en mi caso), Firebase Analytics es la opción más rápida. El measurement ID se inyecta en build time y los eventos se envían automáticamente.

Un par de hooks hacen el tracking transparente:

```typescript
export function useScreenView(screenName: string) {
  useEffect(() => {
    logEvent('screen_view', { screen_name: screenName }).catch(() => {});
  }, []);
}
```

La regla de oro: **analytics nunca debe romper la app**. Cada llamada a `logEvent` está envuelta en try/catch silencioso. Si Firebase falla, el usuario ni se entera.

### 4. Umami: web analytics respetuoso con la privacidad

[Umami](https://umami.is) es la alternativa self-hosted a Google Analytics. No usa cookies ni identifica a nadie, así que no necesita banner de consentimiento. Y lo mejor: lo corres en tu propio VPS.

Añadirlo al Docker Compose existente es trivial:

```yaml
umami:
  image: ghcr.io/umami-software/umami:latest
  restart: unless-stopped
  env_file:
    - .env.umami
  depends_on:
    umami-db:
      condition: service_healthy
  networks:
    - proxy

umami-db:
  image: postgres:15-alpine
  restart: unless-stopped
  env_file:
    - .env.umami
  volumes:
    - umami_db_data:/var/lib/postgresql/data
  networks:
    - proxy
```

El `.env.umami`:

```bash
POSTGRES_DB=umami
POSTGRES_USER=umami
POSTGRES_PASSWORD=un-password-largo-y-aleatorio
DATABASE_URL=postgresql://umami:un-password-largo-y-aleatorio@umami-db:5432/umami
APP_SECRET=otro-secreto-largo-y-aleatorio
```

Dos líneas en el Caddyfile:

```
analytics.tu-dominio.com {
    reverse_proxy umami:3000
}
```

Y un script de tracking por cada web que quieras monitorizar:

```html
<script
  defer
  src="https://analytics.tu-dominio.com/script.js"
  data-website-id="tu-website-id"
></script>
```

Tras el deploy, tienes un dashboard completo con visitantes, páginas vistas, bounce rate, referrers, dispositivos y países. Todo en tu servidor, sin enviar datos a terceros.

## El resultado

Por menos de 5€ al mes (3,79€ del VPS + snapshots) tengo:

- **Status page pública** con histórico de uptime y alertas por Telegram
- **Error tracking** que me avisa de bugs reales en producción, no de 404s
- **Product analytics** para entender cómo usan mi app
- **Web analytics** de todas mis webs sin depender de Google ni violar la privacidad de nadie

Todo corre en un solo VPS con Docker Compose. Todo se despliega automáticamente. Y lo más importante: ahora sé qué pasa cuando no estoy mirando.

## Lo que aprendí

- **Caddy es el reverse proxy definitivo** para proyectos pequeños y medianos. Cero configuración de SSL, cero renovaciones manuales, cero dolores de cabeza.
- **No todo necesita ser cloud managed.** Umami self-hosted reemplaza Google Analytics sin coste mensual. Upptime reemplaza servicios de monitoring de pago usando solo GitHub Actions.
- **La observabilidad no es un lujo.** Es lo mínimo para poder dormir tranquilo sabiendo que si algo se rompe, te vas a enterar.
- **Filtra el ruido desde el día uno.** Si no configuras bien qué errores capturar, Sentry se convierte en una lista infinita de 404s que ignoras y los errores reales se pierden entre el ruido.

Si estás empezando con tu propio stack de infra, no necesitas más que esto. Un VPS barato, Docker Compose, Caddy, y cuatro herramientas gratuitas que te dan visibilidad completa sobre tus servicios. Sin excusas.

---
title: How I Set Up My VPS with Full Observability for Less Than €5/Month
description: "Docker Compose, Caddy, Upptime, Sentry, Firebase Analytics, and Umami. Everything you need to know what's going on in your infrastructure."
date: 2026-03-26
draft: true
tags: ['devops', 'docker', 'observabilidad', 'vps', 'self-hosted']
---

I had several products deployed as managed services. A backend on Railway, frontends on Vercel, and a database on Supabase. Everything was working, but I had no idea what was happening when I wasn’t looking. Was anything going down? How many people were using my apps? What errors were occurring in production? I didn’t have answers to any of those questions.

So I set up a VPS on Hetzner, migrated what made sense to migrate, and built a complete observability stack. All for less than €5 a month. Here I’ll explain how, step by step, so you can replicate it.

## The VPS: Hetzner + Docker Compose + Caddy

### Why Hetzner

Unbeatable price. A CAX11 (2 ARM vCPUs, 4GB RAM, 40GB disk) costs €3.79/month. For an indie developer who needs to run a couple of APIs and auxiliary services, that’s more than enough. Alternatives like DigitalOcean or Linode cost twice as much for the same specs.

### Basic Hardening

The first thing to do after setting up the server: lock everything down.

```bash
# Create a user, disable root
adduser your-username
usermod -aG sudo your-username

# SSH key-only authentication (edit /etc/ssh/sshd_config)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Firewall: only what’s necessary
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Protection against brute-force attacks
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

Three minutes of work that will save you serious trouble.

### Docker Compose as an orchestrator

You don’t need Kubernetes. You don’t need Nomad. Docker Compose is perfect for a VPS with just a few services. The structure is simple:

```
/opt/services/
├── docker-compose.yml
├── .env.mi-api
├── .env.umami
└── caddy/
    └── Caddyfile
```

The `docker-compose.yml` file defines all services in a single file:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
 - "80:80"
 - "443:443"
      - "443:443/udp"
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

### Caddy as a Reverse Proxy

Caddy is the best infrastructure decision I’ve ever made. Two lines per service, automatic HTTPS with Let’s Encrypt, HTTP/2, and zero certificate configuration.

```
my-api.your-domain.com {
    reverse_proxy my-api:3001
}
```

That’s it. Caddy detects the domain, requests the certificate, automatically renews it, and acts as a reverse proxy for the container. Compared to Nginx + Certbot, it’s in a whole different league.

### Automatic Deployment with GitHub Actions

Every push to `main` triggers a workflow that builds the Docker image, uploads it to `ghcr.io`, and SSHs into the VPS to pull the image and recreate the container:

```yaml
- name: Deploy to VPS
  run: |
    ssh user@your-vps "cd /opt/services && \
 docker compose pull my-api && \
 docker compose up -d my-api"
```

No noticeable downtime. The new container starts up before the old one shuts down.

## Observability: 4 Tools, 4 Problems

With the VPS up and running, the next step was to answer four questions:

1. **Are my services up and running?** → Upptime
2. **What errors occur in production?** → Sentry
3. **How are users interacting with my app?** → Firebase Analytics
4. **How many people visit my websites?** → Umami

### 1. Upptime: Public status page + Telegram alerts

[Upptime](https://upptime.js.org) is an uptime monitor that runs 100% on GitHub Actions. It doesn’t require a server. Create a repo, configure what to monitor, and GitHub Actions checks your endpoints every 5 minutes. If something goes down, you’ll receive a message on Telegram.

The configuration file is a `.upptimerc.yml`:

```yaml
sites:
  - name: My API
    url: https://mi-api.tu-dominio.com/health
    expectedStatusCodes:
 - 200
  - name: My Website
    url: https://tu-dominio.com

status-website:
  cname: status.your-domain.com
  name: System Status
  theme: dark

notifications:
  - type: telegram
    botKey: $NOTIFICATION_TELEGRAM_BOT_KEY
    chatId: $NOTIFICATION_TELEGRAM_CHAT_ID
```

Three things I learned while setting this up:

- You need a **GitHub PAT** (Fine-grained Personal Access Token) with permissions for Actions, Content, Issues, Workflows, and Administration. Without it, the workflow that generates the charts fails silently.
- For Telegram notifications, you need **three** secrets, not two: `NOTIFICATION_TELEGRAM` (value: `true`), `NOTIFICATION_TELEGRAM_BOT_KEY`, and `NOTIFICATION_TELEGRAM_CHAT_ID`. The first is an activation flag that isn’t clearly documented.
- The subdomain’s DNS (`status.your-domain.com`) must point to `your-username.github.io` via a CNAME record. If you use Cloudflare, disable the proxy (gray cloud).

Result: a [public status page](https://status.alvarotc.com) with uptime history, response time charts, and instant alerts via Telegram when something goes down.

### 2. Sentry: Noise-Free Error Tracking

[Sentry](https://sentry.io) captures production errors with full context: stack trace, request data, and breadcrumbs. The free tier offers 5,000 events per month—more than enough for an indie project.

Integration with NestJS is straightforward. A `instrument.ts` file that’s imported as the first line in `main.ts`:

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

A mistake I made at the beginning: using the `@SentryExceptionCaptured()` decorator on the global exception filter. That captures **all** exceptions, including 400 Bad Request, 401 Unauthorized, 404 Not Found... Client errors that are completely normal and flood your Sentry quota with noise.

The solution is to manually capture only what matters:

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

This way, you only receive alerts for real errors: unhandled exceptions and explicit 500 errors.

### 3. Firebase Analytics: What Users Do

For mobile apps (Capacitor/React in my case), Firebase Analytics is the fastest option. The measurement ID is injected at build time, and events are sent automatically.

A couple of hooks make tracking transparent:

```typescript
export function useScreenView(screenName: string) {
  useEffect(() => {
    logEvent('screen_view', { screen_name: screenName }).catch(() => {});
  }, []);
}
```

The golden rule: **analytics should never break the app**. Every call to `logEvent` is wrapped in a silent try/catch block. If Firebase fails, the user won’t even notice.

### 4. Umami: Privacy-Friendly Web Analytics

[Umami](https://umami.is) is the self-hosted alternative to Google Analytics. No cookies, no invasive tracking, GDPR-compliant without banners. And best of all: you run it on your own VPS.

Adding it to your existing Docker Compose file is a breeze:

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

The `.env.umami` file:

```bash
POSTGRES_DB=umami
POSTGRES_USER=umami
POSTGRES_PASSWORD=generate-a-secure-password-here
DATABASE_URL=postgresql://umami:your-password@umami-db:5432/umami
APP_SECRET=generate-another-secret-here
```

Two lines in the Caddyfile:

```
analytics.your-domain.com {
    reverse_proxy umami:3000
}
```

And a tracking script for each website you want to monitor:

```html
<script
  defer
  src="https://analytics.tu-dominio.com/script.js"
  data-website-id="your-website-id"
></script>
```

After deployment, you’ll have a complete dashboard showing visitors, page views, bounce rate, referrers, devices, and countries. Everything is hosted on your server, with no data sent to third parties.

## The Result

For less than €5 a month (€3.79 for the VPS + snapshots), I get:

- **Public status page** with uptime history and Telegram alerts
- **Error tracking** that alerts me to actual bugs in production, not 404s
- **Product analytics** to understand how people use my app
- **Web analytics** for all my websites without relying on Google or violating anyone’s privacy

Everything runs on a single VPS with Docker Compose. Everything deploys automatically. And most importantly: now I know what’s going on when I’m not looking.

## What I Learned

- **Caddy is the ultimate reverse proxy** for small and medium-sized projects. Zero SSL configuration, zero manual renewals, zero headaches.
- **Not everything needs to be cloud-managed.** Self-hosted Umami replaces Google Analytics with no monthly cost. Upptime replaces paid monitoring services using only GitHub Actions.
- **Observability isn’t a luxury.** It’s the bare minimum you need to sleep soundly, knowing that if something breaks, you’ll find out.
- **Filter out the noise from day one.** If you don’t configure which errors to capture properly, Sentry becomes an endless list of 404s that you ignore, and the real errors get lost in the noise.

If you’re just getting started with your own infrastructure stack, this is all you need: a cheap VPS, Docker Compose, Caddy, and four free tools that give you complete visibility into your services. No excuses.

---
title: 'Set up a service on your VPS today and move it to your homelab tomorrow: FreshRSS with Docker and Caddy'
description: 'How to set up a self-hosted RSS reader so that migrating it later requires only an `rsync` command and a DNS change. Subdomain or path, CLI inside the container, WebSub, and a backup that has actually been restored.'
date: 2026-09-02
draft: false
tags: ['self-hosted', 'docker', 'caddy', 'vps', 'homelab', 'rss']
---

I wanted my own RSS reader, and I wanted it right away. The homelab that’s going to host it doesn’t even have an operating system yet. So I deployed it on the VPS I already have, with one condition: that moving it to my home in a few weeks would just take an `rsync` and a DNS change.

This post details that deployment. But above all, it covers the decisions that make a service portable from day one—decisions that apply to anything you set up with Docker.

## The Context

The starting point is a VPS with Docker Compose and Caddy as a reverse proxy, with several services in production under `/opt/services/`. The new service is [FreshRSS](https://freshrss.org/): PHP with SQLite, a single container, and a Google Reader-compatible API that mobile clients can understand without any additional coding.

The choice of SQLite isn’t just a detail. It means that **the entire state of the service resides in a single directory**: database, configuration, users, and API password. And a service whose state fits into a directory is a service that can be moved with a `tar`.

## Designing for Migration: Five Rules

Before touching the server, I set five conditions. If they’re met, migration is trivial. If one is missing, it becomes a project.

1. **Docker Compose from the very start**, versioned in Git. Nothing installed manually on the host.
2. **All state in a single directory** with bind mounts. Migrating means stopping the service, copying the directory, and starting it up.
3. **Configuration and secrets outside the image**: in a `.env` file or in the application interface, never in the code.
4. **Dedicated subdomain with a low TTL**. Switching machines will just mean changing a record.
5. **Nothing from the VPS provider**: no managed database, no proprietary object storage, and no manually configured systemd units.

## Subdomain or path: the most critical decision

The initial plan was to serve the reader at a path, `https://example.com/rss`, “on top of the domain already served by the proxy.” Before touching anything, I ran the simplest test possible:

```bash
getent hosts example.com
```

And the domain’s root wasn’t pointing to the VPS. It was hosted by another provider, serving a static website. The VPS was only serving subdomains. The premise of the plan was false, and no one would have known until they encountered a mysterious 404.

Even if it had been true, the approach has two structural problems:

- **It ties the service to the machine serving the root domain.** As long as it lives at `/rss`, it can’t be moved without also moving everything else hanging off the domain—or without leaving the old proxy to forward traffic to the new site. And so the old machine never gets retired.
- **It’s the weak point of any web application.** The proxy has to decide whether to remove the prefix or keep it; the application has to know its full public URL; and if the two don’t match, the result is broken CSS or infinite redirect loops.

With a subdomain, `rss.example.com`, the migration is a single DNS record, and the proxy block is just two lines. Lesson: **The first rule of “detect, don’t assume” also applies to the plan that tells you to detect.**

## Deployment

Structure on the host:

```
/opt/services/rss/
  compose.yaml
  data/ # all state: SQLite, config, users, favicons
  extensions/    # empty
```

The complete `compose.yaml`:

```yaml
services:
  freshrss:
    image: freshrss/freshrss:latest
    container_name: freshrss
    restart: unless-stopped
    environment:
 TZ: Europe/Madrid
      CRON_MIN: "13,43" # refresh feeds twice per hour
 FRESHRSS_ENV: production
    volumes:
 - ./data:/var/www/FreshRSS/data
      - ./extensions:/var/www/FreshRSS/extensions
    networks:
 - proxy

networks:
  proxy:
    external: true # the network shared with Caddy
```

It does not expose any ports. Caddy accesses the container via the internal `proxy` network, and the container only listens on port 80 on that network. The official image also automatically sets the permissions for `data/` upon startup (the directories are set to `root:www-data`), so there’s no need to blindly run the classic `chown` command.

The Caddy block, following the same pattern as the server’s other services:

```
rss.example.com {
    reverse_proxy freshrss:80
}
```

First, an A record in DNS pointing `rss` to the VPS’s IP address. If your DNS is on Cloudflare, **without a proxy** (gray cloud): Caddy needs to receive the Let’s Encrypt challenge directly.

And the step that’s most daunting on a server with production environments—reloading the proxy—doesn’t have to be a problem:

```bash
docker exec caddy caddy validate --config /etc/caddy/Caddyfile
docker exec caddy caddy reload   --config /etc/caddy/Caddyfile
```

Validate first, reload later. The reload is a hot reload: the other services won’t even notice. Ten seconds later, the Caddy log shows the `http-01` challenge arriving from two Let’s Encrypt IP addresses and a `certificate obtained successfully` message. Valid HTTPS, zero certificate configuration.

## Configure via CLI without passwords appearing in the terminal

A user fills out the web wizard in a browser: SQLite database, username, password. This ensures the password doesn’t appear in any browser history or logs.

The rest is done via the CLI. FreshRSS includes its scripts in `cli/`, and you must run them as the web server user:

```bash
docker compose exec -T --user www-data freshrss ./cli/reconfigure.php --api-enabled
```

This enables the API used by mobile clients. The `base_url` was automatically detected based on the headers sent by Caddy, precisely because the service resides at the root of a subdomain.

Two pitfalls that cost me a few minutes:

**`docker exec` consumes standard input.** If you run a script via `ssh host 'bash -s' <<EOF`, any `docker exec` inside it inherits stdin and absorbs the rest of the script. Bash runs out of lines and exits cleanly, with no error. The following lines are never executed. Workaround: `</dev/null` in every `docker exec`.

**There’s no CLI to delete a feed.** The wizard creates a sample feed, and I wanted to start from scratch. The temptation is to open the SQLite database and run a `DELETE`. The safe option is to use the application’s internal API, reusing the same initialization process used by its official scripts:

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

Copy it to the container using `docker compose cp` and run it with `php` as `www-data`. Twelve lines, and the database is handled by the application, not me.

The initial subscriptions are stored in an OPML file and imported via the CLI as well, using `import-for-user.php --user admin --filename /tmp/feeds.opml`.

## Two surprises on the first refresh

**One feed returned an HTTP 202.** It’s not an error—it’s “accepted”—which is why FreshRSS didn’t know what to do with it. I tested the same feed from the VPS using three user-agents: with curl’s user-agent, it returned 200 and XML; with FreshRSS’s user-agent, it returned 200 and XML; with a browser’s user-agent, it returned 202 and an empty page. It was the media outlet’s CDN serving its anti-bot challenge, and it decides based on heuristics: it gives the same client a 200 one time and a 202 the next. It’s not worth fighting with the user-agent. I replaced the feed with an equivalent one.

**Another feed subscribed on its own.** The log showed `WebSub subscribe … 204`. That media outlet advertises a _hub_; FreshRSS asked it to notify FreshRSS upon publication, and the hub agreed. Articles arrive via push, within seconds, without waiting for a refresh. This has an implication for the migration: push works because the service is accessible from the internet. If, in the homelab, it ends up behind a VPN, the hub won’t be able to call the _callback_ and will revert to polling. It’s not a big deal, but it’s a factor that tips the scales in favor of a public reverse proxy.

## Backup: Stop, Compress, Start, and Truly Restore

With SQLite, the simplest consistent backup is to stop the container for a moment. The complete script:

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
trap 'docker compose start freshrss >/dev/null' EXIT   # no matter what happens, start it

tar -czf "$FILE" --numeric-owner data
find "$DEST" -name 'rss-data-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) OK $FILE"
```

The `trap` is the important line: if the `tar` fails, the container starts anyway. Estimated time: one second. Scheduled in `/etc/cron.d/rss-backup` as root, because `data/` is not readable by a regular user:

```
17 4 * * * root /opt/services/rss/backup.sh >> /var/log/rss-backup.log 2>&1
```

And something almost no one does: **test the restore on the same day**. Extract the backup to a temporary file and check with the database to see if it’s intact:

```bash
T=$(mktemp -d) && sudo tar -xzf "$FILE" -C "$T"
sudo python3 -c "
import sqlite3; c = sqlite3.connect('$T/data/users/admin/db.sqlite')
print(c.execute('pragma integrity_check').fetchone()[0])
print(c.execute('select count(*) from feed').fetchone()[0], 'feeds')"
```

`ok`, and the expected number of feeds. A backup that has never been restored is just a hope, not a backup.

This covers application errors: a deleted category, a `latest` update that breaks the database. It does not cover the VPS failing. For that, the provider’s full-machine backup serves as the complementary layer: inexpensive, maintenance-free, and with seven days of retention. These are two layers for two different types of failures.

## The Upcoming Migration

When the homelab is ready, the entire procedure:

```bash
# On the VPS
docker compose stop freshrss
sudo rsync -a --numeric-ids /opt/services/rss/ homelab:/opt/services/rss/
# On the homelab
docker network create proxy
docker compose pull && docker compose up -d
# Change the A record for rss.example.com
```

One rule: the image version at the destination must be **the same or newer** than at the source. SQLite is forward-compatible, and there’s no going back. And the mobile client doesn’t need any changes: same URL, same username.

## What I Learned

- **A service with its state stored in a directory is a portable service.** If the application lets you choose SQLite and you’re a single user, choose it.
- **Subdomain over path**, whenever possible. The path ties you to whoever hosts the root, and that’s where things break.
- **Check the DNS before committing to your plan.** A `getent hosts` takes a second and saves you from a failed deployment.
- **Validate and reload the proxy on the fly.** You don’t need to restart anything in production to add a service.
- **If there’s no CLI for something, use the app’s internal API**, not its database.
- **Every `docker exec` inside a script via stdin needs `</dev/null`.** You’ll see this in every deployment script out there once you know it.
- **The backup is tested the same day it’s created.** `pragma integrity_check` are two words.

The homelab doesn’t exist yet. And it already has its first service in production waiting for it.

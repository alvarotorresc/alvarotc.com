# Datos reales para `/stats` (tubería de Stats) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generar `src/data/generated/stats.json` con datos reales de GitHub, Umami y Lighthouse (cron diario + Lighthouse CI con umbral que falla), cargar Umami solo cuando hay ID y enseñar en `/stats` y en la home solo números verificables, en es y en.

**Architecture:** La lógica pura vive en `scripts/lib/*.mjs` (ESM con JSDoc, sin dependencias, `fetch` nativo inyectable) y vitest la importa directamente; `scripts/fetch-data.mjs` y `scripts/merge-lighthouse.mjs` son envoltorios CLI finos que Node 22 ejecuta tal cual en Actions, sin compilar ni `tsx`. `fetch-data.mjs` escribe el JSON con un bloque `null` por fuente que falle y conserva el bloque `lighthouse` anterior; `merge-lighthouse.mjs` solo sustituye ese bloque. El job `lighthouse` de `ci.yml` sube los manifiestos como artefacto; el workflow `refresh-stats.yml` descarga el último, mezcla, y commitea el JSON en `main` si cambió, lo que dispara el deploy de Vercel. La página se parte en `StatsPage.astro` (carga datos) y `StatsView.astro` (presentacional, recibe `stats`, `writing`, `now` y `githubLogin`), que se prueba con la Container API.

**Tech Stack:** Astro 7 (SSG), TypeScript strict (`allowJs` del tsconfig de Astro: los `.mjs` tipan por JSDoc), vitest 5 con `experimental_AstroContainer`, Node 22 (lo exige `engines` y Astro 7), GitHub Actions, `@lhci/cli` 0.15, GitHub GraphQL API, Umami API (la instancia `analytics.alvarotc.com` es Umami v3: `/api/config` responde `cloudMode: false` y los errores tienen forma `{ error: { message, code, status } }`).

**Spec:** `docs/superpowers/specs/2026-09-24-stats-data-pipeline.md`. Maqueta de referencia: `Stats.dc.html` (lienzo de Claude Design; vive fuera del repo y no se toca).

## Global Constraints

- Cada tarea toca como máximo 3 ficheros de código; tests y fixtures (`tests/**`) van aparte, y tampoco cuentan los ficheros de ignorados (`.gitignore`, `.prettierignore`), `.env.example` ni `package-lock.json`. Por esta regla y por un bloqueo encontrado al inventariar (la home saca 0.92 en accesibilidad en Lighthouse, ver Task 5) el plan tiene 10 tareas en vez de 7-9.
- Como máximo un `npm run build` por tarea; solo lo ejecutan la Task 5 (comprobar los arreglos de accesibilidad en `dist/`) y la Task 10 (build con datos reales). El resto valida con `npx vitest run <ficheros>`.
- Tests sin red: GitHub y Umami se prueban con fixtures JSON en `tests/fixtures/` y un `fetchImpl` falso. Nada bajo test llama a `new Date()`: las funciones reciben `now`.
- `scripts/fetch-data.mjs` y `scripts/merge-lighthouse.mjs` son ESM sin dependencias (solo `node:*` y `fetch` global). Su lógica pura está en `scripts/lib/github.mjs`, `scripts/lib/umami.mjs`, `scripts/lib/stats-file.mjs` y `scripts/lib/lighthouse.mjs`, con JSDoc, y los tests las importan directamente (`../scripts/lib/x.mjs`). No se usa `tsx` ni se compila nada aparte.
- `console.log` solo en los dos scripts CLI; nunca en `src/`.
- Todo texto nuevo en `src/i18n/translations.ts` va en `en` y en `es`.
- Workflows: validar con `npx --yes @action-validator/cli <fichero>` (probado en esta máquina: sale con 0 en los dos workflows del plan) y `npx prettier --check`.
- Node 22 en todos los workflows. `ci.yml` usa hoy Node 20, pero `package.json` pide `>=22.12.0` y Astro 7 también (`node_modules/astro/package.json` → `engines.node: '>=22.12.0'`): con 20 la build de esta rama no arrancaría en CI.
- Lighthouse CI: `@lhci/cli` como devDependency, configuración en `lighthouserc.cjs`, `numberOfRuns: 3`, aserciones `categories:performance` `minScore: 0.95` y `categories:accessibility` `minScore: 1`, ambas con `aggregationMethod: 'median-run'`, que fallan el job en push a `main` (en PR, `continue-on-error`). Las puntuaciones que llegan a `stats.json` salen del `manifest.json` (`isRepresentativeRun`) con `scripts/merge-lighthouse.mjs`.
- La variable que elige escritorio se llama `LH_FORM_FACTOR`, nunca `LHCI_*`: `lhci` convierte cualquier `LHCI_X` del entorno en la opción `--x` (probado: `LHCI_PRESET=desktop` hace fallar `lhci assert` con `Invalid values: Argument: preset`).
- El JSON generado lo escribe `JSON.stringify(data, null, 2) + '\n'`, que es estable con Prettier (probado con `prettier --check` sobre la salida real), así que no se añade a `.prettierignore`.
- No se commitea un `stats.json` generado en local: `gh auth token` ve contribuciones privadas (2054 commits en 2026 con el token del usuario) que el `GITHUB_TOKEN` de Actions no ve; el primer cron bajaría los números. Lo publica el workflow.
- Cada tarea termina en un commit Conventional Commits con el trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. El hook de husky pasa `eslint --fix` y `prettier --write` sobre lo commiteado; los bloques del plan ya están en formato Prettier; los fragmentos que se insertan en ficheros existentes van sin sangría (Prettier la quita dentro del Markdown) y hay que sangrarlos al nivel del ancla.
- Sin comentarios innecesarios, TypeScript strict (los tests también pasan por `astro check`).

## Consulta GraphQL (documentada)

Dos peticiones a `https://api.github.com/graphql` con `Authorization: Bearer $GITHUB_TOKEN`:

1. `query UserId($login: String!) { user(login: $login) { id } }` → `data.user.id` (para `alvarotorresc`: `MDQ6VXNlcjM4OTAzNDgz`).
2. `STATS_QUERY` (texto completo en la Task 1) con variables `login`, `authorId`, `from` (`now - 365 días`), `to` (`now`), `yearStart` (1 de enero UTC), `since` (`now - 30 días`). Alias `calendar` (calendario de 12 meses: `weeks[].contributionDays[] { date, contributionCount }`, 53 semanas, la primera y la última incompletas), `thisYear` (`totalCommitContributions`), y `repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false)` con `totalCount`, y por nodo `name`, `stargazerCount`, `languages(first: 10, orderBy: SIZE DESC) { edges { size node { name } } }` y `defaultBranchRef.target.history(since, author: { id }) { totalCount }`.

Hechos medidos el 24 sep con `gh api graphql` sobre la cuenta real: 16 repos públicos no fork; `huellas` tiene `defaultBranchRef: null` (repo vacío) y varios repos tienen `languages.edges: []`; sin el filtro `author`, `upptime` sale como repo más activo con 548 commits de su bot, con el filtro baja a 6 y gana `basecero`. Por eso el filtro por autor es obligatorio.

## Umami (documentado)

- Autenticación: la instancia es self-hosted v3. En Umami v3.4 las API keys (`umami_…`) se aceptan como `Authorization: Bearer <key>` (`src/lib/auth.ts` → `getBearerToken` + `isApiKey`, deshabilitadas solo con `CLOUD_MODE`); `x-umami-api-key` es la cabecera de Umami Cloud. El script envía las dos.
- `GET /api/websites/{id}/stats?startAt=<ms>&endAt=<ms>`: v3 devuelve números planos (`{ pageviews, visitors, visits, bounces, totaltime, comparison }`, y `pageviews` puede llegar como string por el `bigint`); v2 devolvía `{ pageviews: { value, prev }, … }`. `parseViews` acepta las dos.
- `GET /api/websites/{id}/metrics?startAt&endAt&type=path&limit=100` → `[{ x, y }]`. En v2 el tipo se llamaba `url` y `path` da 400: el script reintenta con `type=url`.

## Review Focus

1. Espacio entre número y etiqueta (`486 commits in the last 30 days`): el nodo se pinta con una plantilla `${num} ${label}` para no depender del recorte de espacios de Astro. Tests: Task 9 (`keeps the space between a number and its label`) y Task 10 (build).
2. Sección "De dónde salen los números" y fecha de build ocultas si `generatedAt` es `null`, y `generatedAt` es `null` cuando no hay ninguna fuente (el script sin credenciales no debe encender la sección). Tests: Task 3 (`leaves generatedAt null when every source is missing`), Task 9 (`hides the sources section and the build date`), Task 10 (`built stats page without data`).
3. Heatmap de 53 columnas (371 `<rect>`) con datos reales. Tests: Task 9 (`draws a 53 week heatmap`) y Task 10 (`draws the 53 week heatmap`).
4. Racha: si hoy aún no hay contribuciones cuenta desde ayer; si ayer tampoco, 0. Test: Task 1 (`currentStreak`, tres casos).
5. Lighthouse toma la pasada representativa (mediana), no la mejor, y encuentra `/` aunque el puerto cambie. Test: Task 4 (`takes the median run of the home page, not the best one`). La aserción es `median-run` en `lighthouserc.cjs` (Task 6).
6. Umami v2/v3: las dos formas de `stats`, el reintento `path` → `url`, rutas con y sin barra final sumadas, `.md`, paginación (`/blog/2/`) y posts borrados fuera. Tests: Task 2.
7. El pie dice "Umami" solo si el script de Umami está en la página. Tests: Task 8 (Container) y Task 10 (`built analytics`).
8. La home no inventa commits: sin `github` el contador desaparece y la rejilla pasa a 2 columnas. Tests: Task 10 (`StackStats counters`).

## Acciones del usuario (fuera del código)

- Vercel → Environment Variables: `PUBLIC_UMAMI_WEBSITE_ID=4dc00bab-7da7-488d-b399-299d751b6801` (el ID que hoy está escrito a mano en `BaseLayout.astro`). Sin ella, tras la Task 8 la web deja de cargar Umami.
- GitHub → Settings → Secrets and variables → Actions: `UMAMI_API_KEY` (crear la key en Umami → Settings → API keys; requiere Umami ≥ 3.4), `UMAMI_WEBSITE_ID` (el mismo ID). Opcional: `STATS_GITHUB_TOKEN` (PAT de solo lectura) si el `GITHUB_TOKEN` de Actions no pudiera leer `contributionsCollection`; el workflow lo usa si existe.
- GitHub → Settings → Actions → General → Workflow permissions: si está en "Read repository contents", el bloque `permissions` del workflow basta mientras la organización no lo limite. `main` no tiene protección de rama (`gh api …/branches/main/protection` → 404), así que el push del bot entra.
- Tras mergear en `main`: lanzar "Refresh stats" a mano (`workflow_dispatch`) para tener datos sin esperar al cron.
- Fuera de alcance, para decidir aparte: `BaseLayout.astro` también monta `@vercel/analytics`; la frase "Sin cookies ni rastreadores" se mantiene como estaba.

---

### Task 1: Fuente GitHub (consulta GraphQL y parseo puro)

**Files:**

- Create: `scripts/lib/github.mjs`
- Test: `tests/stats-github.test.ts`, `tests/fixtures/github-stats.json`, `tests/fixtures/github-user-id.json`

**Interfaces:**

- Consumes: nada del repo.
- Produces (`scripts/lib/github.mjs`):
  - `USER_ID_QUERY: string`, `STATS_QUERY: string`
  - `githubLogin(source: string): string` (lee `github: '…'` del texto de `site.config.ts`; lanza si no está)
  - `statsVariables({ login, authorId, now }): { login, authorId, from, to, yearStart, since }` (ISO)
  - `contributionsFromCalendar(calendar): { date: string; count: number }[]`
  - `currentStreak(contributions, now: Date): number`
  - `languageShares(repos): { name: string; percent: number }[]` (top 4 por bytes + `{ name: 'other', percent }` si hay más de 4)
  - `mostActiveRepo(repos): { name: string; commits30d: number } | null`
  - `parseGithub(response, now: Date)` → bloque `github` de `StatsData`
  - `fetchGithub({ token, login, now, fetchImpl? }): Promise<bloque github>`

- [ ] **Step 1: Write the failing test**

Crear `tests/fixtures/github-stats.json` (respuesta real recortada a 3 semanas y 5 repos; los días van en línea por brevedad y Prettier los deja así, con los valores de bytes, estrellas y commits medidos; `huellas` sin rama, dos repos sin lenguajes, hoy 24 sep a 0 y 22-23 sep con contribuciones):

```json
{
  "data": {
    "user": {
      "calendar": {
        "contributionCalendar": {
          "weeks": [
            {
              "contributionDays": [
                { "date": "2026-09-06", "contributionCount": 0 },
                { "date": "2026-09-07", "contributionCount": 0 },
                { "date": "2026-09-08", "contributionCount": 3 },
                { "date": "2026-09-09", "contributionCount": 12 },
                { "date": "2026-09-10", "contributionCount": 0 },
                { "date": "2026-09-11", "contributionCount": 0 },
                { "date": "2026-09-12", "contributionCount": 0 }
              ]
            },
            {
              "contributionDays": [
                { "date": "2026-09-13", "contributionCount": 2 },
                { "date": "2026-09-14", "contributionCount": 0 },
                { "date": "2026-09-15", "contributionCount": 0 },
                { "date": "2026-09-16", "contributionCount": 0 },
                { "date": "2026-09-17", "contributionCount": 0 },
                { "date": "2026-09-18", "contributionCount": 1 },
                { "date": "2026-09-19", "contributionCount": 55 }
              ]
            },
            {
              "contributionDays": [
                { "date": "2026-09-20", "contributionCount": 24 },
                { "date": "2026-09-21", "contributionCount": 0 },
                { "date": "2026-09-22", "contributionCount": 4 },
                { "date": "2026-09-23", "contributionCount": 6 },
                { "date": "2026-09-24", "contributionCount": 0 }
              ]
            }
          ]
        }
      },
      "thisYear": { "totalCommitContributions": 2054 },
      "repositories": {
        "totalCount": 5,
        "nodes": [
          {
            "name": "100DaysOfCode",
            "stargazerCount": 0,
            "languages": { "edges": [] },
            "defaultBranchRef": { "target": { "history": { "totalCount": 0 } } }
          },
          {
            "name": "alvarotc.com",
            "stargazerCount": 0,
            "languages": {
              "edges": [
                { "size": 26109, "node": { "name": "Astro" } },
                { "size": 15224, "node": { "name": "TypeScript" } },
                { "size": 5461, "node": { "name": "JavaScript" } },
                { "size": 1545, "node": { "name": "CSS" } }
              ]
            },
            "defaultBranchRef": { "target": { "history": { "totalCount": 7 } } }
          },
          {
            "name": "bito",
            "stargazerCount": 1,
            "languages": {
              "edges": [
                { "size": 1850694, "node": { "name": "Kotlin" } },
                { "size": 49500, "node": { "name": "HTML" } },
                { "size": 25933, "node": { "name": "CSS" } },
                { "size": 12254, "node": { "name": "Python" } }
              ]
            },
            "defaultBranchRef": { "target": { "history": { "totalCount": 26 } } }
          },
          {
            "name": "basecero",
            "stargazerCount": 2,
            "languages": {
              "edges": [
                { "size": 1743098, "node": { "name": "JavaScript" } },
                { "size": 73665, "node": { "name": "CSS" } },
                { "size": 73022, "node": { "name": "HTML" } }
              ]
            },
            "defaultBranchRef": { "target": { "history": { "totalCount": 513 } } }
          },
          {
            "name": "huellas",
            "stargazerCount": 0,
            "languages": { "edges": [] },
            "defaultBranchRef": null
          }
        ]
      }
    }
  }
}
```

Crear `tests/fixtures/github-user-id.json`:

```json
{
  "data": {
    "user": {
      "id": "MDQ6VXNlcjM4OTAzNDgz"
    }
  }
}
```

Crear `tests/stats-github.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  githubLogin,
  statsVariables,
  contributionsFromCalendar,
  currentStreak,
  languageShares,
  mostActiveRepo,
  parseGithub,
  fetchGithub,
} from '../scripts/lib/github.mjs';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const response = fixture('github-stats.json');
const userId = fixture('github-user-id.json');
const repos = response.data.user.repositories.nodes;
const now = new Date('2026-09-24T12:00:00Z');

describe('githubLogin', () => {
  it('reads the login from site.config.ts', () => {
    expect(githubLogin("  author: {\n    github: 'alvarotorresc',\n  },")).toBe('alvarotorresc');
  });

  it('throws when there is no github login', () => {
    expect(() => githubLogin('export const siteConfig = {};')).toThrow();
  });
});

describe('statsVariables', () => {
  it('builds the 12 month, year and 30 day windows from now', () => {
    expect(statsVariables({ login: 'alvarotorresc', authorId: 'U1', now })).toEqual({
      login: 'alvarotorresc',
      authorId: 'U1',
      from: '2025-09-24T12:00:00.000Z',
      to: '2026-09-24T12:00:00.000Z',
      yearStart: '2026-01-01T00:00:00.000Z',
      since: '2026-08-25T12:00:00.000Z',
    });
  });
});

describe('contributionsFromCalendar', () => {
  it('flattens the weeks into dated counts in order', () => {
    const contributions = contributionsFromCalendar(
      response.data.user.calendar.contributionCalendar,
    );
    expect(contributions).toHaveLength(19);
    expect(contributions[0]).toEqual({ date: '2026-09-06', count: 0 });
    expect(contributions[13]).toEqual({ date: '2026-09-19', count: 55 });
    expect(contributions[18]).toEqual({ date: '2026-09-24', count: 0 });
  });
});

describe('currentStreak', () => {
  it('starts from yesterday when today has no contributions yet', () => {
    const contributions = contributionsFromCalendar(
      response.data.user.calendar.contributionCalendar,
    );
    expect(currentStreak(contributions, now)).toBe(2);
  });

  it('counts today when it already has contributions', () => {
    const contributions = [
      { date: '2026-09-22', count: 1 },
      { date: '2026-09-23', count: 2 },
      { date: '2026-09-24', count: 3 },
    ];
    expect(currentStreak(contributions, now)).toBe(3);
  });

  it('is 0 when neither today nor yesterday have contributions', () => {
    const contributions = [
      { date: '2026-09-21', count: 5 },
      { date: '2026-09-22', count: 0 },
      { date: '2026-09-23', count: 0 },
      { date: '2026-09-24', count: 0 },
    ];
    expect(currentStreak(contributions, now)).toBe(0);
  });
});

describe('languageShares', () => {
  it('sums bytes across repos and keeps the top 4 plus other', () => {
    expect(languageShares(repos)).toEqual([
      { name: 'Kotlin', percent: 48 },
      { name: 'JavaScript', percent: 45 },
      { name: 'HTML', percent: 3 },
      { name: 'CSS', percent: 3 },
      { name: 'other', percent: 1 },
    ]);
  });

  it('has no other entry with 4 languages or fewer', () => {
    const two = [
      {
        name: 'a',
        stargazerCount: 0,
        defaultBranchRef: null,
        languages: {
          edges: [
            { size: 300, node: { name: 'Go' } },
            { size: 100, node: { name: 'Shell' } },
          ],
        },
      },
    ];
    expect(languageShares(two)).toEqual([
      { name: 'Go', percent: 75 },
      { name: 'Shell', percent: 25 },
    ]);
  });

  it('is empty when no repo has languages', () => {
    expect(languageShares([repos[0], repos[4]])).toEqual([]);
  });
});

describe('mostActiveRepo', () => {
  it('picks the repo with most commits in 30 days, ignoring empty repos', () => {
    expect(mostActiveRepo(repos)).toEqual({ name: 'basecero', commits30d: 513 });
  });

  it('is null when no repo had commits', () => {
    expect(mostActiveRepo([repos[0], repos[4]])).toBeNull();
  });
});

describe('parseGithub', () => {
  it('maps the GraphQL response to the stats contract', () => {
    const github = parseGithub(response, now);
    expect(github.contributions).toHaveLength(19);
    expect(github.commitsThisYear).toBe(2054);
    expect(github.publicRepos).toBe(5);
    expect(github.stars).toBe(3);
    expect(github.streak).toBe(2);
    expect(github.mostActiveRepo).toEqual({ name: 'basecero', commits30d: 513 });
    expect(github.languages[0]).toEqual({ name: 'Kotlin', percent: 48 });
  });
});

describe('fetchGithub', () => {
  it('asks for the user id and then for the stats with the author filter', async () => {
    const bodies: { variables: Record<string, string> }[] = [];
    const replies = [userId, response];
    const fetchImpl = async (
      _url: string,
      init: { body: string; headers: Record<string, string> },
    ) => {
      bodies.push(JSON.parse(init.body));
      expect(init.headers.Authorization).toBe('Bearer t0ken');
      return new Response(JSON.stringify(replies.shift()), { status: 200 });
    };
    const github = await fetchGithub({
      token: 't0ken',
      login: 'alvarotorresc',
      now,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(bodies).toHaveLength(2);
    expect(bodies[0].variables).toEqual({ login: 'alvarotorresc' });
    expect(bodies[1].variables.authorId).toBe('MDQ6VXNlcjM4OTAzNDgz');
    expect(github.stars).toBe(3);
  });

  it('throws on GraphQL errors', async () => {
    const fetchImpl = async () =>
      new Response(JSON.stringify({ errors: [{ message: 'Bad credentials' }] }), { status: 200 });
    await expect(
      fetchGithub({ token: 'x', login: 'a', now, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toThrow('Bad credentials');
  });

  it('throws on HTTP errors', async () => {
    const fetchImpl = async () => new Response('{}', { status: 401 });
    await expect(
      fetchGithub({ token: 'x', login: 'a', now, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toThrow('401');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stats-github.test.ts`
Expected: FAIL: `Failed to resolve import "../scripts/lib/github.mjs"`.

- [ ] **Step 3: Write minimal implementation**

Crear `scripts/lib/github.mjs`:

```js
const DAY_MS = 24 * 60 * 60 * 1000;
const ENDPOINT = 'https://api.github.com/graphql';

export const USER_ID_QUERY = `query UserId($login: String!) {
  user(login: $login) {
    id
  }
}`;

export const STATS_QUERY = `query Stats(
  $login: String!
  $from: DateTime!
  $to: DateTime!
  $yearStart: DateTime!
  $since: GitTimestamp!
  $authorId: ID!
) {
  user(login: $login) {
    calendar: contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
    thisYear: contributionsCollection(from: $yearStart, to: $to) {
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
      totalCount
      nodes {
        name
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
            }
          }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history(since: $since, author: { id: $authorId }) {
                totalCount
              }
            }
          }
        }
      }
    }
  }
}`;

/** @param {Date} date */
function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * @param {string} source contents of site.config.ts
 * @returns {string}
 */
export function githubLogin(source) {
  const match = source.match(/github:\s*'([^']+)'/);
  if (!match) throw new Error('github login not found in site.config.ts');
  return match[1];
}

/**
 * @param {{ login: string; authorId: string; now: Date }} input
 */
export function statsVariables({ login, authorId, now }) {
  const from = new Date(now.getTime() - 365 * DAY_MS);
  return {
    login,
    authorId,
    from: from.toISOString(),
    to: now.toISOString(),
    yearStart: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString(),
    since: new Date(now.getTime() - 30 * DAY_MS).toISOString(),
  };
}

/**
 * @typedef {{ date: string; count: number }} Contribution
 * @typedef {{ weeks: { contributionDays: { date: string; contributionCount: number }[] }[] }} Calendar
 * @typedef {{
 *   name: string;
 *   stargazerCount: number;
 *   languages: { edges: { size: number; node: { name: string } }[] };
 *   defaultBranchRef: { target: { history?: { totalCount: number } } } | null;
 * }} RepoNode
 */

/**
 * @param {Calendar} calendar
 * @returns {Contribution[]}
 */
export function contributionsFromCalendar(calendar) {
  return calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
    })),
  );
}

/**
 * @param {Contribution[]} contributions
 * @param {Date} now
 * @returns {number}
 */
export function currentStreak(contributions, now) {
  const byDate = new Map(contributions.map((c) => [c.date, c.count]));
  let cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if ((byDate.get(isoDate(cursor)) ?? 0) === 0) cursor = new Date(cursor.getTime() - DAY_MS);
  let streak = 0;
  while ((byDate.get(isoDate(cursor)) ?? 0) > 0) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

/**
 * @param {RepoNode[]} repos
 * @returns {{ name: string; percent: number }[]}
 */
export function languageShares(repos) {
  const bytes = new Map();
  for (const repo of repos) {
    for (const edge of repo.languages.edges) {
      bytes.set(edge.node.name, (bytes.get(edge.node.name) ?? 0) + edge.size);
    }
  }
  const total = [...bytes.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];
  const sorted = [...bytes.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = sorted.slice(0, 4).map(([name, size]) => ({
    name,
    percent: Math.round((size / total) * 100),
  }));
  if (sorted.length <= 4) return top;
  const rest = 100 - top.reduce((sum, l) => sum + l.percent, 0);
  return rest > 0 ? [...top, { name: 'other', percent: rest }] : top;
}

/**
 * @param {RepoNode[]} repos
 * @returns {{ name: string; commits30d: number } | null}
 */
export function mostActiveRepo(repos) {
  const ranked = repos
    .map((repo) => ({
      name: repo.name,
      commits30d: repo.defaultBranchRef?.target.history?.totalCount ?? 0,
    }))
    .filter((repo) => repo.commits30d > 0)
    .sort((a, b) => b.commits30d - a.commits30d || a.name.localeCompare(b.name));
  return ranked[0] ?? null;
}

/**
 * @param {{ data: { user: {
 *   calendar: { contributionCalendar: Calendar };
 *   thisYear: { totalCommitContributions: number };
 *   repositories: { totalCount: number; nodes: RepoNode[] };
 * } } }} response
 * @param {Date} now
 */
export function parseGithub(response, now) {
  const user = response.data.user;
  const repos = user.repositories.nodes;
  const contributions = contributionsFromCalendar(user.calendar.contributionCalendar);
  return {
    contributions,
    commitsThisYear: user.thisYear.totalCommitContributions,
    publicRepos: user.repositories.totalCount,
    stars: repos.reduce((sum, repo) => sum + repo.stargazerCount, 0),
    streak: currentStreak(contributions, now),
    mostActiveRepo: mostActiveRepo(repos),
    languages: languageShares(repos),
  };
}

/**
 * @param {typeof fetch} fetchImpl
 * @param {string} token
 * @param {string} query
 * @param {Record<string, string>} variables
 */
async function graphql(fetchImpl, token, query, variables) {
  const res = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'alvarotc-web-stats',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
  const body = await res.json();
  if (body.errors?.length) throw new Error(`GitHub GraphQL: ${body.errors[0].message}`);
  return body;
}

/**
 * @param {{ token: string; login: string; now: Date; fetchImpl?: typeof fetch }} input
 */
export async function fetchGithub({ token, login, now, fetchImpl = fetch }) {
  const idResponse = await graphql(fetchImpl, token, USER_ID_QUERY, { login });
  const authorId = idResponse.data.user.id;
  const response = await graphql(
    fetchImpl,
    token,
    STATS_QUERY,
    statsVariables({ login, authorId, now }),
  );
  return parseGithub(response, now);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stats-github.test.ts`
Expected: PASS (16 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/github.mjs tests/stats-github.test.ts tests/fixtures/github-stats.json tests/fixtures/github-user-id.json
git commit -m "feat(stats): GitHub GraphQL source with pure parsing

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Fuente Umami (parseo puro y títulos de posts)

**Files:**

- Create: `scripts/lib/umami.mjs`
- Test: `tests/stats-umami.test.ts`, `tests/fixtures/umami-stats-v3.json`, `tests/fixtures/umami-stats-v2.json`, `tests/fixtures/umami-metrics.json`

**Interfaces:**

- Consumes: `src/content/posts/*.md` (es → `/es/blog/<fichero>/`) y `src/content/posts-en/*.md` (en → `/blog/<fichero>/`), mismo mapeo que `htmlPath` de `src/lib/posts.ts` (el `id` del glob loader es el nombre del fichero).
- Produces (`scripts/lib/umami.mjs`):
  - `umamiRange(now): { startAt: string; endAt: string }` (ms, 30 días)
  - `umamiHeaders(apiKey): Record<string, string>` (`Authorization: Bearer` + `x-umami-api-key`)
  - `parseViews(stats): number` (v3 plano, v2 `{ value }`, string numérico)
  - `blogPath(path): string | null` (normaliza a `/blog/<slug>/` o `/es/blog/<slug>/`, quita query y hash)
  - `frontmatter(markdown): { title: string; draft: boolean } | null`
  - `loadPostTitles(root): Map<string, string>` (sin borradores)
  - `mostRead(metrics, titles): { path; title; views }[]` (top 3, suma variantes, descarta rutas sin post)
  - `fetchUmami({ apiKey, websiteId, baseUrl, now, titles, fetchImpl? }): Promise<{ views30d; mostRead }>`

- [ ] **Step 1: Write the failing test**

Crear `tests/fixtures/umami-stats-v3.json` (forma de Umami v3.4, `src/app/api/websites/[websiteId]/stats/route.ts`):

```json
{
  "pageviews": 1342,
  "visitors": 611,
  "visits": 780,
  "bounces": 402,
  "totaltime": 91234,
  "comparison": {
    "pageviews": 1180,
    "visitors": 540,
    "visits": 690,
    "bounces": 360,
    "totaltime": 80210
  }
}
```

Crear `tests/fixtures/umami-stats-v2.json` (forma de Umami v2):

```json
{
  "pageviews": { "value": 1342, "prev": 1180 },
  "visitors": { "value": 611, "prev": 540 },
  "visits": { "value": 780, "prev": 690 },
  "bounces": { "value": 402, "prev": 360 },
  "totaltime": { "value": 91234, "prev": 80210 }
}
```

Crear `tests/fixtures/umami-metrics.json` (`/metrics?type=path`: portada, un post con y sin barra, un `.md`, la paginación, un post con query, `/stats/` y un post borrado):

```json
[
  { "x": "/", "y": 420 },
  { "x": "/es/blog/vps-observabilidad-completa", "y": 180 },
  { "x": "/blog/new-website-new-direction/", "y": 150 },
  { "x": "/es/blog/de-una-idea-a-una-apk-en-24h/", "y": 140 },
  { "x": "/blog/2/", "y": 90 },
  { "x": "/es/blog/nueva-web-nuevo-rumbo.md", "y": 80 },
  { "x": "/blog/from-an-idea-to-an-apk-in-24-hours/?ref=hn", "y": 60 },
  { "x": "/stats/", "y": 50 },
  { "x": "/blog/deleted-post/", "y": 45 },
  { "x": "/es/blog/vps-observabilidad-completa/", "y": 35 }
]
```

Crear `tests/stats-umami.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  umamiRange,
  umamiHeaders,
  parseViews,
  blogPath,
  frontmatter,
  loadPostTitles,
  mostRead,
  fetchUmami,
} from '../scripts/lib/umami.mjs';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const metrics = fixture('umami-metrics.json');
const now = new Date('2026-09-24T12:00:00Z');

const titles = new Map([
  ['/es/blog/vps-observabilidad-completa/', 'Cómo monté mi VPS con observabilidad completa'],
  ['/blog/new-website-new-direction/', 'New website, new direction'],
  ['/es/blog/de-una-idea-a-una-apk-en-24h/', 'De una idea a una APK en 24h'],
  ['/es/blog/nueva-web-nuevo-rumbo/', 'Nueva web, nuevo rumbo'],
  ['/blog/from-an-idea-to-an-apk-in-24-hours/', 'From an idea to an APK in 24 hours'],
]);

describe('umamiRange', () => {
  it('covers the last 30 days in epoch milliseconds', () => {
    expect(umamiRange(now)).toEqual({ startAt: '1787659200000', endAt: '1790251200000' });
  });
});

describe('umamiHeaders', () => {
  it('sends the key as a bearer token and as x-umami-api-key', () => {
    expect(umamiHeaders('umami_abc')).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer umami_abc',
      'x-umami-api-key': 'umami_abc',
    });
  });
});

describe('parseViews', () => {
  it('reads the flat v3 shape', () => {
    expect(parseViews(fixture('umami-stats-v3.json'))).toBe(1342);
  });

  it('reads the v2 value/prev shape', () => {
    expect(parseViews(fixture('umami-stats-v2.json'))).toBe(1342);
  });

  it('coerces a bigint serialised as a string', () => {
    expect(parseViews({ pageviews: '87' })).toBe(87);
  });

  it('throws when pageviews is missing', () => {
    expect(() => parseViews({} as { pageviews: number })).toThrow();
  });
});

describe('blogPath', () => {
  it('normalises post paths to the trailing slash form', () => {
    expect(blogPath('/blog/new-website-new-direction')).toBe('/blog/new-website-new-direction/');
    expect(blogPath('/es/blog/nueva-web-nuevo-rumbo/')).toBe('/es/blog/nueva-web-nuevo-rumbo/');
    expect(blogPath('/blog/from-an-idea-to-an-apk-in-24-hours/?ref=hn')).toBe(
      '/blog/from-an-idea-to-an-apk-in-24-hours/',
    );
  });

  it('rejects markdown twins and non blog paths', () => {
    expect(blogPath('/es/blog/nueva-web-nuevo-rumbo.md')).toBeNull();
    expect(blogPath('/stats/')).toBeNull();
    expect(blogPath('/blog/topic/astro/')).toBeNull();
  });
});

describe('frontmatter', () => {
  it('reads a single quoted title with a colon', () => {
    const md = "---\ntitle: 'BaseCero: tu dinero no vive aquí'\ndraft: false\n---\n\nBody";
    expect(frontmatter(md)).toEqual({ title: 'BaseCero: tu dinero no vive aquí', draft: false });
  });

  it('unescapes a doubled single quote', () => {
    const md = "---\ntitle: 'BaseCero: Your money doesn''t sit there'\n---\n";
    expect(frontmatter(md)?.title).toBe("BaseCero: Your money doesn't sit there");
  });

  it('reads double quoted and plain titles', () => {
    expect(frontmatter('---\ntitle: "A \\"quoted\\" word"\n---\n')?.title).toBe('A "quoted" word');
    expect(frontmatter('---\ntitle: Plain title\n---\n')?.title).toBe('Plain title');
  });

  it('flags drafts and ignores files without frontmatter', () => {
    expect(frontmatter("---\ntitle: 'Wip'\ndraft: true\n---\n")?.draft).toBe(true);
    expect(frontmatter('# No frontmatter')).toBeNull();
  });
});

describe('loadPostTitles', () => {
  it('maps both collections to their public paths and skips drafts', () => {
    const root = mkdtempSync(join(tmpdir(), 'titles-'));
    mkdirSync(join(root, 'src/content/posts'), { recursive: true });
    mkdirSync(join(root, 'src/content/posts-en'), { recursive: true });
    writeFileSync(join(root, 'src/content/posts/hola.md'), "---\ntitle: 'Hola'\n---\n");
    writeFileSync(
      join(root, 'src/content/posts/borrador.md'),
      "---\ntitle: 'Borrador'\ndraft: true\n---\n",
    );
    writeFileSync(join(root, 'src/content/posts-en/hello.md'), "---\ntitle: 'Hello'\n---\n");
    expect(loadPostTitles(root)).toEqual(
      new Map([
        ['/es/blog/hola/', 'Hola'],
        ['/blog/hello/', 'Hello'],
      ]),
    );
  });
});

describe('mostRead', () => {
  it('merges path variants, drops unknown paths and keeps the top 3', () => {
    expect(mostRead(metrics, titles)).toEqual([
      {
        path: '/es/blog/vps-observabilidad-completa/',
        title: 'Cómo monté mi VPS con observabilidad completa',
        views: 215,
      },
      { path: '/blog/new-website-new-direction/', title: 'New website, new direction', views: 150 },
      {
        path: '/es/blog/de-una-idea-a-una-apk-en-24h/',
        title: 'De una idea a una APK en 24h',
        views: 140,
      },
    ]);
  });

  it('is empty when no post was read', () => {
    expect(mostRead([{ x: '/', y: 10 }], titles)).toEqual([]);
  });
});

describe('fetchUmami', () => {
  const base = {
    apiKey: 'umami_abc',
    websiteId: 'site-1',
    baseUrl: 'https://analytics.example.com/',
    now,
    titles,
  };

  it('reads stats and path metrics', async () => {
    const urls: string[] = [];
    const fetchImpl = async (url: string) => {
      urls.push(url);
      const body = url.includes('/stats?') ? fixture('umami-stats-v3.json') : metrics;
      return new Response(JSON.stringify(body), { status: 200 });
    };
    const umami = await fetchUmami({ ...base, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(urls[0]).toBe(
      'https://analytics.example.com/api/websites/site-1/stats?startAt=1787659200000&endAt=1790251200000',
    );
    expect(urls[1]).toContain('/api/websites/site-1/metrics?');
    expect(urls[1]).toContain('type=path');
    expect(umami.views30d).toBe(1342);
    expect(umami.mostRead).toHaveLength(3);
  });

  it('falls back to type=url on Umami v2', async () => {
    const urls: string[] = [];
    const fetchImpl = async (url: string) => {
      urls.push(url);
      if (url.includes('type=path')) return new Response('{}', { status: 400 });
      const body = url.includes('/stats?') ? fixture('umami-stats-v2.json') : metrics;
      return new Response(JSON.stringify(body), { status: 200 });
    };
    const umami = await fetchUmami({ ...base, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(urls[2]).toContain('type=url');
    expect(umami.views30d).toBe(1342);
  });

  it('throws when the key is rejected', async () => {
    const fetchImpl = async () => new Response('{}', { status: 401 });
    await expect(
      fetchUmami({ ...base, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toThrow('401');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stats-umami.test.ts`
Expected: FAIL: `Failed to resolve import "../scripts/lib/umami.mjs"`.

- [ ] **Step 3: Write minimal implementation**

Crear `scripts/lib/umami.mjs`:

```js
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DAY_MS = 24 * 60 * 60 * 1000;
const BLOG_PATH = /^\/(es\/)?blog\/([a-z0-9-]+)\/?$/;

/**
 * @typedef {{ x: string; y: number }} Metric
 * @typedef {{ path: string; title: string; views: number }} MostRead
 */

/** @param {Date} now */
export function umamiRange(now) {
  return {
    startAt: String(now.getTime() - 30 * DAY_MS),
    endAt: String(now.getTime()),
  };
}

/** @param {string} apiKey */
export function umamiHeaders(apiKey) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'x-umami-api-key': apiKey,
  };
}

/**
 * @param {{ pageviews: number | string | { value: number | string } }} stats
 * @returns {number}
 */
export function parseViews(stats) {
  const pageviews = stats.pageviews;
  const value = typeof pageviews === 'object' ? pageviews.value : pageviews;
  const views = Number(value);
  if (!Number.isFinite(views)) throw new Error('Umami stats without pageviews');
  return views;
}

/**
 * @param {string} path
 * @returns {string | null}
 */
export function blogPath(path) {
  const clean = path.split(/[?#]/)[0];
  const match = clean.match(BLOG_PATH);
  if (!match) return null;
  return `${match[1] ? '/es' : ''}/blog/${match[2]}/`;
}

/**
 * @param {string} markdown
 * @returns {{ title: string; draft: boolean } | null}
 */
export function frontmatter(markdown) {
  const block = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const title = block[1].match(/^title:\s*(.+?)\s*$/m);
  if (!title) return null;
  const raw = title[1];
  let value = raw;
  if (raw.startsWith("'") && raw.endsWith("'")) value = raw.slice(1, -1).replaceAll("''", "'");
  else if (raw.startsWith('"') && raw.endsWith('"')) value = JSON.parse(raw);
  return { title: value, draft: /^draft:\s*true\s*$/m.test(block[1]) };
}

/**
 * @param {string} root
 * @returns {Map<string, string>}
 */
export function loadPostTitles(root) {
  const titles = new Map();
  const dirs = [
    { dir: 'src/content/posts', prefix: '/es/blog/' },
    { dir: 'src/content/posts-en', prefix: '/blog/' },
  ];
  for (const { dir, prefix } of dirs) {
    const full = join(root, dir);
    if (!existsSync(full)) continue;
    for (const file of readdirSync(full)) {
      if (!file.endsWith('.md')) continue;
      const meta = frontmatter(readFileSync(join(full, file), 'utf8'));
      if (meta && !meta.draft) titles.set(`${prefix}${file.slice(0, -3)}/`, meta.title);
    }
  }
  return titles;
}

/**
 * @param {Metric[]} metrics
 * @param {Map<string, string>} titles
 * @returns {MostRead[]}
 */
export function mostRead(metrics, titles) {
  const views = new Map();
  for (const metric of metrics) {
    const path = blogPath(metric.x);
    if (!path || !titles.has(path)) continue;
    views.set(path, (views.get(path) ?? 0) + Number(metric.y));
  }
  return [...views.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([path, count]) => ({
      path,
      title: titles.get(path) ?? path,
      views: count,
    }));
}

/**
 * @param {{
 *   apiKey: string;
 *   websiteId: string;
 *   baseUrl: string;
 *   now: Date;
 *   titles: Map<string, string>;
 *   fetchImpl?: typeof fetch;
 * }} input
 */
export async function fetchUmami({ apiKey, websiteId, baseUrl, now, titles, fetchImpl = fetch }) {
  const range = umamiRange(now);
  const headers = umamiHeaders(apiKey);
  const api = `${baseUrl.replace(/\/$/, '')}/api/websites/${websiteId}`;

  const statsRes = await fetchImpl(`${api}/stats?${new URLSearchParams(range)}`, { headers });
  if (!statsRes.ok) throw new Error(`Umami stats ${statsRes.status}`);
  const views30d = parseViews(await statsRes.json());

  let metricsRes = null;
  for (const type of ['path', 'url']) {
    const query = new URLSearchParams({ ...range, type, limit: '100' });
    metricsRes = await fetchImpl(`${api}/metrics?${query}`, { headers });
    if (metricsRes.status !== 400) break;
  }
  if (!metricsRes || !metricsRes.ok) throw new Error(`Umami metrics ${metricsRes?.status}`);
  return { views30d, mostRead: mostRead(await metricsRes.json(), titles) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stats-umami.test.ts`
Expected: PASS (18 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/umami.mjs tests/stats-umami.test.ts tests/fixtures/umami-stats-v3.json tests/fixtures/umami-stats-v2.json tests/fixtures/umami-metrics.json
git commit -m "feat(stats): Umami source with v2/v3 parsing and post titles

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: `scripts/fetch-data.mjs` y el fichero `stats.json`

**Files:**

- Create: `scripts/lib/stats-file.mjs`
- Create: `scripts/fetch-data.mjs`
- Modify: `package.json` (script `stats`)
- Modify: `.gitignore` (quitar `src/data/generated/`)
- Test: `tests/stats-file.test.ts`

**Interfaces:**

- Consumes: `fetchGithub`, `githubLogin` (Task 1); `fetchUmami`, `loadPostTitles` (Task 2); `loadStats` de `src/lib/stats.ts` (ya prefiere `src/data/generated/stats.json` sobre el fallback; no cambia).
- Produces (`scripts/lib/stats-file.mjs`):
  - `readStats(path): StatsFile | null` (fichero ausente o roto → `null`)
  - `buildStats({ github, umami, previous, now }): StatsFile` (`generatedAt` ISO, o `null` si no hay ninguna fuente; conserva `previous.lighthouse`; conserva `previous.generatedAt` si los datos no cambiaron)
  - `withLighthouse(previous, lighthouse, now): StatsFile`
  - `serializeStats(data): string` (`JSON.stringify(data, null, 2) + '\n'`)
  - `writeStats(path, data): void` (crea la carpeta)
- CLI: `node scripts/fetch-data.mjs` (o `npm run stats`, que carga `.env` si existe) lee `GITHUB_TOKEN`, `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID` (o `PUBLIC_UMAMI_WEBSITE_ID`), `UMAMI_URL` (por defecto `https://analytics.alvarotc.com`), escribe `src/data/generated/stats.json`, registra `github: ok|skipped|failed` y `umami: …`, sale con 0 salvo si no puede escribir (1).

- [ ] **Step 1: Write the failing test**

Crear `tests/stats-file.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  readStats,
  buildStats,
  withLighthouse,
  serializeStats,
  writeStats,
} from '../scripts/lib/stats-file.mjs';

const now = new Date('2026-09-24T05:00:00Z');
const github = {
  contributions: [{ date: '2026-09-23', count: 6 }],
  commitsThisYear: 2054,
  publicRepos: 16,
  stars: 1,
  streak: 1,
  mostActiveRepo: { name: 'basecero', commits30d: 486 },
  languages: [{ name: 'JavaScript', percent: 100 }],
};
const umami = { views30d: 1342, mostRead: [] };
const lighthouse = { performanceMobile: 96, performanceDesktop: 100 };

describe('buildStats', () => {
  it('stamps generatedAt and keeps a null block per missing source', () => {
    expect(buildStats({ github, umami: null, previous: null, now })).toEqual({
      generatedAt: '2026-09-24T05:00:00.000Z',
      github,
      umami: null,
      lighthouse: null,
    });
  });

  it('leaves generatedAt null when every source is missing', () => {
    expect(buildStats({ github: null, umami: null, previous: null, now }).generatedAt).toBeNull();
  });

  it('keeps the lighthouse block of the previous file', () => {
    const previous = { generatedAt: '2026-09-23T05:00:00.000Z', github: null, umami, lighthouse };
    expect(buildStats({ github, umami, previous, now }).lighthouse).toEqual(lighthouse);
  });

  it('keeps the previous generatedAt when nothing changed', () => {
    const previous = { generatedAt: '2026-09-23T05:00:00.000Z', github, umami, lighthouse };
    expect(buildStats({ github, umami, previous, now }).generatedAt).toBe(
      '2026-09-23T05:00:00.000Z',
    );
  });
});

describe('withLighthouse', () => {
  it('replaces only the lighthouse block', () => {
    const previous = { generatedAt: '2026-09-23T05:00:00.000Z', github, umami, lighthouse: null };
    expect(withLighthouse(previous, lighthouse, now)).toEqual({ ...previous, lighthouse });
  });

  it('starts an empty file when there is none', () => {
    expect(withLighthouse(null, lighthouse, now)).toEqual({
      generatedAt: '2026-09-24T05:00:00.000Z',
      github: null,
      umami: null,
      lighthouse,
    });
  });
});

describe('stats file on disk', () => {
  it('writes two-space JSON with a trailing newline and reads it back', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stats-file-'));
    const path = join(dir, 'nested/stats.json');
    const data = buildStats({ github, umami, previous: null, now });
    writeStats(path, data);
    expect(readFileSync(path, 'utf8')).toBe(serializeStats(data));
    expect(serializeStats(data).endsWith('}\n')).toBe(true);
    expect(readStats(path)).toEqual(data);
  });

  it('reads a missing or broken file as null', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stats-file-'));
    expect(readStats(join(dir, 'missing.json'))).toBeNull();
    writeFileSync(join(dir, 'broken.json'), '{');
    expect(readStats(join(dir, 'broken.json'))).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stats-file.test.ts`
Expected: FAIL: `Failed to resolve import "../scripts/lib/stats-file.mjs"`.

- [ ] **Step 3: Write minimal implementation**

Crear `scripts/lib/stats-file.mjs`:

```js
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * @typedef {{
 *   generatedAt: string | null;
 *   github: Record<string, unknown> | null;
 *   umami: Record<string, unknown> | null;
 *   lighthouse: { performanceMobile: number; performanceDesktop: number } | null;
 * }} StatsFile
 */

/**
 * @param {string} path
 * @returns {StatsFile | null}
 */
export function readStats(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** @param {StatsFile} data */
function withoutDate(data) {
  return JSON.stringify({ ...data, generatedAt: null });
}

/**
 * @param {{
 *   github: StatsFile['github'];
 *   umami: StatsFile['umami'];
 *   previous: StatsFile | null;
 *   now: Date;
 * }} input
 * @returns {StatsFile}
 */
export function buildStats({ github, umami, previous, now }) {
  const lighthouse = previous?.lighthouse ?? null;
  const next = {
    generatedAt: github || umami || lighthouse ? now.toISOString() : null,
    github,
    umami,
    lighthouse,
  };
  if (next.generatedAt && previous?.generatedAt && withoutDate(previous) === withoutDate(next)) {
    return { ...next, generatedAt: previous.generatedAt };
  }
  return next;
}

/**
 * @param {StatsFile | null} previous
 * @param {StatsFile['lighthouse']} lighthouse
 * @param {Date} now
 * @returns {StatsFile}
 */
export function withLighthouse(previous, lighthouse, now) {
  const base = previous ?? {
    generatedAt: null,
    github: null,
    umami: null,
    lighthouse: null,
  };
  return {
    ...base,
    generatedAt: base.generatedAt ?? now.toISOString(),
    lighthouse,
  };
}

/** @param {StatsFile} data */
export function serializeStats(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

/**
 * @param {string} path
 * @param {StatsFile} data
 */
export function writeStats(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, serializeStats(data));
}
```

Crear `scripts/fetch-data.mjs`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchGithub, githubLogin } from './lib/github.mjs';
import { fetchUmami, loadPostTitles } from './lib/umami.mjs';
import { buildStats, readStats, writeStats } from './lib/stats-file.mjs';

const root = process.cwd();
const output = join(root, 'src/data/generated/stats.json');
const now = new Date();
const env = process.env;

/**
 * @template T
 * @param {string} name
 * @param {boolean} ready
 * @param {() => Promise<T>} run
 * @returns {Promise<T | null>}
 */
async function source(name, ready, run) {
  if (!ready) {
    console.log(`${name}: skipped, missing credentials`);
    return null;
  }
  try {
    const data = await run();
    console.log(`${name}: ok`);
    return data;
  } catch (error) {
    console.log(`${name}: failed, ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

const umamiWebsiteId = env.UMAMI_WEBSITE_ID || env.PUBLIC_UMAMI_WEBSITE_ID;

const github = await source('github', Boolean(env.GITHUB_TOKEN), () =>
  fetchGithub({
    token: env.GITHUB_TOKEN ?? '',
    login: githubLogin(readFileSync(join(root, 'site.config.ts'), 'utf8')),
    now,
  }),
);

const umami = await source('umami', Boolean(env.UMAMI_API_KEY && umamiWebsiteId), () =>
  fetchUmami({
    apiKey: env.UMAMI_API_KEY ?? '',
    websiteId: umamiWebsiteId ?? '',
    baseUrl: env.UMAMI_URL || 'https://analytics.alvarotc.com',
    now,
    titles: loadPostTitles(root),
  }),
);

try {
  writeStats(output, buildStats({ github, umami, previous: readStats(output), now }));
  console.log(`wrote ${output}`);
} catch (error) {
  console.error(`could not write ${output}: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
```

En `package.json`, dentro de `scripts`, después de `"translate": "node scripts/translate.js",`:

```json
    "stats": "node --env-file-if-exists=.env scripts/fetch-data.mjs",
```

En `.gitignore`, borrar estas dos líneas (y la línea en blanco que las sigue), para que el workflow pueda commitear el JSON:

```
# generated stats data
src/data/generated/
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stats-file.test.ts tests/stats.test.ts`
Expected: PASS.

Humo del CLI sin credenciales y sin red:

Run: `env -u GITHUB_TOKEN -u UMAMI_API_KEY node scripts/fetch-data.mjs; echo "exit $?"; cat src/data/generated/stats.json; rm src/data/generated/stats.json`
Expected: `github: skipped, missing credentials`, `umami: skipped, missing credentials`, `wrote …/src/data/generated/stats.json`, `exit 0`, y el JSON con las cuatro claves a `null`. El `rm` deja el árbol limpio (el fichero real lo publica el workflow).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/stats-file.mjs scripts/fetch-data.mjs package.json .gitignore tests/stats-file.test.ts
git commit -m "feat(stats): fetch-data script writes generated stats.json

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Mezcla de Lighthouse en `stats.json`

**Files:**

- Create: `scripts/lib/lighthouse.mjs`
- Create: `scripts/merge-lighthouse.mjs`
- Test: `tests/stats-lighthouse.test.ts`, `tests/fixtures/lighthouse-mobile.json`, `tests/fixtures/lighthouse-desktop.json`

**Interfaces:**

- Consumes: `readStats`, `withLighthouse`, `writeStats` (Task 3). Formato de `manifest.json` de `lhci upload --target=filesystem` (comprobado con una ejecución real: entradas `{ url, isRepresentativeRun, htmlPath, jsonPath, summary: { performance, accessibility, 'best-practices', seo } }`, con la URL en `http://localhost:<puerto aleatorio>/`).
- Produces:
  - `representativeScore(manifest, pathname): number | null` (0-100)
  - `lighthouseScores(mobile, desktop): { performanceMobile; performanceDesktop } | null`
  - CLI `node scripts/merge-lighthouse.mjs <manifest móvil> <manifest escritorio>`: sustituye solo el bloque `lighthouse` de `src/data/generated/stats.json`; sin pasada de `/` no toca nada y sale con 0; con JSON ilegible sale con 1.

- [ ] **Step 1: Write the failing test**

Crear `tests/fixtures/lighthouse-mobile.json` (tres pasadas de `/`, la mediana no es la mejor, más `/es/`):

```json
[
  {
    "url": "http://localhost:37581/",
    "isRepresentativeRun": false,
    "htmlPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_-2026_09_24_05_12_01.report.html",
    "jsonPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_-2026_09_24_05_12_01.report.json",
    "summary": {
      "performance": 0.94,
      "accessibility": 1,
      "best-practices": 1,
      "seo": 1
    }
  },
  {
    "url": "http://localhost:37581/",
    "isRepresentativeRun": true,
    "htmlPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_-2026_09_24_05_12_14.report.html",
    "jsonPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_-2026_09_24_05_12_14.report.json",
    "summary": {
      "performance": 0.96,
      "accessibility": 1,
      "best-practices": 1,
      "seo": 1
    }
  },
  {
    "url": "http://localhost:37581/",
    "isRepresentativeRun": false,
    "htmlPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_-2026_09_24_05_12_27.report.html",
    "jsonPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_-2026_09_24_05_12_27.report.json",
    "summary": {
      "performance": 0.99,
      "accessibility": 1,
      "best-practices": 1,
      "seo": 1
    }
  },
  {
    "url": "http://localhost:37581/es/",
    "isRepresentativeRun": true,
    "htmlPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_es_-2026_09_24_05_12_52.report.html",
    "jsonPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/mobile/localhost-_es_-2026_09_24_05_12_52.report.json",
    "summary": {
      "performance": 0.93,
      "accessibility": 1,
      "best-practices": 1,
      "seo": 1
    }
  }
]
```

Crear `tests/fixtures/lighthouse-desktop.json`:

```json
[
  {
    "url": "http://localhost:41203/",
    "isRepresentativeRun": true,
    "htmlPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/desktop/localhost-_-2026_09_24_05_13_40.report.html",
    "jsonPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/desktop/localhost-_-2026_09_24_05_13_40.report.json",
    "summary": {
      "performance": 1,
      "accessibility": 1,
      "best-practices": 1,
      "seo": 1
    }
  },
  {
    "url": "http://localhost:41203/es/",
    "isRepresentativeRun": true,
    "htmlPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/desktop/localhost-_es_-2026_09_24_05_13_58.report.html",
    "jsonPath": "/home/runner/work/alvarotc-web/alvarotc-web/lighthouse/desktop/localhost-_es_-2026_09_24_05_13_58.report.json",
    "summary": {
      "performance": 0.99,
      "accessibility": 1,
      "best-practices": 1,
      "seo": 1
    }
  }
]
```

Crear `tests/stats-lighthouse.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { representativeScore, lighthouseScores } from '../scripts/lib/lighthouse.mjs';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const mobile = fixture('lighthouse-mobile.json');
const desktop = fixture('lighthouse-desktop.json');

describe('representativeScore', () => {
  it('takes the median run of the home page, not the best one', () => {
    expect(representativeScore(mobile, '/')).toBe(96);
  });

  it('reads other pages by pathname regardless of the port', () => {
    expect(representativeScore(mobile, '/es/')).toBe(93);
  });

  it('is null when the page was not audited', () => {
    expect(representativeScore(mobile, '/stats/')).toBeNull();
  });
});

describe('lighthouseScores', () => {
  it('combines the mobile and desktop home scores', () => {
    expect(lighthouseScores(mobile, desktop)).toEqual({
      performanceMobile: 96,
      performanceDesktop: 100,
    });
  });

  it('is null when one of the manifests has no home run', () => {
    expect(lighthouseScores(mobile, [])).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stats-lighthouse.test.ts`
Expected: FAIL: `Failed to resolve import "../scripts/lib/lighthouse.mjs"`.

- [ ] **Step 3: Write minimal implementation**

Crear `scripts/lib/lighthouse.mjs`:

```js
/**
 * @typedef {{
 *   url: string;
 *   isRepresentativeRun: boolean;
 *   summary: { performance: number; accessibility: number };
 * }} ManifestEntry
 */

/**
 * @param {ManifestEntry[]} manifest
 * @param {string} pathname
 * @returns {number | null}
 */
export function representativeScore(manifest, pathname) {
  const entry = manifest.find(
    (run) => run.isRepresentativeRun && new URL(run.url).pathname === pathname,
  );
  if (!entry || typeof entry.summary.performance !== 'number') return null;
  return Math.round(entry.summary.performance * 100);
}

/**
 * @param {ManifestEntry[]} mobile
 * @param {ManifestEntry[]} desktop
 * @returns {{ performanceMobile: number; performanceDesktop: number } | null}
 */
export function lighthouseScores(mobile, desktop) {
  const performanceMobile = representativeScore(mobile, '/');
  const performanceDesktop = representativeScore(desktop, '/');
  if (performanceMobile === null || performanceDesktop === null) return null;
  return { performanceMobile, performanceDesktop };
}
```

Crear `scripts/merge-lighthouse.mjs`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lighthouseScores } from './lib/lighthouse.mjs';
import { readStats, withLighthouse, writeStats } from './lib/stats-file.mjs';

const [mobilePath, desktopPath] = process.argv.slice(2);
if (!mobilePath || !desktopPath) {
  console.error('usage: node scripts/merge-lighthouse.mjs <mobile manifest> <desktop manifest>');
  process.exit(1);
}

const output = join(process.cwd(), 'src/data/generated/stats.json');

try {
  const scores = lighthouseScores(
    JSON.parse(readFileSync(mobilePath, 'utf8')),
    JSON.parse(readFileSync(desktopPath, 'utf8')),
  );
  if (!scores) {
    console.log('lighthouse: no representative run for /, stats.json untouched');
    process.exit(0);
  }
  writeStats(output, withLighthouse(readStats(output), scores, new Date()));
  console.log(
    `lighthouse: mobile ${scores.performanceMobile}, desktop ${scores.performanceDesktop}`,
  );
} catch (error) {
  console.error(`lighthouse: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stats-lighthouse.test.ts`
Expected: PASS (5 tests).

Humo del CLI con las fixtures:

Run: `node scripts/merge-lighthouse.mjs tests/fixtures/lighthouse-mobile.json tests/fixtures/lighthouse-desktop.json && cat src/data/generated/stats.json && rm src/data/generated/stats.json`
Expected: `lighthouse: mobile 96, desktop 100` y un JSON con `github`/`umami` a `null`, `lighthouse` relleno y `generatedAt` ISO.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/lighthouse.mjs scripts/merge-lighthouse.mjs tests/stats-lighthouse.test.ts tests/fixtures/lighthouse-mobile.json tests/fixtures/lighthouse-desktop.json
git commit -m "feat(stats): merge Lighthouse median scores into stats.json

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Accesibilidad de la home al 100 (requisito del umbral)

Lighthouse (móvil, `dist/` actual) da accesibilidad **0.92** en `/` y `/es/`, así que el job de la Task 6 fallaría en cuanto entre en `main`. Auditorías que fallan (medido con `@lhci/cli` 0.15.1):

- `definition-list` y `dlitem`: en `About.astro` los `<dt>`/`<dd>` están dentro de un `<span>` dentro del `<div>` del `<dl>`.
- `image-redundant-alt`: en `NowCards.astro` el logo SVG de Kitty lleva `alt="Kitty"` y al lado ya hay `<span class="sr-only">Kitty</span>` (y el `title` del `<li>`).

Con estos dos cambios la misma medición da accesibilidad 1 y rendimiento 0.99 (móvil) y 1 (escritorio).

**Files:**

- Modify: `src/components/home/About.astro:36-50` (bloque `values.map`)
- Modify: `src/components/home/NowCards.astro:150-157` (`<img>` del logo)
- Test: `tests/build.test.ts` (añadir un `describe` al final)

**Interfaces:**

- Consumes / Produces: nada nuevo. Visualmente, el icono pasa a ir dentro del `<dt>` a la izquierda del título y el `<dd>` se alinea bajo el título con `pl-12` (36px de icono + 12px de hueco).

- [ ] **Step 1: Write the failing test**

Al final de `tests/build.test.ts`:

```ts
describe.skipIf(!built)('built home accessibility', () => {
  it('keeps dt and dd as direct children of the dl groups', () => {
    expect(page('index.html')).not.toMatch(/<span[^>]*>\s*<dt/);
    expect(page('es/index.html')).not.toMatch(/<span[^>]*>\s*<dt/);
  });

  it('does not repeat the tool name in the logo alt text', () => {
    expect(page('index.html')).not.toContain('alt="Kitty"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/build.test.ts -t "built home accessibility"`
Expected: FAIL (`alt="Kitty"` presente) si existe un `dist/` de una build anterior. Si no existe, el `describe` se salta: seguir igualmente; el Step 4 lo ejecuta tras la única build de la tarea.

- [ ] **Step 3: Write minimal implementation**

En `src/components/home/About.astro`, sustituir el cuerpo del `values.map` (el `<div class="flex gap-3">` completo) por:

```astro
<div class="flex flex-col gap-1">
  <dt class="flex items-center gap-3 text-[15px] font-bold leading-snug">
    <span
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent"
      aria-hidden="true"
    >
      <Icon name={v.icon} size={18} />
    </span>
    {v.title}
  </dt>
  <dd class="pl-12 text-[13px] leading-relaxed text-muted">{v.text}</dd>
</div>
```

En `src/components/home/NowCards.astro`, sustituir el `<img … alt={tool.name} … />` del logo por:

```astro
<img src={tool.svg.src} alt="" width="32" height="32" class="h-8 w-8" />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build && npx vitest run tests/build.test.ts`
Expected: build sin errores y PASS, con `built home accessibility` ejecutado (no saltado). No borrar `dist/`: la Task 6 lo reutiliza para medir Lighthouse en local.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/About.astro src/components/home/NowCards.astro tests/build.test.ts
git commit -m "fix(a11y): valid definition list and no redundant logo alt on the home

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Lighthouse CI con umbral (`lighthouserc.cjs` y job en `ci.yml`)

**Files:**

- Create: `lighthouserc.cjs`
- Modify: `.github/workflows/ci.yml` (reescritura completa: Node 22, artefacto `dist`, job `lighthouse`)
- Modify: `package.json` (devDependency `@lhci/cli`, vía `npm i -D`)
- Modify: `.gitignore`, `.prettierignore` (salidas de lhci)

**Interfaces:**

- Consumes: `dist/` de la build; `scripts/merge-lighthouse.mjs` (Task 4) lo usará la Task 7 sobre el artefacto `lighthouse`.
- Produces: artefacto `lighthouse` con `mobile/manifest.json` y `desktop/manifest.json` (más los informes), 30 días. Job `lighthouse` rojo en push a `main` si rendimiento < 0.95 o accesibilidad < 1 (mediana de 3 pasadas) en `/` o `/es/`, móvil o escritorio; en PR no bloquea.

- [ ] **Step 1: Instalar la dependencia**

Run: `npm i -D @lhci/cli@^0.15.1`
Expected: `package.json` gana `"@lhci/cli": "^0.15.1"` en `devDependencies` y cambia `package-lock.json`.

- [ ] **Step 2: Configuración**

Crear `lighthouserc.cjs` (`.cjs` porque `package.json` tiene `"type": "module"`):

```js
const desktop = process.env.LH_FORM_FACTOR === 'desktop';

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/', 'http://localhost/es/'],
      numberOfRuns: 3,
      settings: desktop ? { preset: 'desktop' } : {},
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 1, aggregationMethod: 'median-run' }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: desktop ? './lighthouse/desktop' : './lighthouse/mobile',
    },
  },
};
```

Sustituir `.github/workflows/ci.yml` completo por:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run astro check

      - name: Build
        run: npm run build

      - name: Test
        run: npm run test

      - name: Keep the build for Lighthouse
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
          retention-days: 1

  lighthouse:
    needs: check
    runs-on: ubuntu-latest
    continue-on-error: ${{ github.event_name == 'pull_request' }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist

      - name: Lighthouse mobile
        run: |
          npx lhci collect --config=lighthouserc.cjs
          npx lhci upload --config=lighthouserc.cjs
          npx lhci assert --config=lighthouserc.cjs

      - name: Lighthouse desktop
        if: ${{ !cancelled() }}
        env:
          LH_FORM_FACTOR: desktop
        run: |
          npx lhci collect --config=lighthouserc.cjs
          npx lhci upload --config=lighthouserc.cjs
          npx lhci assert --config=lighthouserc.cjs

      - name: Keep the Lighthouse reports
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse
          path: lighthouse
          retention-days: 30
```

Añadir al final de `.gitignore`:

```
# Lighthouse CI output
.lighthouseci/
lighthouse/
```

Añadir al final de `.prettierignore`:

```
.lighthouseci/
lighthouse/
```

- [ ] **Step 3: Validar**

Run: `npx --yes @action-validator/cli .github/workflows/ci.yml && npx prettier --check lighthouserc.cjs .github/workflows/ci.yml && npm run lint`
Expected: sin salida de error del validador y Prettier/ESLint limpios.

- [ ] **Step 4: Medir en local (Chrome está en `/usr/bin/google-chrome`; reutiliza el `dist/` de la Task 5, sin build nueva)**

Run:

```bash
npx lhci collect --config=lighthouserc.cjs && npx lhci upload --config=lighthouserc.cjs && npx lhci assert --config=lighthouserc.cjs; echo "mobile $?"
LH_FORM_FACTOR=desktop npx lhci collect --config=lighthouserc.cjs && LH_FORM_FACTOR=desktop npx lhci upload --config=lighthouserc.cjs && LH_FORM_FACTOR=desktop npx lhci assert --config=lighthouserc.cjs; echo "desktop $?"
node scripts/merge-lighthouse.mjs lighthouse/mobile/manifest.json lighthouse/desktop/manifest.json
rm -rf lighthouse .lighthouseci src/data/generated/stats.json
```

Expected: `mobile 0`, `desktop 0`, `lighthouse: mobile 99, desktop 100` (±1). Si `mobile` sale con 1, leer la auditoría que falla en la salida de `lhci assert` y arreglarla en ≤3 ficheros antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add lighthouserc.cjs .github/workflows/ci.yml package.json package-lock.json .gitignore .prettierignore
git commit -m "ci: Lighthouse CI job with performance and accessibility thresholds

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Workflow `refresh-stats.yml` (cron diario y commit si cambia)

**Files:**

- Create: `.github/workflows/refresh-stats.yml`

**Interfaces:**

- Consumes: `scripts/fetch-data.mjs` (Task 3), `scripts/merge-lighthouse.mjs` (Task 4), artefacto `lighthouse` del último run **completado** (no solo `success`: si el umbral falla el run sale `failure` pero los manifiestos se suben igual) de `ci.yml` en push a `main` (Task 6).
- Produces: commit `chore(stats): refresh data` del bot en `main` solo si `src/data/generated/stats.json` cambió. Un push hecho con `GITHUB_TOKEN` no dispara otros workflows (no hay bucle con `ci.yml`), pero sí el deploy de Vercel por la integración de Git.

- [ ] **Step 1: Escribir el workflow**

Crear `.github/workflows/refresh-stats.yml`:

```yaml
name: Refresh stats

on:
  schedule:
    - cron: '0 5 * * *'
  workflow_dispatch:

permissions:
  contents: write
  actions: read

concurrency:
  group: refresh-stats
  cancel-in-progress: false

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Fetch GitHub and Umami data
        env:
          GITHUB_TOKEN: ${{ secrets.STATS_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
          UMAMI_API_KEY: ${{ secrets.UMAMI_API_KEY }}
          UMAMI_WEBSITE_ID: ${{ secrets.UMAMI_WEBSITE_ID }}
        run: node scripts/fetch-data.mjs

      - name: Download the latest Lighthouse reports from main
        id: reports
        continue-on-error: true
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          run_id=$(gh run list --workflow ci.yml --branch main --event push --status completed --limit 1 --json databaseId --jq '.[0].databaseId')
          test -n "$run_id"
          gh run download "$run_id" --name lighthouse --dir lighthouse

      - name: Merge Lighthouse scores
        if: ${{ steps.reports.outcome == 'success' }}
        run: node scripts/merge-lighthouse.mjs lighthouse/mobile/manifest.json lighthouse/desktop/manifest.json

      - name: Commit the data if it changed
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
          git add src/data/generated/stats.json
          if git diff --cached --quiet; then
            echo 'stats.json unchanged'
            exit 0
          fi
          git commit -m 'chore(stats): refresh data'
          git push
```

Notas: `permissions` explícito deja a cero lo no listado, por eso lleva `actions: read` (para `gh run download`) junto a `contents: write`. No hace falta `npm ci`: los scripts no tienen dependencias. `secrets.STATS_GITHUB_TOKEN || secrets.GITHUB_TOKEN` usa un PAT solo si el usuario lo crea.

- [ ] **Step 2: Validar**

Run: `npx --yes @action-validator/cli .github/workflows/refresh-stats.yml && npx prettier --check .github/workflows/refresh-stats.yml`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/refresh-stats.yml
git commit -m "ci(stats): daily refresh that commits stats.json when it changes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Umami en el layout gateado por `PUBLIC_UMAMI_WEBSITE_ID` y pie condicional

**Files:**

- Modify: `src/layouts/BaseLayout.astro` (script de Umami y prop del pie)
- Modify: `src/components/site/Footer.astro` (prop `analytics`)
- Modify: `src/i18n/translations.ts` (clave `footer.privacyNoAnalytics` en `en` y `es`)
- Modify: `.env.example`
- Test: `tests/footer.test.ts` (nuevo)

**Interfaces:**

- Consumes: `import.meta.env.PUBLIC_UMAMI_WEBSITE_ID` en build.
- Produces: `Footer` con prop obligatoria `analytics: boolean` (solo la usa `BaseLayout.astro`, único sitio que monta `<Footer>`); clave i18n `footer.privacyNoAnalytics`.

- [ ] **Step 1: Write the failing test**

Crear `tests/footer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../src/components/site/Footer.astro';

async function render(analytics: boolean, lang: 'en' | 'es' = 'en') {
  const container = await AstroContainer.create();
  return container.renderToString(Footer, {
    props: { lang, currentPath: lang === 'es' ? '/es/stats/' : '/stats/', analytics },
  });
}

describe('Footer privacy line', () => {
  it('mentions Umami only when the tracking script is on the page', async () => {
    expect(await render(true)).toContain('Analytics self-hosted with Umami');
    expect(await render(true, 'es')).toContain('Analítica autoalojada con Umami');
  });

  it('drops the Umami sentence when there is no tracking', async () => {
    const en = await render(false);
    expect(en).toContain('No cookies, no trackers. Source under AGPL.');
    expect(en).not.toContain('Umami');
    const es = await render(false, 'es');
    expect(es).toContain('Sin cookies ni rastreadores. Código bajo AGPL.');
    expect(es).not.toContain('Umami');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/footer.test.ts`
Expected: FAIL en `drops the Umami sentence when there is no tracking` (el pie siempre dice "Analytics self-hosted with Umami").

- [ ] **Step 3: Write minimal implementation**

En `src/i18n/translations.ts`, en `en`, justo después de `'footer.privacy': …,`:

```ts
    'footer.privacyNoAnalytics': 'No cookies, no trackers. Source under AGPL.',
```

y en `es`, justo después de su `'footer.privacy': …,`:

```ts
    'footer.privacyNoAnalytics': 'Sin cookies ni rastreadores. Código bajo AGPL.',
```

En `src/components/site/Footer.astro`, añadir la prop y usarla:

```ts
interface Props {
  lang: Locale;
  currentPath: string;
  alternatePath?: string;
  analytics: boolean;
}
const { lang, currentPath, alternatePath, analytics } = Astro.props;
```

```astro
<span>{t(analytics ? 'footer.privacy' : 'footer.privacyNoAnalytics', lang)}</span>
```

En `src/layouts/BaseLayout.astro`, después de `const description = Astro.props.description ?? getDescription(lang);`:

```ts
const umamiWebsiteId: string | undefined = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID || undefined;
```

Sustituir el `<script defer src="https://analytics.alvarotc.com/script.js" data-website-id="4dc00bab-…"></script>` del `<head>` por:

```astro
{
  umamiWebsiteId && (
    <script
      is:inline
      defer
      src="https://analytics.alvarotc.com/script.js"
      data-website-id={umamiWebsiteId}
    />
  )
}
```

y el `<Footer lang={lang} currentPath={currentPath} alternatePath={alternate} />` por:

```astro
<Footer
  lang={lang}
  currentPath={currentPath}
  alternatePath={alternate}
  analytics={Boolean(umamiWebsiteId)}
/>
```

(Comprobado en build: con la variable sale `<script defer src="https://analytics.alvarotc.com/script.js" data-website-id="4dc00bab-…"></script>` y el pie con Umami; sin ella, ni script ni mención.)

Sustituir `.env.example` completo por:

```
# DeepL API Key (Free tier: https://www.deepl.com/pro-api)
# Required for npm run translate
DEEPL_API_KEY=your_deepl_api_key_here

# Umami website ID, read at build time. Without it the tracking script is not added
# and the footer drops the Umami sentence. Set it in Vercel too.
PUBLIC_UMAMI_WEBSITE_ID=

# Stats pipeline (npm run stats → src/data/generated/stats.json). Any missing
# source is written as null and its section is hidden.
# Local: GITHUB_TOKEN=$(gh auth token). In Actions the workflow token is used.
GITHUB_TOKEN=
# Umami API key (Settings → API keys, Umami 3.4+) and the website to read.
UMAMI_API_KEY=
UMAMI_WEBSITE_ID=
# Defaults to https://analytics.alvarotc.com
UMAMI_URL=
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/footer.test.ts tests/i18n-paths.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/site/Footer.astro src/i18n/translations.ts .env.example tests/footer.test.ts
git commit -m "feat(analytics): load Umami only when PUBLIC_UMAMI_WEBSITE_ID is set

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Página `/stats`: vista testeable, Lighthouse de escritorio, "otros" y fuentes gateadas

**Files:**

- Create: `src/components/stats/StatsView.astro` (cuerpo de la página, presentacional)
- Modify: `src/components/stats/StatsPage.astro` (reescritura: carga datos y envuelve `StatsView` en `BaseLayout`)
- Modify: `src/i18n/translations.ts` (`stats.lighthouseDesktop`, `stats.otherLanguages` y nuevo `stats.sourcesText`, en `en` y `es`)
- Test: `tests/stats-page.test.ts` (nuevo), `tests/fixtures/stats-data.ts` (nuevo)

**Interfaces:**

- Consumes: `StatsData`, `WritingStats`, `heatmapWeeks` de `src/lib/stats.ts`; `ContributionHeatmap`, `StatsGrid`, `Tag`; `formatDate`.
- Produces: `StatsView.astro` con `Props { lang: Locale; stats: StatsData; writing: WritingStats; now: Date; githubLogin: string }` y marcas DOM `data-section="code|writing|site|sources"`, `data-generated-at`, `data-most-active-commits`, `data-languages`, `data-most-read`. Cambios frente a la página actual: la tarjeta de Lighthouse suma escritorio; `other` se traduce; la sección de fuentes y su texto nuevo solo con `generatedAt`. Las tarjetas "RSS subscribers", "deploys since the redesign", "pull requests to other projects" y "JavaScript on the home page" de la maqueta no se pintan (no estaban en la página; el test lo fija). "JavaScript en la home" queda fuera: medirlo exige resolver los chunks que importa cada `<script type="module">` de `dist/index.html`, no es trivial.

- [ ] **Step 1: Write the failing test**

Crear `tests/fixtures/stats-data.ts`:

```ts
import type { StatsData, WritingStats } from '../../src/lib/stats';

export const statsNow = new Date('2026-09-24T12:00:00Z');

export const emptyStats: StatsData = {
  generatedAt: null,
  github: null,
  umami: null,
  lighthouse: null,
};

export const fullStats: StatsData = {
  generatedAt: '2026-09-24T05:00:00.000Z',
  github: {
    contributions: [
      { date: '2026-09-19', count: 55 },
      { date: '2026-09-20', count: 24 },
      { date: '2026-09-23', count: 6 },
    ],
    commitsThisYear: 2054,
    publicRepos: 16,
    stars: 1,
    streak: 1,
    mostActiveRepo: { name: 'basecero', commits30d: 486 },
    languages: [
      { name: 'JavaScript', percent: 32 },
      { name: 'TypeScript', percent: 28 },
      { name: 'Kotlin', percent: 25 },
      { name: 'Go', percent: 5 },
      { name: 'other', percent: 10 },
    ],
  },
  umami: {
    views30d: 1342,
    mostRead: [
      {
        path: '/es/blog/vps-observabilidad-completa/',
        title: 'Cómo monté mi VPS con observabilidad completa',
        views: 215,
      },
      { path: '/blog/new-website-new-direction/', title: 'New website, new direction', views: 150 },
    ],
  },
  lighthouse: { performanceMobile: 96, performanceDesktop: 100 },
};

export const writing: WritingStats = {
  posts: 5,
  words: 12480,
  topics: [
    { tag: 'docker', count: 2 },
    { tag: 'astro', count: 1 },
  ],
};
```

Crear `tests/stats-page.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StatsView from '../src/components/stats/StatsView.astro';
import type { Locale } from '../src/i18n/translations';
import type { StatsData } from '../src/lib/stats';
import { emptyStats, fullStats, statsNow, writing } from './fixtures/stats-data';

async function render(stats: StatsData, lang: Locale = 'en') {
  const container = await AstroContainer.create();
  return container.renderToString(StatsView, {
    props: { lang, stats, writing, now: statsNow, githubLogin: 'alvarotorresc' },
  });
}

describe('StatsView with every source', () => {
  it('draws a 53 week heatmap', async () => {
    const html = await render(fullStats);
    expect(html.match(/<rect/g)).toHaveLength(53 * 7);
  });

  it('keeps the space between a number and its label', async () => {
    const html = await render(fullStats);
    expect(html).toContain('486 commits in the last 30 days');
    expect(await render(fullStats, 'es')).toContain('486 commits en los últimos 30 días');
  });

  it('formats numbers for the page language', async () => {
    expect(await render(fullStats)).toContain('2,054');
    expect(await render(fullStats, 'es')).toContain('2054');
  });

  it('translates the other bucket of the languages', async () => {
    expect(await render(fullStats)).toContain('Go 5%, other 10%');
    expect(await render(fullStats, 'es')).toContain('Go 5%, otros 10%');
  });

  it('shows Umami views and the most read posts', async () => {
    const html = await render(fullStats);
    expect(html).toContain('1,342');
    expect(html).toContain('views, last 30 days, Umami');
    expect(html).toContain('data-most-read');
    expect(html).toContain('Cómo monté mi VPS con observabilidad completa');
  });

  it('shows the mobile and desktop Lighthouse scores', async () => {
    const html = await render(fullStats, 'es');
    expect(html).toContain('data-section="site"');
    expect(html).toContain('Rendimiento Lighthouse, móvil');
    expect(html).toContain('Rendimiento Lighthouse, escritorio');
  });

  it('has no cards that cannot be verified', async () => {
    const html = await render(fullStats);
    expect(html).not.toContain('RSS subscribers');
    expect(html).not.toContain('deploys since the redesign');
    expect(html).not.toContain('pull requests to other projects');
    expect(html).not.toContain('JavaScript on the home page');
  });

  it('explains where the numbers come from', async () => {
    const html = await render(fullStats);
    expect(html).toContain('data-section="sources"');
    expect(html).toContain('commits the numbers to the repository');
    expect(html).toContain('data-generated-at');
  });
});

describe('StatsView without generated data', () => {
  it('shows only the local writing numbers', async () => {
    const html = await render(emptyStats);
    expect(html).toContain('data-section="writing"');
    expect(html).not.toContain('data-section="code"');
    expect(html).not.toContain('data-section="site"');
    expect(html).not.toContain('<rect');
    expect(html).not.toContain('views, last 30 days, Umami');
    expect(html).not.toContain('data-most-read');
  });

  it('hides the sources section and the build date', async () => {
    const html = await render(emptyStats);
    expect(html).not.toContain('data-section="sources"');
    expect(html).not.toContain('data-generated-at');
  });

  it('hides a single source that failed', async () => {
    const html = await render({ ...fullStats, umami: null });
    expect(html).toContain('data-section="code"');
    expect(html).not.toContain('data-most-read');
    expect(html).toContain('data-section="sources"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stats-page.test.ts`
Expected: FAIL: `Failed to resolve import "../src/components/stats/StatsView.astro"`.

- [ ] **Step 3: Write minimal implementation**

En `src/i18n/translations.ts`, bloque `en`, sustituir desde `'stats.lighthouse': 'Lighthouse performance, mobile',` hasta el final de `'stats.sourcesText': …,` por:

```ts
    'stats.lighthouse': 'Lighthouse performance, mobile',
    'stats.lighthouseDesktop': 'Lighthouse performance, desktop',
    'stats.otherLanguages': 'other',
    'stats.sources': 'Where the numbers come from',
    'stats.sourcesText':
      'GitHub GraphQL API and Umami API, queried once a day by a scheduled GitHub Action that commits the numbers to the repository; that commit triggers a new build. Lighthouse runs in CI on every push to main, three runs on mobile and three on desktop, and the median run counts. Nothing runs in your browser to compute this page.',
```

y en el bloque `es`, lo mismo desde `'stats.lighthouse': 'Rendimiento Lighthouse, móvil',`:

```ts
    'stats.lighthouse': 'Rendimiento Lighthouse, móvil',
    'stats.lighthouseDesktop': 'Rendimiento Lighthouse, escritorio',
    'stats.otherLanguages': 'otros',
    'stats.sources': 'De dónde salen los números',
    'stats.sourcesText':
      'API GraphQL de GitHub y API de Umami, consultadas una vez al día por una GitHub Action programada que guarda los números en el repositorio; ese commit dispara una build nueva. Lighthouse corre en CI en cada push a main, tres pasadas en móvil y tres en escritorio, y cuenta la pasada mediana. Nada se ejecuta en tu navegador para calcular esta página.',
```

Crear `src/components/stats/StatsView.astro`:

```astro
---
import ContributionHeatmap from './ContributionHeatmap.astro';
import StatsGrid from './StatsGrid.astro';
import Tag from '../ui/Tag.astro';
import { t, type Locale } from '../../i18n/translations';
import { heatmapWeeks, type StatsData, type WritingStats } from '../../lib/stats';
import { formatDate } from '../../lib/utils';

interface Props {
  lang: Locale;
  stats: StatsData;
  writing: WritingStats;
  now: Date;
  githubLogin: string;
}
const { lang, stats, writing, now, githubLogin } = Astro.props;
const locale = lang === 'es' ? 'es-ES' : 'en-US';
const num = (n: number) => n.toLocaleString(locale);
const weeks = stats.github ? heatmapWeeks(stats.github.contributions, now) : [];
const languageName = (name: string) => (name === 'other' ? t('stats.otherLanguages', lang) : name);
---

<div class="container-page flex flex-col gap-4 py-14">
  <header class="flex flex-col gap-2.5">
    <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{t('stats.title', lang)}</h1>
    <p class="max-w-[640px] text-muted">{t('stats.subtitle', lang)}</p>
    {
      stats.generatedAt && (
        <span class="font-mono text-xs text-faint" data-generated-at>
          {t('stats.lastBuild', lang)}: {formatDate(new Date(stats.generatedAt), lang)}
        </span>
      )
    }
  </header>

  {
    stats.github && (
      <section data-section="code" class="flex flex-col gap-4 border-t border-border pt-10">
        <h2 class="text-[22px] font-bold tracking-tight">{t('stats.code', lang)}</h2>
        <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-[2fr_1fr]">
          <div class="card-sm flex flex-col gap-3.5 p-5">
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-sm font-bold">{t('stats.contributions', lang)}</span>
              <span class="font-mono text-xs text-faint">github.com/{githubLogin}</span>
            </div>
            <ContributionHeatmap weeks={weeks} lang={lang} />
          </div>
          <StatsGrid
            items={[
              { value: num(stats.github.commitsThisYear), label: t('stats.commits', lang) },
              { value: num(stats.github.publicRepos), label: t('stats.repos', lang) },
              { value: num(stats.github.stars), label: t('stats.stars', lang) },
              { value: num(stats.github.streak), label: t('stats.streak', lang) },
            ]}
          />
        </div>
        {(stats.github.mostActiveRepo || stats.github.languages.length > 0) && (
          <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {stats.github.mostActiveRepo && (
              <div class="card-sm flex flex-col gap-2 p-[18px]">
                <span class="text-xs font-bold text-faint">{t('stats.mostActive', lang)}</span>
                <span class="font-mono text-base font-bold">
                  {stats.github.mostActiveRepo.name}
                </span>
                <span class="text-[13px] text-muted" data-most-active-commits>
                  {`${num(stats.github.mostActiveRepo.commits30d)} ${t('stats.commits30d', lang)}`}
                </span>
              </div>
            )}
            {stats.github.languages.length > 0 && (
              <div class="card-sm flex flex-col gap-2 p-[18px]">
                <span class="text-xs font-bold text-faint">{t('stats.languages', lang)}</span>
                <span class="text-[13px] text-muted" data-languages>
                  {stats.github.languages
                    .map((l) => `${languageName(l.name)} ${l.percent}%`)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </section>
    )
  }

  <section data-section="writing" class="flex flex-col gap-4 border-t border-border pt-10">
    <h2 class="text-[22px] font-bold tracking-tight">{t('stats.writing', lang)}</h2>
    <StatsGrid
      items={[
        { value: num(writing.posts), label: t('stats.postsTwoLangs', lang) },
        { value: num(writing.words), label: t('stats.words', lang) },
        ...(stats.umami
          ? [{ value: num(stats.umami.views30d), label: t('stats.views', lang) }]
          : []),
      ]}
    />
    {
      (writing.topics.length > 0 || (stats.umami && stats.umami.mostRead.length > 0)) && (
        <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {stats.umami && stats.umami.mostRead.length > 0 && (
            <div class="card-sm flex flex-col gap-2 p-[18px]" data-most-read>
              <span class="text-xs font-bold text-faint">{t('stats.mostRead', lang)}</span>
              <ul class="flex flex-col">
                {stats.umami.mostRead.map((page) => (
                  <li class="flex items-center justify-between gap-4 border-t border-border py-2.5 first:border-t-0">
                    <span class="text-sm font-semibold">{page.title}</span>
                    <span class="font-mono text-[13px] text-faint">{num(page.views)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {writing.topics.length > 0 && (
            <div class="card-sm flex flex-col gap-2 p-[18px]">
              <span class="text-xs font-bold text-faint">{t('stats.topics', lang)}</span>
              <div class="flex flex-wrap gap-2">
                {writing.topics.map((topic) => (
                  <Tag>{`${topic.tag} ${topic.count}`}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  </section>

  {
    stats.lighthouse && (
      <section data-section="site" class="flex flex-col gap-4 border-t border-border pt-10">
        <h2 class="text-[22px] font-bold tracking-tight">{t('stats.site', lang)}</h2>
        <StatsGrid
          items={[
            {
              value: num(stats.lighthouse.performanceMobile),
              label: t('stats.lighthouse', lang),
            },
            {
              value: num(stats.lighthouse.performanceDesktop),
              label: t('stats.lighthouseDesktop', lang),
            },
          ]}
        />
      </section>
    )
  }

  {
    stats.generatedAt && (
      <section data-section="sources" class="flex flex-col gap-3 border-t border-border pt-10">
        <h2 class="text-[22px] font-bold tracking-tight">{t('stats.sources', lang)}</h2>
        <p class="max-w-[640px] text-sm leading-relaxed text-muted">
          {t('stats.sourcesText', lang)}
        </p>
      </section>
    )
  }
</div>
```

Sustituir `src/components/stats/StatsPage.astro` completo por:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import StatsView from './StatsView.astro';
import { t, type Locale } from '../../i18n/translations';
import { getPosts } from '../../lib/posts';
import { loadStats, writingStats } from '../../lib/stats';
import { getAuthor } from '../../lib/config';

interface Props {
  lang: Locale;
}
const { lang } = Astro.props;
const alternatePath = lang === 'es' ? '/stats/' : '/es/stats/';
const writing = writingStats(await getPosts(lang));
---

<BaseLayout
  title={t('stats.title', lang)}
  description={t('stats.subtitle', lang)}
  lang={lang}
  alternatePath={alternatePath}
>
  <StatsView
    lang={lang}
    stats={loadStats()}
    writing={writing}
    now={new Date()}
    githubLogin={getAuthor().github}
  />
</BaseLayout>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/stats-page.test.ts tests/stats.test.ts`
Expected: PASS (11 tests en `stats-page.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add src/components/stats/StatsView.astro src/components/stats/StatsPage.astro src/i18n/translations.ts tests/stats-page.test.ts tests/fixtures/stats-data.ts
git commit -m "feat(stats): testable stats view, desktop Lighthouse and gated sources

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Contador de commits real en la home y build con datos reales

**Files:**

- Modify: `src/components/home/StackStats.astro` (número con formato del idioma)
- Modify: `src/pages/index.astro`, `src/pages/es/index.astro` (pasan `commits` desde `loadStats()`)
- Test: `tests/stack-stats.test.ts` (nuevo), `tests/build.test.ts` (tres `describe` al final)

**Interfaces:**

- Consumes: `loadStats` (`src/lib/stats.ts`), `StackStats` (ya filtra contadores `undefined` y ajusta columnas), todo lo anterior.
- Produces: la home enseña `commitsThisYear` solo si hay bloque `github`; `/stats` construido con datos reales verificado por tests de build que se saltan si no hay datos.

- [ ] **Step 1: Write the failing test**

Crear `tests/stack-stats.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StackStats from '../src/components/home/StackStats.astro';

async function render(stats: { commits?: number; posts?: number; apps?: number }, lang = 'en') {
  const container = await AstroContainer.create();
  return container.renderToString(StackStats, { props: { lang, stats } });
}

describe('StackStats counters', () => {
  it('shows the real commits of the year, formatted for the language', async () => {
    const html = await render({ commits: 2054, posts: 5, apps: 3 });
    expect(html).toContain('2,054');
    expect(html).toContain('commits this year');
    expect(html).toContain('grid-cols-3');
  });

  it('hides the commits counter when there is no GitHub data', async () => {
    const html = await render({ commits: undefined, posts: 5, apps: 3 }, 'es');
    expect(html).not.toContain('commits este año');
    expect(html).toContain('posts publicados');
    expect(html).toContain('grid-cols-2');
  });
});
```

En `tests/build.test.ts`, añadir el import tras `import { join, resolve } from 'node:path';`:

```ts
import { loadStats } from '../src/lib/stats';
```

y al final del fichero:

```ts
const stats = loadStats();

describe.skipIf(!built || !stats.github)('built stats page with GitHub data', () => {
  it('draws the 53 week heatmap', () => {
    expect(page('stats/index.html').match(/<rect/g)).toHaveLength(53 * 7);
  });

  it('keeps the space between the number and the label', () => {
    const repo = stats.github?.mostActiveRepo;
    if (!repo) return;
    const commits = repo.commits30d.toLocaleString('en-US');
    expect(page('stats/index.html')).toContain(`${commits} commits in the last 30 days`);
  });

  it('explains where the numbers come from', () => {
    expect(page('stats/index.html')).toContain('data-section="sources"');
    expect(page('es/stats/index.html')).toContain('De dónde salen los números');
  });

  it('shows the real commits of the year on the home page', () => {
    const commits = stats.github?.commitsThisYear.toLocaleString('en-US') ?? '';
    expect(page('index.html')).toMatch(
      new RegExp(`>\\s*${commits}\\s*</span>\\s*<span[^>]*>commits this year<`),
    );
  });
});

describe.skipIf(!built || stats.generatedAt !== null)('built stats page without data', () => {
  it('hides the heatmap, the sources section and the commits counter', () => {
    expect(page('stats/index.html')).not.toContain('<rect');
    expect(page('stats/index.html')).not.toContain('data-section="sources"');
    expect(page('index.html')).not.toContain('commits this year');
  });
});

describe.skipIf(!built)('built analytics', () => {
  it('mentions Umami in the footer only when its script is on the page', () => {
    const html = page('index.html');
    const tracked = html.includes('https://analytics.alvarotc.com/script.js');
    expect(html.includes('Analytics self-hosted with Umami')).toBe(tracked);
    expect(html.includes('No cookies, no trackers. Source under AGPL.')).toBe(!tracked);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/stack-stats.test.ts`
Expected: FAIL en `shows the real commits of the year` (sale `2054`, sin separador de miles).

- [ ] **Step 3: Write minimal implementation**

En `src/components/home/StackStats.astro`, después de `const prefix = lang === 'es' ? '/es' : '';`:

```ts
const locale = lang === 'es' ? 'es-ES' : 'en-US';
```

y sustituir `<span class="font-mono text-[26px] font-extrabold">{c.value}</span>` por:

```astro
<span class="font-mono text-[26px] font-extrabold">
  {c.value.toLocaleString(locale)}
</span>
```

En `src/pages/index.astro`, añadir tras `import { personJsonLd } from '../lib/jsonld';`:

```ts
import { loadStats } from '../lib/stats';
```

tras la línea `const apps = …`:

```ts
const commits = loadStats().github?.commitsThisYear;
```

y cambiar `<StackStats lang={lang} stats={{ posts: posts.length, apps }} />` por:

```astro
<StackStats lang={lang} stats={{ commits, posts: posts.length, apps }} />
```

En `src/pages/es/index.astro`, lo mismo con el import `import { loadStats } from '../../lib/stats';` tras `import { personJsonLd } from '../../lib/jsonld';`.

- [ ] **Step 4: Run test to verify it passes (build con datos reales, sin commitearlos)**

Run: `npx vitest run tests/stack-stats.test.ts`
Expected: PASS.

Run:

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/fetch-data.mjs
npm run build && npx vitest run
```

Expected: `github: ok`, `umami: skipped, missing credentials` (salvo que haya `.env` con Umami); build sin errores; toda la suite en verde, con `built stats page with GitHub data` y `built analytics` ejecutados y `built stats page without data` saltado. Comprobación a ojo: `grep -o 'data-most-active-commits>[^<]*' dist/stats/index.html` → `…>486 commits in the last 30 days` (el número varía) y `grep -o 'data-languages>[^<]*' dist/es/stats/index.html` termina en `otros N%`.

Después, borrar el JSON local (ve contribuciones privadas; lo publica el workflow):

Run: `rm src/data/generated/stats.json && git status --short src/data`
Expected: sin salida.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/StackStats.astro src/pages/index.astro src/pages/es/index.astro tests/stack-stats.test.ts tests/build.test.ts
git commit -m "feat(home): real commits counter from stats.json, hidden without data

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Autorrevisión

**Cobertura de la spec:**

- GitHub: `contributions`, `commitsThisYear`, `publicRepos`, `stars`, `streak`, `mostActiveRepo` (commits 30 días por `history(since)`, filtrado por autor), `languages` (top 4 + `other`), login leído de `site.config.ts`: Task 1.
- Umami: `views30d`, `mostRead` top 3 `/blog/*` y `/es/blog/*` con título desde los posts, `x-umami-api-key` (más `Authorization: Bearer` para la v3 self-hosted), `UMAMI_URL` por defecto: Task 2.
- `scripts/fetch-data.mjs` sin dependencias, `null` por fuente, `generatedAt`, escribe con una sola fuente, sale 0 salvo fallo de escritura, logs por fuente, tests sin red, `src/data/generated/` fuera del `.gitignore`: Tasks 1-3.
- Lighthouse: `lighthouserc.cjs`, `staticDistDir`, `/` y `/es/`, móvil y `preset: desktop`, rendimiento ≥ 0.95 y accesibilidad = 1 que fallan, artefacto, mezcla en `stats.json` con `merge-lighthouse.mjs`: Tasks 4 y 6; requisito previo de accesibilidad: Task 5; llegada al JSON: Task 7.
- `refresh-stats.yml`: cron `0 5 * * *`, `workflow_dispatch`, `contents: write`, commit del bot `chore(stats): refresh data` solo si cambia, deploy por el push: Task 7.
- Umami en `BaseLayout.astro` solo con `PUBLIC_UMAMI_WEBSITE_ID`; pie "Sin cookies ni rastreadores. Código bajo AGPL." sin él; `.env.example`: Task 8.
- Página: tarjetas no verificables fuera, "JavaScript en la home" fuera (motivo en la Task 9), sección de fuentes solo con `generatedAt` y con texto fiel, bilingüe: Task 9.
- Home: `commitsThisYear` real u oculto: Task 10.
- Fuera de alcance respetado: ListenBrainz, estrellas por proyecto, Umami de otras webs.

**Placeholders:** ninguno; todos los ficheros nuevos van completos y las ediciones indican ancla y texto exactos. Todo el código de `scripts/lib`, los tests, las fixtures, `StatsView.astro`, `lighthouserc.cjs` y los dos workflows se ejecutó en una copia del repo: los 62 tests nuevos en verde, `astro check` con 0 errores, `astro build` correcta, `lhci` real en móvil y escritorio y `action-validator` sin errores.

**Consistencia de nombres:** `USER_ID_QUERY`, `STATS_QUERY`, `githubLogin`, `statsVariables`, `contributionsFromCalendar`, `currentStreak`, `languageShares`, `mostActiveRepo`, `parseGithub`, `fetchGithub`; `umamiRange`, `umamiHeaders`, `parseViews`, `blogPath`, `frontmatter`, `loadPostTitles`, `mostRead`, `fetchUmami`; `readStats`, `buildStats`, `withLighthouse`, `serializeStats`, `writeStats`; `representativeScore`, `lighthouseScores`; `LH_FORM_FACTOR`; artefactos `dist` y `lighthouse`; fixtures `github-stats.json`, `github-user-id.json`, `umami-stats-v3.json`, `umami-stats-v2.json`, `umami-metrics.json`, `lighthouse-mobile.json`, `lighthouse-desktop.json`, `stats-data.ts` (`statsNow`, `emptyStats`, `fullStats`, `writing`); marcas `data-section`, `data-generated-at`, `data-most-active-commits`, `data-languages`, `data-most-read`; claves `footer.privacyNoAnalytics`, `stats.lighthouseDesktop`, `stats.otherLanguages`.

**Review Focus con tests asignados:** 1 → Tasks 9 y 10; 2 → Tasks 3, 9 y 10; 3 → Tasks 9 y 10; 4 → Task 1; 5 → Tasks 4 y 6; 6 → Task 2; 7 → Tasks 8 y 10; 8 → Task 10.

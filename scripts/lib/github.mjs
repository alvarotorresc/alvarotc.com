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

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

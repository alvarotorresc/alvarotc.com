import { describe, it, expect } from 'vitest';
import { normalize, searchItems, type SearchItem } from '../src/lib/search';

const item = (
  kind: SearchItem['kind'],
  lang: SearchItem['lang'],
  title: string,
  text: string,
): SearchItem => ({
  kind,
  lang,
  title,
  text,
  url: `/${kind}/${normalize(title).replace(/ /g, '-')}`,
});

const corpus: SearchItem[] = [
  item('page', 'es', 'Sobre mí', 'Desarrollador backend'),
  item('page', 'en', 'About', 'Backend developer'),
  item('project', 'es', 'Bito', 'Presupuesto offline kotlin android'),
  item('post', 'es', 'Observabilidad en el VPS', 'Grafana, Loki y Prometheus en un VPS barato'),
  item('post', 'es', 'De una idea a una APK', 'Compilar en 24 horas, kotlin'),
  item('post', 'en', 'Observability on a VPS', 'Grafana and Loki'),
];

describe('normalize', () => {
  it('lowercases, strips diacritics and collapses spaces', () => {
    expect(normalize('  Observabilidad   EN el VPS ')).toBe('observabilidad en el vps');
    expect(normalize('Sobre MÍ')).toBe('sobre mi');
    expect(normalize('Álvaro Torres')).toBe('alvaro torres');
  });
});

describe('searchItems', () => {
  it('only returns items of the requested language', () => {
    const results = searchItems(corpus, 'vps', 'es');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Observabilidad en el VPS');
  });

  it('requires every term to match', () => {
    expect(searchItems(corpus, 'kotlin android', 'es').map((r) => r.title)).toEqual(['Bito']);
    expect(searchItems(corpus, 'kotlin swift', 'es')).toEqual([]);
  });

  it('ignores accents in the query', () => {
    expect(searchItems(corpus, 'sobre mi', 'es').map((r) => r.title)).toEqual(['Sobre mí']);
  });

  it('ranks a title match above a text-only match', () => {
    const results = searchItems(corpus, 'observabilidad', 'es');
    expect(results.map((r) => r.title)).toEqual(['Observabilidad en el VPS']);
    const grafana = searchItems(corpus, 'grafana', 'es');
    expect(grafana.map((r) => r.title)).toEqual(['Observabilidad en el VPS']);
  });

  it('puts pages first when the query is empty', () => {
    const results = searchItems(corpus, '   ', 'es');
    expect(results.map((r) => r.kind)).toEqual(['page', 'project', 'post', 'post']);
  });

  it('honours the limit', () => {
    expect(searchItems(corpus, '', 'es', 2)).toHaveLength(2);
  });
});

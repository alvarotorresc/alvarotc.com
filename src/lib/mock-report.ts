/* eslint-disable no-console */
import { getCollection } from 'astro:content';

export function mockEntries(entries: Array<{ id: string; data: { mock?: boolean } }>): string[] {
  return entries.filter((e) => e.data.mock === true).map((e) => e.id);
}

export function warnMock(label: string, ids: string[]): void {
  if (ids.length === 0) return;
  console.warn(`[mock] ${label}: ${ids.join(', ')}`);
}

export async function reportMockContent(): Promise<void> {
  warnMock('experience', mockEntries(await getCollection('experience')));
  warnMock('now', mockEntries(await getCollection('now')));
  warnMock('interests', mockEntries(await getCollection('interests')));
}

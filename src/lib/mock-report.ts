/* eslint-disable no-console */

export function mockEntries(entries: Array<{ id: string; data: { mock?: boolean } }>): string[] {
  return entries.filter((e) => e.data.mock === true).map((e) => e.id);
}

export function warnMock(label: string, ids: string[]): void {
  if (ids.length === 0) return;
  console.warn(`[mock] ${label}: ${ids.join(', ')}`);
}

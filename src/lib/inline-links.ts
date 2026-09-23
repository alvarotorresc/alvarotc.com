const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_HREF = /^(https?:\/\/|\/|#|mailto:)/;

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

export function inlineLinks(text: string): string {
  let html = '';
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    html += escapeHtml(text.slice(last, match.index));
    const safe = SAFE_HREF.test(href) ? href : '#';
    html += `<a href="${escapeHtml(safe)}">${escapeHtml(label)}</a>`;
    last = match.index + whole.length;
  }
  return html + escapeHtml(text.slice(last));
}

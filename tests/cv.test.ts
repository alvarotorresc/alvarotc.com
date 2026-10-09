import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { cvPdfPath } from '../src/lib/cv';

const PDF = {
  es: 'public/cv/Alvaro_Torres_Carrasco_CV_ES.pdf',
  en: 'public/cv/Alvaro_Torres_Carrasco_CV_EN.pdf',
} as const;

describe('cvPdfPath', () => {
  it('points each language to its own PDF under /cv/', () => {
    expect(cvPdfPath('en')).toBe('/cv/Alvaro_Torres_Carrasco_CV_EN.pdf');
    expect(cvPdfPath('es')).toBe('/cv/Alvaro_Torres_Carrasco_CV_ES.pdf');
  });
});

describe('public CV PDFs', () => {
  it.each(['es', 'en'] as const)('ships a real %s PDF in public/cv', (lang) => {
    expect(existsSync(PDF[lang])).toBe(true);
    expect(statSync(PDF[lang]).size).toBeGreaterThan(10 * 1024);
    expect(readFileSync(PDF[lang]).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it.each(['es', 'en'] as const)('keeps the %s PDF on a single page', (lang) => {
    // Typst writes one `/Type /Page` object per page; `/Type /Pages` is the tree root.
    const pages = readFileSync(PDF[lang], 'latin1').match(/\/Type\s*\/Page[^s]/g) ?? [];
    expect(pages).toHaveLength(1);
  });
});

describe('RenderCV sources', () => {
  const yaml = {
    es: readFileSync('cv/cv.es.yaml', 'utf8'),
    en: readFileSync('cv/cv.en.yaml', 'utf8'),
  };

  it.each(['es', 'en'] as const)('%s keeps only the public contact and no photo', (lang) => {
    expect(yaml[lang]).toContain('email: hello@alvarotc.com');
    expect(yaml[lang]).not.toMatch(/^\s*phone:/m);
    expect(yaml[lang]).not.toMatch(/^\s*photo:/m);
    expect(yaml[lang]).not.toMatch(/@gmail/i);
  });

  it.each(['es', 'en'] as const)('%s renders only the public PDF with the ATS theme', (lang) => {
    expect(yaml[lang]).toContain('theme: engineeringresumes');
    expect(yaml[lang]).toContain(
      `pdf_path: ../public/cv/Alvaro_Torres_Carrasco_CV_${lang.toUpperCase()}.pdf`,
    );
    expect(yaml[lang]).toContain('dont_generate_markdown: true');
    expect(yaml[lang]).toContain('dont_generate_html: true');
    expect(yaml[lang]).toContain('dont_generate_png: true');
  });

  it('uses Spanish months and "actualidad" in the Spanish CV', () => {
    expect(yaml.es).toContain('language: spanish');
    expect(yaml.es).toContain('present: actualidad');
  });

  it('writes the section titles in upper case and sets the name in bold, for ATS parsers', () => {
    expect(yaml.es.match(/^ {4}[A-ZÁÉÍÓÚÑ ]+:$/gm)).toEqual([
      '    RESUMEN:',
      '    HABILIDADES TÉCNICAS:',
      '    EXPERIENCIA PROFESIONAL:',
      '    PROYECTOS:',
      '    FORMACIÓN:',
    ]);
    expect(yaml.en.match(/^ {4}[A-Z ]+:$/gm)).toEqual([
      '    SUMMARY:',
      '    TECHNICAL SKILLS:',
      '    PROFESSIONAL EXPERIENCE:',
      '    PROJECTS:',
      '    EDUCATION:',
    ]);
    for (const lang of ['es', 'en'] as const) {
      expect(yaml[lang]).toContain('    bold:\n      name: true');
    }
  });

  it('lists the spoken languages inside the skills block, not as a trailing section', () => {
    expect(yaml.es).toContain('- label: Idiomas\n        details: español (nativo), inglés B2');
    expect(yaml.en).toContain('- label: Languages\n        details: Spanish (native), English B2');
    expect(yaml.es).not.toMatch(/^ {4}IDIOMAS:/im);
    expect(yaml.en).not.toMatch(/^ {4}LANGUAGES:/im);
  });

  it('lists the four projects in the agreed order with a status on the right', () => {
    const order = (text: string) =>
      [...text.matchAll(/^ {6}- name: ['"]?(?:\[([^\]]+)\][^\n]*|([^'"\n]+?))['"]?$/gm)].map((m) =>
        (m[1] ?? m[2]).trim(),
      );
    expect(order(yaml.es)).toEqual([
      'Cola de trabajos y servicio de notificaciones',
      'Huellas',
      'Quedamos',
      'Infraestructura autoalojada (VPS y homelab)',
    ]);
    expect(order(yaml.en)).toEqual([
      'Job queue and notification service',
      'Huellas',
      'Quedamos',
      'Self-hosted infrastructure (VPS and homelab)',
    ]);
    expect(yaml.es.match(/^ {8}date: En (desarrollo|producción)$/gm)).toHaveLength(4);
    expect(yaml.en.match(/^ {8}date: In (development|production)$/gm)).toHaveLength(4);
    expect(yaml.es).not.toContain('summary: En desarrollo');
    expect(yaml.en).not.toContain('summary: In development');
  });
});

describe('.gitignore', () => {
  const ignore = readFileSync('.gitignore', 'utf8');

  it('keeps the private copy and the RenderCV intermediates out of git', () => {
    expect(ignore).toMatch(/^cv\/\.env\.local$/m);
    expect(ignore).toMatch(/^cv\/out\/$/m);
  });
});

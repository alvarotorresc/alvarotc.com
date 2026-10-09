import { describe, it, expect } from 'vitest';
import { buildArgs, LANGS, RENDERCV } from '../scripts/lib/cv-args.mjs';

describe('buildArgs', () => {
  it('pins RenderCV 2.8 with the full extras and renders both languages', () => {
    expect(RENDERCV).toBe('rendercv[full]@2.8');
    expect(LANGS).toEqual(['es', 'en']);
  });

  it('renders the public PDF from the YAML settings alone', () => {
    expect(buildArgs('es')).toEqual(['rendercv[full]@2.8', 'render', 'cv/cv.es.yaml']);
    expect(buildArgs('en')).not.toContain('--pdf-path');
  });

  it('overrides phone and email and writes the private copy under cv/out', () => {
    const args = buildArgs('en', { phone: '+34 600 000 000', email: 'ejemplo@gmail.com' });
    expect(args.slice(0, 3)).toEqual(['rendercv[full]@2.8', 'render', 'cv/cv.en.yaml']);
    expect(args).toContain('--cv.phone');
    expect(args[args.indexOf('--cv.phone') + 1]).toBe('+34 600 000 000');
    expect(args[args.indexOf('--cv.email') + 1]).toBe('ejemplo@gmail.com');
    expect(args[args.indexOf('--pdf-path') + 1]).toBe('out/Alvaro_Torres_Carrasco_CV_EN.pdf');
  });

  it('refuses a private copy without both CV_PHONE and CV_EMAIL', () => {
    expect(() => buildArgs('es', { phone: '+34 600 000 000' })).toThrow(/CV_PHONE and CV_EMAIL/);
    expect(() => buildArgs('es', { email: 'ejemplo@gmail.com' })).toThrow(/CV_PHONE and CV_EMAIL/);
    expect(() => buildArgs('es', { phone: '', email: '' })).toThrow(/CV_PHONE and CV_EMAIL/);
  });
});

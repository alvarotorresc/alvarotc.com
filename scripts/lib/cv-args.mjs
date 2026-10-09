export const RENDERCV = 'rendercv[full]@2.8';
export const LANGS = ['es', 'en'];

/**
 * Arguments for `uvx` that render one language of the CV.
 * The public PDF path comes from the YAML (`settings.render_command.pdf_path`);
 * the private copy overrides it so it never lands in `public/`.
 * RenderCV resolves `--pdf-path` relative to the input file, hence `out/...` means `cv/out/...`.
 * @param {'es' | 'en'} lang
 * @param {{ phone?: string; email?: string } | null} [privateContact]
 * @returns {string[]}
 */
export function buildArgs(lang, privateContact = null) {
  const args = [RENDERCV, 'render', `cv/cv.${lang}.yaml`];
  if (!privateContact) return args;
  const { phone, email } = privateContact;
  if (!phone || !email) {
    throw new Error('cv:private needs CV_PHONE and CV_EMAIL in cv/.env.local');
  }
  return [
    ...args,
    '--cv.phone',
    phone,
    '--cv.email',
    email,
    '--pdf-path',
    `out/Alvaro_Torres_Carrasco_CV_${lang.toUpperCase()}.pdf`,
  ];
}

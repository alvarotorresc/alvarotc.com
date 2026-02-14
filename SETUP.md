# Setup y Próximos Pasos

## ✅ Lo que está hecho

La web completa está construida y funcional:

- ✅ **Homepage** con hero animado, stats, proyectos destacados, skills
- ✅ **Página About** con timeline 2016-2026, experiencia, skills completo
- ✅ **Página Projects** con todos tus productos (flagship + lab)
- ✅ **Sistema de blog** completo con markdown, RSS, OG images
- ✅ **Dark/Light theme** toggle funcional
- ✅ **Layouts** profesionales (BaseLayout, PageLayout, BlogPostLayout)
- ✅ **Componentes UI** reutilizables (GlassCard, Button, SectionHeading)
- ✅ **Animaciones** con Framer Motion en React islands
- ✅ **Content Collections** para posts y proyectos
- ✅ **CI con GitHub Actions**
- ✅ **README completo** según STANDARDS.md
- ✅ **Build funciona** sin errores

## 🚀 Cómo probar la web

```bash
cd alvarotc-web

# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:4321
```

## 📝 Lo que falta para producción

### 1. Imágenes

Las imágenes están como placeholders (archivos vacíos). Necesitas:

```bash
# Reemplazar con imágenes reales:
public/screenshot.png              # Screenshot de la web (para README)
public/og-default.png             # OG image por defecto (1200x630)
public/projects/sinherencia.png   # Screenshots de cada proyecto
public/projects/quedamos.png
public/projects/guitar.png
public/projects/libroteca.png
public/projects/create-astro-blog.png
public/projects/pokeutils.png
public/projects/devtools.png
```

**Tip**: Puedes generar OG images automáticamente con `/og/[slug].png`, solo necesitas una por defecto.

### 2. Git y GitHub

```bash
# Inicializar repo
git init
git add .
git commit -m "feat: initial commit - web personal completa"

# Crear repo en GitHub
gh repo create alvarotc-web --public --source=. --remote=origin

# Subir a GitHub
git push -u origin main
```

### 3. Deploy en Vercel

```bash
# Opción 1: Desde la CLI
npm i -g vercel
vercel

# Opción 2: Desde la web
# 1. Ir a vercel.com
# 2. Import repository
# 3. Seleccionar alvarotc-web
# 4. Deploy (detecta Astro automáticamente)
```

Configurar dominio:

- En Vercel → Settings → Domains → Add `alvarotc.com`
- En tu proveedor DNS → CNAME `www` → `cname.vercel-dns.com`
- En tu proveedor DNS → A `@` → `76.76.21.21`

### 4. Contenido opcional

```bash
# Añadir más posts del blog
src/content/posts/nuevo-post.md

# Añadir más proyectos
src/content/projects/nuevo-proyecto.md
```

## 🎨 Personalización

### Cambiar colores del tema

Edita `src/styles/global.css`:

```css
:root {
  --color-accent: #818cf8; /* Color principal */
  --color-accent-hover: #a5b4fc; /* Hover */
}
```

### Cambiar datos personales

Edita `site.config.ts`:

```typescript
export const siteConfig = {
  name: 'Tu Nombre',
  tagline: 'Tu tagline',
  domain: 'https://tudominio.com',
  // ...
};
```

### Añadir o quitar secciones

Cada página es editable en `src/pages/`:

- `index.astro` → Homepage
- `about.astro` → Sobre mí
- `projects.astro` → Proyectos
- `blog/index.astro` → Blog

## 📊 Checklist STANDARDS.md

Antes de publicar, verifica:

```bash
# Básico
- [x] README completo
- [x] LICENSE presente
- [x] .gitignore limpio
- [x] CI configurado
- [x] Build pasando
- [ ] Sin vulnerabilidades (npm audit)
- [ ] Imágenes reales (no placeholders)
- [ ] Deploy funcionando
- [ ] GitHub repo description + topics

# Adicional (flagship)
- [ ] Branch protection en main
- [ ] Issue templates
- [ ] PR template
- [ ] CONTRIBUTING.md (opcional)
- [ ] GitHub Release v0.1.0
- [ ] Dominio configurado
```

## 🐛 Si algo no funciona

```bash
# Limpiar y reinstalar
rm -rf node_modules dist .astro
npm install

# Verificar tipos
npm run astro check

# Verificar build
npm run build

# Ver errores detallados
npm run dev
```

## 📚 Recursos

- [Astro Docs](https://docs.astro.build)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Vercel Docs](https://vercel.com/docs)

---

**Próximo paso recomendado**: Probar con `npm run dev` y revisar cada página. Luego añade imágenes reales y despliega.

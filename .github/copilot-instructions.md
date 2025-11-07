# Copilot Instructions for this Repo

This repository is a Next.js 16 (App Router) app using React 19, TypeScript (strict), and Tailwind CSS v4. Keep changes minimal and aligned with these patterns.

## Run & Build
- Dev server: `npm run dev` (port 3000)
- Production build: `npm run build` then `npm run start`
- Linting: `npm run lint` (ESLint flat config with `eslint-config-next`)

## Architecture & Layout
- App Router structure under `app/`.
  - `app/layout.tsx`: Root layout, imports `app/globals.css`, sets Next Fonts (Geist) as CSS variables, and provides HTML `<body>` classes.
  - `app/page.tsx`: Home page example using `next/image` and Tailwind utility classes.
- Static assets live in `public/` and are typically consumed via `next/image`.
- `next.config.ts` exists but is empty; add options only when needed.

## Styling (Tailwind v4)
- Tailwind v4 via PostCSS plugin (`postcss.config.mjs` uses `@tailwindcss/postcss`).
- Global styles and design tokens in `app/globals.css`:
  - CSS variables `--background` and `--foreground` swapped via `prefers-color-scheme` (dark mode).
  - Tailwind `@theme inline` defines tokens and binds Next Font variables to `--font-sans`/`--font-mono`.
- Prefer utility classes; avoid adding a `tailwind.config.js` unless absolutely necessary (v4 favors inline tokens).

## TypeScript & Paths
- Strict TypeScript; no emit. Module resolution is `bundler` with ESNext modules.
- Path alias: `@/*` → repo root. Example: `import Component from "@/app/..."` or `@/components/...` once such dirs exist.

## Linting & Conventions
- ESLint flat config (`eslint.config.mjs`) extends Next core web vitals + TypeScript.
- Global ignores include `.next/**`, `out/**`, `build/**`, and `next-env.d.ts`.
- Keep default Server Components for pages unless you need client-only features (`"use client"`).
- Use `next/font/google` for fonts (see Geist usage in `app/layout.tsx`).
- Use `next/image` for optimized images and store static assets in `public/`.

## Common Tasks (Examples)
- New page: create `app/about/page.tsx` exporting a React component.
- Loading UI for a route: `app/about/loading.tsx`.
- Import via alias: `import Button from "@/components/Button"` (after adding `components/`).

## Notes for AI Changes
- Respect Tailwind v4 design-token approach; don’t reintroduce legacy configs without reason.
- Keep imports using the `@/*` alias instead of deep relative paths.
- Update `README.md` only when adding new scripts or non-obvious workflows.
- No tests configured yet; if adding tests (Jest/Vitest), document scripts and minimal config.

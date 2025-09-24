# Food Additives Catalogue

A static catalogue of food additives built with the Next.js pages router. The site exposes every additive and additive class published by the Open Food Facts taxonomy so readers can explore ingredients, see their synonyms, and jump to authoritative resources such as Wikipedia.

## Features
- **Full additive directory:** The landing page renders cards for every additive with available English metadata, including synonyms and the classes it belongs to.
- **Detail pages:** Each additive has a dedicated route (`/[additiveSlug]`) with the full description, synonym list, technological classes, and a link to the corresponding English Wikipedia entry when available.
- **Class navigation:** `/class` indexes every additive class that has at least one additive, while `/class/[classSlug]` lists the additives assigned to that class.
- **Static Site Generation (SSG):** All pages are generated at build time from local JSON snapshots. There are no runtime network requests, making the output suitable for Vercel’s static hosting.

## Tech stack
- [Next.js 15](https://nextjs.org/) with the **pages** router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [goober](https://github.com/cristianbote/goober) for CSS-in-JS styling (see [`@/lib/theme`](src/lib/theme.ts) for shared tokens)

## Project structure
```
├── data/                     # Offline Open Food Facts taxonomy exports
├── public/                   # Static assets
├── src/
│   ├── components/           # Reusable UI primitives (cards, layout, etc.)
│   ├── lib/
│   │   ├── additives.ts      # Data loading & normalization helpers
│   │   ├── theme.ts          # Shared grayscale theme tokens
│   │   └── types.ts          # Strongly typed additive & class models
│   ├── pages/                # Next.js pages (index, additive, and class routes)
│   └── styles/               # Global stylesheet
├── eslint.config.mjs         # ESLint flat config (Next core-web-vitals preset)
├── next.config.mjs           # Next.js configuration (SSG only)
├── package.json              # Scripts and dependency manifest
├── tsconfig.json             # TypeScript configuration (with @/* alias)
└── vercel.json               # Vercel deployment commands
```

## Getting started
### Prerequisites
- Node.js **18.18** or newer (Next.js 15 requirement)
- npm (ships with Node.js)

### Installation
```bash
npm install
```

### Development server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to browse the catalogue while developing. All pages are served statically, so hot reloading only affects the development view.

### Linting
```bash
npm run lint
```
Runs ESLint with the `next/core-web-vitals` + TypeScript configuration.

### Production build
```bash
npm run build
```
Generates the full static site (one page per additive and per class) under `.next/`. Expect the build to take a minute because of the number of additive pages.

## Updating the data snapshots
1. Download the latest additive taxonomy exports:
   - Additives: <https://static.openfoodfacts.org/data/taxonomies/additives.json>
   - Classes: <https://static.openfoodfacts.org/data/taxonomies/additives_classes.json>
2. Replace the files in [`data/`](data/) with the new JSON snapshots.
3. Run `npm run build` to regenerate all static pages and verify that the data still parses correctly. The build will fail if the JSON schema changes.

## Deployment
The project is configured for Vercel static hosting via [`vercel.json`](vercel.json). Deployments should run `npm install` followed by `npm run build`; the resulting static output can be served from Vercel’s CDN.

## Notes & caveats
- The index page renders every additive card at once. The resulting JSON payload is ~232 kB, so consider implementing pagination or filtering before shipping to production.
- No client-side state management is required yet; compare functionality will be added in a future iteration.

# Food Additives Catalogue

A statically generated Next.js site that showcases a curated catalogue of common food additives. Visitors can browse the full grid of additives and open detailed pages that outline synonyms, functions, and descriptions for each ingredient.

## Tech stack

- [Next.js 15](https://nextjs.org/) with the App Router and Static Site Generation
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI](https://mui.com/) for the design system and layout components

## Project structure

```
├── data/                # Static additive dataset (JSON)
├── public/              # Public assets served as-is
├── src/
│   ├── app/             # App Router routes and layouts
│   ├── components/      # Reusable UI building blocks
│   ├── lib/             # Data helpers and utilities
│   └── types/           # Shared TypeScript contracts
├── next.config.ts       # Next.js configuration for Vercel
├── package.json         # Project scripts and dependencies
└── vercel.json          # Deployment configuration for Vercel
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

   The site will be available at http://localhost:3000.

3. Build the static production bundle:

   ```bash
   npm run build
   ```

## Data

The catalogue currently uses `data/additives.json`, which contains twelve additive entries. Each entry includes the additive title, E-number, synonyms, functional classes, description, and links for further reading.

## Deployment

The repository ships with a `vercel.json` file that configures the build and install commands expected by Vercel. Deployments run `npm run build` to produce a static bundle under `.next/`.

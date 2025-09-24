# Agent Guidelines

These conventions apply to the entire repository.

## Styling & UI
- Keep using [goober](https://github.com/cristianbote/goober) for styling. Import components via `import { styled } from "goober";` and pull shared colors/radius values from [`@/lib/theme`](src/lib/theme.ts).
- Preserve the grayscale look-and-feel—introduce new colors only by extending the theme tokens.
- Wrap new pages with the shared [`Layout`](src/components/Layout.tsx) component so navigation and footer stay consistent.

## Data handling
- All additive and class data must flow through the helpers in [`src/lib/additives.ts`](src/lib/additives.ts). Do not introduce runtime `fetch` calls; the site must stay fully static.
- If the Open Food Facts datasets are refreshed, replace the JSON files inside [`data/`](data/) and confirm `npm run build` succeeds.

## Development workflow
- Stick to TypeScript (`.ts` / `.tsx`) for source files.
- Run `npm run lint` and `npm run build` before committing; both commands must pass.
- Update [`README.md`](README.md) whenever you add new tooling, scripts, or major architectural changes.

## Visual regressions
- When you make noticeable UI changes, capture updated screenshots via the browser automation workflow so reviewers can see the impact.

# Ingredient Explorer

Static Next.js site that showcases a search-demand driven catalogue of food ingredients. The landing
page arranges ingredient cards by simulated Ahrefs search interest, while detail and comparison
pages surface Open Food Facts taxonomy attributes plus sparkline and @nivo/line charts.

## Data sources

- **Open Food Facts taxonomy** – `https://static.openfoodfacts.org/data/taxonomies/ingredients.full.json`
  provides the ingredient hierarchy, CIQUAL nutrition mappings, carbon footprint (FoodGES) metadata,
  synonyms per locale, and related child nodes.
- **Wikipedia summaries** – the build step requests the REST summary endpoint for each ingredient to
  display a short description when available.
- **Search demand demo data** – deterministic, seed-based generation emulates Ahrefs keyword volume
  and trend data. Replace `generateSearchTrend` in `lib/searchMetrics.ts` with live API data to wire
  the project to an Ahrefs workspace.

## Key features

- Top 100 ingredients ranked by average monthly demand with sparklines, super-ingredient labels,
  and English synonym previews.
- Modal overlays show extended parameters (CIQUAL food names/codes, carbon footprint, multilingual
  synonyms, child ingredients) and provide quick access to ingredient pages and comparison flows.
- Ingredient detail pages visualise 12-month interest via @nivo/line, provide full descriptions, and
  surface taxonomy metadata alongside Wikidata / Wikipedia links.
- Comparison workflow (`/compare` and `/compare/{a}-vs-{b}`) highlights rank/volume deltas, combined
  trend charts, and contrasts for super-ingredients, synonyms, and carbon footprint values.
- Static export (`next.config.js` sets `output: 'export'`) and `vercel.json` configure Vercel to
  publish the generated `out` directory.

## Development

```bash
npm install
npm run dev
```

The project uses TypeScript, styled-components (with SSR integration), and @nivo/line for charts.
`npm run build` performs a static export suitable for Vercel deployments.

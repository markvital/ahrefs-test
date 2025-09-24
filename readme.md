# Food Additives Catalogue

A static Next.js website that catalogues food additives sourced from the [Open Food Facts](https://world.openfoodfacts.org/) database. The site allows visitors to browse additives, inspect detailed information, and explore additive classes without relying on runtime network calls.

## Tech stack

- [Next.js 14](https://nextjs.org/) with the Pages Router and Static Site Generation
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [styled-components](https://styled-components.com/) for theming and grayscale styling

## Data sources

The project bundles two taxonomies provided by Open Food Facts:

- `data/additives.json` – additive definitions, names, descriptions, and metadata.
- `data/additives_classes.json` – additive class names and optional descriptions.

The build step transforms these JSON files into additive and class listings. There are no runtime network requests; all data is read during static generation.

## Project structure

```
├── components/          # Reusable React components (layout, cards, grids)
├── data/                # Open Food Facts additive and class taxonomies (JSON)
├── lib/                 # Data loading utilities and shared types
├── pages/               # Next.js pages (index, additive detail, class detail)
├── public/              # Static assets (unused at the moment)
├── styles/              # Global style and theme definitions for styled-components
├── vercel.json          # Deployment configuration for Vercel
└── readme.md            # Project documentation
```

## Development

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:3000`. Static pages are generated from the bundled data, so changes to the JSON files require restarting the dev server.

## Building & testing

```bash
npm run lint   # ESLint (Next.js core web vitals rules)
npm run build  # Production build with full static generation
```

Both commands should pass before opening a pull request or deploying.

## Updating data

To refresh the additive catalogue with the latest upstream data, re-download the JSON files from Open Food Facts into the `data/` directory and rebuild the project.

```
curl -L https://static.openfoodfacts.org/data/taxonomies/additives.json -o data/additives.json
curl -L https://static.openfoodfacts.org/data/taxonomies/additives_classes.json -o data/additives_classes.json
```

## Deployment

The repository is prepared for Vercel. Running `npm run build` generates the static assets consumed by Vercel's Next.js runtime. The provided `vercel.json` pins the expected build, install, and output commands.

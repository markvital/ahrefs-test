# Contribution guide

- The site uses **Next.js (pages router)** with **TypeScript** and **styled-components**. Keep all visual updates within the grayscale palette introduced in `styles/theme.ts`.
- All data is sourced from the JSON files inside `data/`. Do not fetch data at runtime; extend the build-time loaders in `lib/data.ts` when new metadata is required.
- Run `npm run lint` and `npm run build` before completing a task. Both commands must succeed.
- Use the existing layout and card components when adding new UI. Shared styles live in `components/` and `styles/`.
- Large data sets can impact static payload size. If you introduce new fields, consider truncating or summarising the data before passing it to pages.
- Deployment is handled by Vercel. Keep `vercel.json` aligned with the build pipeline if commands change.

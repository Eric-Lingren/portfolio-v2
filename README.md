[ericlingren.com](https://www.ericlingren.com/)

Next.js (App Router) static export, TypeScript, Vitest.

```
npm install
npm run dev        # local dev server
npm run build      # static export to out/
npm test           # vitest
npm run lint
npm run typecheck
npm run resume:pdf # render content/resume/resume.mdx to public/eric-lingren-resume.pdf
```

`resume:pdf` uses headless Chromium via `playwright-core` (pinned to a build whose Chromium revision is 1234). If the browser is missing, run `npx playwright-core install chromium-headless-shell`. The script fails unless the output is exactly one US Letter page. Roles and dates come from `src/content/experience.ts`; the rest is in `content/resume/resume.mdx`. Commit the regenerated PDF.

The previous Create React App site is preserved on the `legacy/cra-site` branch and the `v1-legacy` tag.

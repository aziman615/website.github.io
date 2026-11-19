# Ahmad Aziman — Portfolio

## Local development

Requires Node.js 18 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Both `npm run dev` and `npm run preview` use port 3000. Run `npm run build` to produce the static site in `dist/`. If port 3000 is already in use, Vite reports an error instead of choosing another port.

## Customize

Edit the `projects`, `jobs`, and email in `src/data.js`. The tech groups, page sections, and social links are in `src/App.jsx`; `src/main.jsx` mounts the app. Colors, typography, and responsive layouts are in `src/style.css`. Edit the title and SEO description in `index.html`.

The project graphics are interface concepts, not screenshots. Project titles and the plus buttons open details; the category filters narrow the project list. Floating navigation links lead to About Me, My Work, and Tech Stack. The top-right theme toggle switches between dark and light palettes and saves the visitor’s choice. The page respects reduced-motion preferences. Technology logos are stored locally in `public/icons/`; `node scripts/download-icons.mjs` can refresh them from Devicon.

## Browser checks

With the dev server running, `node scripts/browser-qa.mjs` checks both themes, saved preferences, responsive layouts, floating navigation, project filters and dialogs, keyboard focus, local icons, email copying, and reduced motion. This optional check uses Node.js 22 or newer and Google Chrome at its default Windows location. Screenshots and results are saved under `.preview/`. Set `PREVIEW_URL` if the dev server uses a different address.

## Publish to GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` installs dependencies, builds the site, and deploys `dist/` to GitHub Pages when changes reach `main`. It can also run manually from the repository’s Actions tab.

Enable **Settings → Pages → Build and deployment → Source → GitHub Actions** in the repository. The workflow uses GitHub’s built-in deployment token; no personal token is stored in the project. The Vite base uses relative paths so the same build works at a repository URL or a domain root. `dist/`, dependencies, and browser preview artifacts stay out of source control.

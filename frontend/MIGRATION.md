# Angular to Vue migration

The Vue application preserves the legacy portfolio's content, assets, seven sections, and hash URLs. Experience and Projects retain their original placeholder text. Content-parity verification uses the original Angular project at `../angular-app` when that reference is available.

## Run locally

Use Node.js `^22.18.0 || >=24.12.0`.

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host, including GitHub Pages. Vite uses a relative base, so the build supports both domain-root and subdirectory hosting. Hash routes do not need server rewrite rules.

For this repository, [the GitHub Pages workflow](../.github/workflows/deploy-pages.yml) builds and publishes `frontend/dist/` on pushes to `main`. Enable **GitHub Actions** as the Pages publishing source, then commit and push the source and workflow. See the [repository publishing instructions](../README.md#publish-to-github-pages). No `gh-pages` package or branch is required.

The production build contains roughly 119 kB of JavaScript and CSS across all routes, or 48 kB gzipped. This includes the existing Vue and Vue Router runtimes and excludes images. Actual transfer sizes depend on the host's compression. Deferred sections load separately. A directly comparable Angular production build was not available, so no percentage reduction is claimed.

## Structure

```text
public/
  assets/                 Original Angular assets, copied byte-for-byte
  favicon.ico             Original favicon
src/
  App.vue                 Toolbar, responsive sidebar, and route outlet
  main.js                 Application entry point
  styles.css              Shared vanilla CSS and design tokens
  router/index.js         Hash history and scroll restoration
  app/
    app.routes.js         Routes, navigation, and lazy section imports
    app.css               Application layout
    about-me/AboutMe.vue  Personal details and accessible tabs
    contact/Contact.vue
    education/Education.vue
    experience/Experience.vue
    home/
      Home.vue            Welcome, inline sections, and closing message
      Carousel.vue        Six slides and original captions
    projects/Projects.vue
    shared/
      assets.js           Asset URLs relative to the deployment base
      Disclosure.vue      Native, keyboard-operable expansion panels
    skills/
      Skills.vue          Nested skill expansion panels
      skills.data.js      Six groups, 24 skills, and 49 original descriptions
scripts/
  verify.mjs              Production browser and content-parity checks
```

Section directories mirror the Angular application. Vite serves the legacy asset URLs from `public/assets/`.

## Routes

| URL | Section |
| --- | --- |
| `#/` or `#/home` | Home |
| `#/personalDetails` | Personal Details |
| `#/skills` | Skills |
| `#/experience` | Experience |
| `#/projects` | Projects |
| `#/education` | Education |
| `#/contact` | Contact |

Unknown routes redirect to `#/`. Existing links and direct route reloads continue to work.

## Bundle and interaction choices

- The only runtime dependencies are the project's existing Vue and Vue Router packages. No packages were added.
- Material, Bootstrap, RxJS, icon libraries, web fonts, and CSS frameworks are not used. Navigation icons are small inline SVG paths. The starter Vue DevTools plugin was removed.
- Each route loads on demand. The home page loads inline sections when first expanded and keeps their state after collapse.
- Native `details`/`summary` elements replace expansion panels. Home panels share an exclusive group; nested skill panels open independently.
- The carousel retains its 3.2-second interval, previous/next controls, and wraparound. It pauses on hover, focus, a hidden browser tab, or a reduced-motion preference, and includes an explicit pause button.
- CSS adapts the persistent desktop/tablet sidebar to a mobile drawer at 700 pixels. The drawer supports Escape, focus containment, and background scroll locking.
- Tabs support arrow keys, Home, and End. Controls have accessible labels, visible focus, and touch-sized targets.

## Verify the migration

```sh
npm run verify
```

This builds the app, starts a temporary static server, and uses an installed Chrome or Edge through its debugging pipe. It adds no testing packages and is not part of the browser bundle. Set `BROWSER_PATH` if the browser is outside the script's usual locations. Browser execution and the local server must be permitted by the environment.

Checks cover original assets and rendered content, all seven routes at phone/tablet/desktop widths, expanded skills at 320 pixels, keyboard controls, nested expansion state, carousel behavior, hash reloads, unknown routes, subdirectory hosting, runtime errors, and unexpected network requests. The original `angular-app` directory is required for content comparisons.

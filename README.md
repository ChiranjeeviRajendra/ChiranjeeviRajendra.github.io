# chiranjeevirajendra.github.io

The portfolio has been migrated to Vue in [`frontend/`](frontend/).

```sh
cd frontend
npm ci
npm run dev
```

Build with `npm run build`; deploy `frontend/dist/` to a static host. All sections use hash routing for GitHub Pages compatibility.

## Publish to GitHub Pages

1. Open the repository's [Pages settings](https://github.com/ChiranjeeviRajendra/ChiranjeeviRajendra.github.io/settings/pages).
2. Under **Build and deployment → Source**, select **GitHub Actions**. See [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
3. Commit and push the Vue application and `.github/workflows/deploy-pages.yml` to `main`.
4. Watch **Actions → Deploy Vue portfolio to GitHub Pages**. After the deployment succeeds, open [chiranjeevirajendra.github.io](https://chiranjeevirajendra.github.io/).

The workflow installs the locked frontend dependencies with Node.js 24, builds the app, and publishes only `frontend/dist/`. Subsequent pushes to `main` deploy automatically. You can also run the workflow manually from the Actions tab. No extra packages, personal access tokens, or deployment branches are needed; the workflow uses GitHub's built-in token.

Keep `frontend/package-lock.json` committed. Generated `dist/` and `node_modules/` directories are ignored and should stay out of Git. Hash links such as `/#/skills` and direct route reloads work without custom server rules.

See the [migration guide](frontend/MIGRATION.md) for the folder structure, preserved routes, bundle choices, and dependency-free browser checks.

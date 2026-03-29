# Napper Web

Small static nap-planning web app for logging naps in the browser and showing simple daily predictions.

## How it works

- This app is fully static: `index.html`, `styles.css`, `app.js`, and the PWA assets.
- User-entered nap data is stored in the browser with `localStorage`.
- That means data stays on the same browser/device unless the user exports it.
- The service worker caches app files for offline use, but user data is not stored in the cache.

## Run locally

```bash
npm run start
```

Then open [http://localhost:4173](http://localhost:4173).

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow for automatic deploys from `main`.

1. Create a GitHub repository and push this folder to it.
2. In GitHub, open `Settings` for the repository.
3. Open `Pages`.
4. Under `Build and deployment`, choose `GitHub Actions` as the source.
5. Push to the `main` branch, or run the `Deploy to GitHub Pages` workflow manually from the `Actions` tab.
6. After GitHub finishes publishing, your app will be available at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## Notes for GitHub Pages

- This project does not need a backend or database.
- Because it is a static app, GitHub Pages is a good fit.
- Each user keeps their own saved data in their own browser.
- If a user clears browser storage, switches browsers, or changes devices, local data will not follow automatically.
- The built-in export/import buttons can be used to back up and restore data.

## Files

- `index.html`: app structure
- `styles.css`: styling
- `app.js`: nap logging, prediction logic, and local storage
- `sw.js`: offline asset caching
- `manifest.webmanifest`: installable PWA metadata

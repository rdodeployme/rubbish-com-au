# Rubbish.com.au customer website

The customer side of Rubbish.com.au: post a pick up, request skip, hook and wheelie bins, see quotes, accept, message, confirm done and review. The collector app and all the data stay in the Base44 app (`6ad626d1014ee1424d4deeff`); this site talks to it with the official `@base44/sdk`, as the signed-in customer only. No service key or secret is in this repository.

## Run and build

```
npm install
npm run dev      # local preview
npm run build    # writes dist/, plus 404.html so deep links like /my-pickups work on GitHub Pages
```

The site is built for `https://rdodeployme.github.io/rubbish-com-au/`. For a custom domain, build with `SITE_BASE=/ npm run build`.

## Publishing

`main` holds the source. The built site is published from the `gh-pages` branch (Settings, Pages, Deploy from a branch, `gh-pages`, `/ (root)`).

## Where things are

- `src/api/base44.js`: the Base44 client and the error helper (a failed function call throws; the server's message is in `err.response.data.error` or `err.data.error`).
- `src/lib/config.js`: the collector app link (`APP_URL`) and the terms link (placeholder).
- `src/lib/loadModel.js`, `src/lib/binModel.js`: copied from the Base44 app. Keep them in step.
- `src/components/postpickup`, `src/components/mypickups`, `src/components/bins`, `src/components/messages`: ported from the Base44 app with the same wording, checks and payloads. Layout only is changed for desktop.
- `public/collector-app-jobs.png`: a real screenshot of the collector app's Jobs screen (published app, 9 Nov 2026), used in the "For collectors" phone mock-up.

## Not done here on purpose

- "Continue with Google" is off until it is tested from this site's address.
- No App Store or Google Play badges: the collector app is a web app added to the home screen.
- Claims waiting on Richard (97% kept out of landfill, the $1,500 guarantee, "Number 1", "verified" collectors, pay through the site) are not used.

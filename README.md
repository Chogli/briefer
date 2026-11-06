# briefer

Briefs, built as instruments. By Discussed Inc.

Live at **https://briefer.discussedinc.com**

| Path | What | Who can see it |
|---|---|---|
| `/` | Holding page | Anyone |
| `/rbwxinflux/` | RBW Systems × Influx brief | Password (shared with RBW and Influx) |
| `/assets/` | Logo, icons, share image, fonts | Anyone (so link previews work) |

Each new brief is a new folder, plus a copy of `functions/rbwxinflux/_middleware.js` if it needs a password.

## Hosting: Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.
2. Build settings: framework **None**, build command **empty**, output directory **`/`**.
3. **Settings → Variables and secrets** → add `BRIEFER_RBWXINFLUX_PASSWORD` (type: Secret) for Production. Redeploy.
4. **Custom domains → Set up a custom domain** → `briefer.discussedinc.com`. Cloudflare adds the DNS record itself because the domain is on Cloudflare.

Every push to `main` deploys in about a minute. Other branches get their own preview URL.

## Changing the password

Change the variable in Cloudflare and redeploy. Everyone who's already in is signed out, because the cookie is derived from the password.

## Notes

- Notes typed into the brief are saved in each person's own browser only.
- The share preview (`/assets/og-rbwxinflux.jpg`) shows on the password page, so pasted links still get the image.
- Fonts: Funnel Sans, Funnel Display and Doto, all under the SIL Open Font License (see `assets/fonts`).

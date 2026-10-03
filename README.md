# Mowne's sites

One repository contains two independently deployed sites:

- The profile and markdown blog live at the repository root and use Vite.
- The tools showcase lives in [`tools/`](tools/) and is plain HTML, CSS, and JavaScript.

## Local development

For the profile and blog:

```sh
npm ci
npm run dev
```

For the tools showcase, from the repository root:

```sh
python3 -m http.server 8000 --directory tools
```

Expose a local preview with `cloudflared tunnel --url http://localhost:<port>`,
using the port reported by the server.

## Cloudflare Pages

Connect the same GitHub repository to two Pages projects. Both projects should
use the same production branch.

| Setting | Profile and blog | Tools |
| --- | --- | --- |
| Root directory | Leave blank | `tools` |
| Framework preset | None | None |
| Build command | `npm run build` | `exit 0` (no build needed) |
| Build output directory | `dist` | `.` |
| Custom domain | `mowne.co.in` | `tools.mowne.co.in` |

Check both generated `*.pages.dev` deployments before attaching the custom
domains. See [Cloudflare's monorepo guide](https://developers.cloudflare.com/pages/configuration/monorepos/)
and [custom domain setup](https://developers.cloudflare.com/pages/configuration/custom-domains/).

The existing GitHub Pages workflow and root `public/CNAME` remain in place
until the hosting cutover. After both custom domains work on Cloudflare, remove
that workflow and `public/CNAME` and disable the old GitHub Pages deployments.

## Checks

Run `npm run build` for the profile and blog. Tools has no build dependencies;
serve its directory and verify that its page and assets load. Check both sites
in paper and ink modes and at phone width.

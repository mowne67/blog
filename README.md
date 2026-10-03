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

## Cloudflare Workers

Connect the same GitHub repository to two Workers. Use `main` as the production
branch and enable preview builds for other branches. Each site has a
`wrangler.jsonc` declaring its static assets and an empty `previews` block;
neither site needs a Worker script.

| Setting | Profile and blog | Tools |
| --- | --- | --- |
| Project name | `website` | `tools` |
| Production branch | `main` | `main` |
| Root directory | Repository root (`/`) | `tools` |
| Build command | `npm run build` | Leave blank |
| Deploy command | `npx wrangler deploy` | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` | `npx wrangler preview` |
| Enable Preview builds | On | On |
| Protect with Cloudflare Access | Off (public previews) | Off (public previews) |
| Assets directory (in Wrangler config) | `./dist` | `.` |
| Custom domain | `mowne.co.in` | `tools.mowne.co.in` |

Check both generated `*.workers.dev` deployments before attaching the custom
domains. See [Cloudflare's Workers monorepo guide](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/),
[preview configuration](https://developers.cloudflare.com/workers/previews/configuration/),
and [custom domain setup](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

The existing GitHub Pages workflow and root `public/CNAME` remain in place
until the hosting cutover. Workers ignores `CNAME` during asset upload using
`public/.assetsignore`. Tools excludes its README and Wrangler configuration
using its own `.assetsignore`. After both custom domains work on Cloudflare, remove
that workflow and `public/CNAME` and disable the old GitHub Pages deployments.

## Checks

Run `npm run build` for the profile and blog. Tools has no build dependencies;
serve its directory and verify that its page and assets load. Check both sites
in paper and ink modes and at phone width.

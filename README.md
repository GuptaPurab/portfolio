# Purab Gupta — Portfolio

Static site (HTML/CSS/JS) with GSAP + ScrollTrigger + Lenis for motion, plus one Vercel serverless
function for the cumulative visitor counter in the footer.

```
index.html              page
css/style.css           layout, 5-column grid, responsive rules
js/main.js              motion + config (links) + visitor counter client
api/visits.js           Vercel function: Upstash Redis INCR/GET
assets/                 resume PDF, headshot, favicon
assets/visuals/         generated cover art (node tools/generate-visuals.mjs)
```

## 1. Links

All links (email, LinkedIn, GitHub, LeetCode) live in the `SITE` object at the top of `js/main.js`.
Any element with `data-link="linkedin"` etc. picks them up — the "Say Hello" button uses LinkedIn.

## 2. Preview locally

```
python -m http.server 4321
```

Open http://localhost:4321. The counter stays hidden locally because `/api/visits` isn't running;
add `?visits-demo` to the URL to preview how it looks. To run the real function locally use
`npx vercel dev` (after step 3).

## 3. Deploy + visitor counter

1. Push this folder to a GitHub repo and import it in Vercel (framework preset: **Other**, no build command).
2. In the Vercel project → **Storage** → add **Upstash for Redis** (free tier) and connect it to the
   project. That injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (the function also accepts
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` if you create the database on upstash.com yourself).
3. Redeploy. The footer now shows `● VISITORS 000123`.

Counting rules: one increment per browser session (refreshes don't inflate it), common bots and link
previewers are ignored, and the number is cumulative forever (Redis key `portfolio:visits`).

## Visuals

The project/experience images are generated SVGs. Edit `tools/generate-visuals.mjs` and run
`node tools/generate-visuals.mjs`, or replace any file in `assets/visuals/` with a real screenshot
(keep the same file name, or update the `src` in `index.html`).

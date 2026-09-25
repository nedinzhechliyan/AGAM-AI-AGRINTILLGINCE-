# AGENTS.md — Sound Kit

Guidance for AI coding agents working in this repository.

This is an **audio asset library** monorepo: original UI sounds at the repo root, a local generator, and a static HTML preview site under `website/` deployed to **Cloudflare Workers**.

Remote: `https://github.com/thisuxhq/soundkit.git` · branch: `main`.

---

## Project overview

Original UI interaction sounds, synthesized with pure Python DSP + `ffmpeg` (no AI APIs).

| Volume set | Folder | Level | Intended use |
|------------|--------|-------|--------------|
| Full volume | `full-volume-5db/` | −5 dB | Desktop / laptop demos |
| Low volume | `low-volume-20db/` | −20 dB | Mobile-like, production-ish level |

**Total:** 78 `.m4a` files (39 unique sounds × 2 volume tiers).

Regenerate: `python3 scripts/generate_ui_kit.py`

---

## Critical rules

1. **One kit only.** Root `full-volume-5db/` and `low-volume-20db/` are the product. Do not reintroduce third-party sound packs or dual kits.
2. **Preserve volume parity.** Every relative path under `full-volume-5db/` must exist under `low-volume-20db/`.
3. **Do not rewrite audio binaries by hand** unless asked — change the generator and re-run it.
4. **Kebab-case paths only.** Example: `full-volume-5db/buttons-and-navigation/button-1.m4a`.
5. **Always commit and push to `main`** after finishing a change set. Do not leave finished work only local.
6. **No force-push** unless the user explicitly requests history rewrite.
7. Prefer docs/tooling over unrelated app scaffolding.
8. **Bun only** for JS tooling — `bun install`, `bun run`, `bunx`. Never commit `package-lock.json` / yarn / pnpm lockfiles.

---

## Repository layout

```
soundkit/
├── AGENTS.md
├── README.md
├── package.json              # monorepo root (Bun workspaces)
├── scripts/
│   └── generate_ui_kit.py
├── full-volume-5db/          # product audio (source of truth)
├── low-volume-20db/          # product audio (parity with full)
└── website/                  # static HTML player → Workers
    ├── index.html
    ├── package.json
    ├── wrangler.jsonc
    ├── scripts/build.sh      # copies HTML + both volume trees → dist/
    └── dist/                 # build output (gitignored)
```

### Website (Workers)

- Pure HTML/CSS/JS — no SPA framework.
- Build copies root audio trees into `website/dist/` (do not duplicate audio as a second source of truth under `website/`).
- **Package manager: Bun only** — use `bun install` / `bun run` / `bunx`. Do not use npm or yarn.
- Deploy: `bun run website:deploy` (requires Cloudflare login via `wrangler`).
- Local: `bun run website:dev`.
- **Design system:** Vercel Geist tokens ([design.md](https://vercel.com/design.md) light / [design.dark.md](https://vercel.com/design.dark.md) dark). The preview site uses the **dark** theme.
- **UI review skill (optional, local):** `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines` — not tracked in git.

---

## Sound catalog

Paths relative to a volume root.

### buttons-and-navigation (12)

| File | Suggested use |
|------|----------------|
| `button-1.m4a` … `button-7.m4a` | Tap / press |
| `tab-1.m4a` … `tab-3.m4a` | Tab / segment change |
| `expand.m4a` | Open panel |
| `collapse.m4a` | Close panel |

### complete-and-success (6)

| File | Suggested use |
|------|----------------|
| `complete-1.m4a` … `complete-3.m4a` | Flow finished |
| `success-1.m4a` … `success-3.m4a` | Save OK / approved |

### errors-and-cancel (7)

| File | Suggested use |
|------|----------------|
| `error-1.m4a` … `error-5.m4a` | Validation / request failed |
| `cancel-1.m4a` … `cancel-2.m4a` | Dismiss / back |

### notifications-and-alerts (14)

| File | Suggested use |
|------|----------------|
| `alert-1.m4a` … `alert-5.m4a` | Blocking / important alert |
| `notification-1.m4a` … `notification-9.m4a` | Soft ping / notice |

---

## Integration (example)

```ts
const VOLUME = "low-volume-20db"; // or "full-volume-5db"

export const sounds = {
  buttonTap: `${VOLUME}/buttons-and-navigation/button-1.m4a`,
  tabChange: `${VOLUME}/buttons-and-navigation/tab-1.m4a`,
  expand: `${VOLUME}/buttons-and-navigation/expand.m4a`,
  collapse: `${VOLUME}/buttons-and-navigation/collapse.m4a`,
  success: `${VOLUME}/complete-and-success/success-1.m4a`,
  complete: `${VOLUME}/complete-and-success/complete-1.m4a`,
  error: `${VOLUME}/errors-and-cancel/error-1.m4a`,
  cancel: `${VOLUME}/errors-and-cancel/cancel-1.m4a`,
  alert: `${VOLUME}/notifications-and-alerts/alert-1.m4a`,
  notification: `${VOLUME}/notifications-and-alerts/notification-1.m4a`,
} as const;
```

---

## Naming conventions

| Rule | Detail |
|------|--------|
| Volume folders | `full-volume-5db`, `low-volume-20db` |
| Categories | `buttons-and-navigation`, `complete-and-success`, `errors-and-cancel`, `notifications-and-alerts` |
| Files | `{role}-{n}.m4a` or `expand.m4a` / `collapse.m4a` |
| New variants | Same relative path in **both** volume tiers; prefer changing the generator |

---

## Inventory check

```bash
find full-volume-5db -name '*.m4a' | wc -l   # 39
find low-volume-20db -name '*.m4a' | wc -l   # 39
comm -3 \
  <(cd full-volume-5db && find . -name '*.m4a' | sort) \
  <(cd low-volume-20db && find . -name '*.m4a' | sort)
```

Empty `comm` output means the trees match.

---

## Git hygiene

- Default branch: `main`
- After requested work: stage, commit, `git push origin main`
- Do not commit `.DS_Store` (see `.gitignore`)
- Do not force-push unless the user explicitly asks
```
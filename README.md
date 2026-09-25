# Sound Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Copyright](https://img.shields.io/badge/©-THISUX%20Private%20Limited-111111.svg)](LICENSE)

Original UI interaction sounds for apps and prototypes. Generated locally with classic DSP (no AI APIs).

**78** `.m4a` files (39 sounds × 2 volume tiers). Free to use under [MIT](LICENSE).

**Preview:** [soundkit.thisux.com](https://soundkit.thisux.com)

## Monorepo layout

```
full-volume-5db/     # louder tier (~−5 dB) — desktop / demos
low-volume-20db/     # quieter tier (~−20 dB) — mobile-like playback
├── buttons-and-navigation/   # button-1…7, tab-1…3, expand, collapse
├── complete-and-success/     # complete-1…3, success-1…3
├── errors-and-cancel/        # error-1…5, cancel-1…2
└── notifications-and-alerts/ # alert-1…5, notification-1…9
scripts/             # audio generator
website/             # static HTML player → Cloudflare Workers
```

Example:

```text
low-volume-20db/buttons-and-navigation/button-1.m4a
```

## Categories

| Category | Use for |
|----------|---------|
| **buttons-and-navigation** | Taps, tabs, expand/collapse |
| **complete-and-success** | Finished flows, positive confirmation |
| **errors-and-cancel** | Failures, dismiss / back |
| **notifications-and-alerts** | Attention, in-app pings |

## Quick start

Copy a volume tier into your app (or point at individual files):

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

## Regenerate

Requires `python3` and `ffmpeg` on `PATH`.

```bash
python3 scripts/generate_ui_kit.py
```

## Preview

**Website** (monorepo package `website/`):

```bash
bun install
bun run website:dev      # local Workers dev server
bun run website:deploy   # build + deploy to Cloudflare Workers
```

**macOS CLI:**

```bash
afplay full-volume-5db/complete-and-success/success-1.m4a
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please read the [code of conduct](CODE_OF_CONDUCT.md) and [security policy](SECURITY.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

Copyright © 2026 [THISUX Private Limited](https://github.com/thisuxhq).

Released under the [MIT License](LICENSE). You may use, modify, and distribute the audio assets and generator for personal and commercial projects, provided the copyright and permission notice are retained.

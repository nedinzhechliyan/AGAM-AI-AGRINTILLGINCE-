# Contributing to Sound Kit

Thanks for your interest in improving Sound Kit. This repository is an **audio asset library** plus a local Python generator — not an application runtime.

## Ways to contribute

- Propose or improve sound variants (via the generator, not hand-edited binaries)
- Fix bugs or clarity issues in `scripts/generate_ui_kit.py`
- Improve docs (`README.md`, catalog notes, examples)
- Report issues with playback level, naming, or missing interaction roles

## Development setup

1. Install **Python 3** and **ffmpeg** on your `PATH`.
2. (Optional, for the preview site) Install **Bun** (https://bun.sh). This repo uses Bun only — not npm or yarn.
3. Clone the repo and regenerate to verify your environment:

```bash
python3 scripts/generate_ui_kit.py
```

4. Preview sounds:

```bash
# Website (Cloudflare Workers local)
bun install
bun run website:dev

# Or macOS CLI
afplay full-volume-5db/complete-and-success/success-1.m4a
```

5. Deploy the preview site (maintainers):

```bash
bun run website:deploy
```

## Rules of the kit

1. **One kit only** — keep root trees `full-volume-5db/` and `low-volume-20db/`.
2. **Volume parity** — every relative path under `full-volume-5db/` must also exist under `low-volume-20db/`.
3. **Change the generator, then regenerate** — do not hand-edit `.m4a` binaries unless maintainers ask for that exception.
4. **Kebab-case paths only** — e.g. `full-volume-5db/buttons-and-navigation/button-1.m4a`.
5. **New variants** — add the same relative path in **both** volume tiers.

### Inventory check

```bash
find full-volume-5db -name '*.m4a' | wc -l   # expect 39 (or updated catalog size)
find low-volume-20db -name '*.m4a' | wc -l
comm -3 \
  <(cd full-volume-5db && find . -name '*.m4a' | sort) \
  <(cd low-volume-20db && find . -name '*.m4a' | sort)
```

Empty `comm` output means the trees match.

## Pull requests

1. Keep changes focused and documented (what changed and why).
2. If you change synthesis, re-run the generator and commit updated audio only when intentional.
3. Update `README.md` / `CHANGELOG.md` when the catalog or public API of paths changes.
4. Do not commit `.DS_Store` or unrelated scaffolding.

## Security

Do not open public issues for sensitive security reports. See [SECURITY.md](SECURITY.md).

## Code of conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the same [MIT License](LICENSE) as the project, copyright THISUX Private Limited.

# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) where practical for an asset kit.

## [Unreleased]

### Added

- Monorepo preview website (`website/`) — static HTML player for all sounds
- Cloudflare Workers deploy (`bun run website:deploy`) with static assets
- Package manager standardized on Bun

## [1.0.0] — 2026-07-19

### Added

- Original UI sound kit: 39 sounds × 2 volume tiers (`full-volume-5db/`, `low-volume-20db/`)
- Categories: buttons-and-navigation, complete-and-success, errors-and-cancel, notifications-and-alerts
- Local generator: `scripts/generate_ui_kit.py` (Python DSP + ffmpeg)
- MIT License (copyright THISUX Private Limited)
- Community files: contributing guide, code of conduct, security policy

[1.0.0]: https://github.com/thisuxhq/soundkit/releases/tag/v1.0.0

# Security Policy

## Supported versions

This project ships static audio assets and a small local generator script. The latest commit on `main` is the supported version.

| Version | Supported |
|---------|-----------|
| `main`  | Yes       |
| Older tags / copies | Best effort |

## Reporting a vulnerability

If you discover a security issue (for example in the generator script, CI, or repository configuration), please report it privately.

**Email:** hello@thisux.com  
**Subject:** `[security] soundkit`

Please include:

- A description of the issue and its impact
- Steps to reproduce, if applicable
- Any suggested fix

We will acknowledge reports when possible and work on a fix before any public disclosure.

Please **do not** open a public GitHub issue for security-sensitive findings.

## Scope notes

- Audio files themselves are not an attack surface beyond normal media handling in client apps.
- Prefer reporting issues that affect integrity of the generator pipeline, supply chain, or repo automation.

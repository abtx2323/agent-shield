# Security

AgentShield is a single static page. It has no backend, no API keys and no model calls: every attack, trace and remediation is a scripted simulation that runs in your browser.

What it does to stay safe:

- The page ships with a strict Content Security Policy (`default-src 'none'`, hash-pinned script and styles, no `connect-src`), so the app can't send data anywhere. The only outside requests are for Google Fonts.
- Styles are bundled into the page instead of loaded from a CDN, and CI checks that the CSP hashes match the shipped script and styles.
- Every payload uses reserved `.example` domains ([RFC 2606](https://www.rfc-editor.org/rfc/rfc2606)), so pasting one into a real agent can't send data to a real host.
- GitHub Actions are pinned to full commit SHAs.

The payloads describe real, documented attack patterns. Use them only to test agents and systems you own or have permission to test.

## Reporting a vulnerability

Please report security problems privately through GitHub's "Report a vulnerability" button on this repository's Security tab, not in a public issue. Include the steps to reproduce and the browser you used.

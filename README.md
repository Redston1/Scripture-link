# Scripture Link

A static, mobile-friendly scripture link and QR maker. Supports all five LDS standard works, spelled-out ordinals, common book abbreviations, whole chapters, individual verses, ranges, and comma-separated verses within one chapter. References are checked against chapter and verse counts.

## Publish on GitHub Pages

1. Create a GitHub repository and upload this folder's contents to its root (including `vendor`).
2. Open **Settings → Pages** in the repository.
3. Choose **Deploy from a branch**, select **main** and **/ (root)**, then save.
4. Open the site URL shown by GitHub Pages after deployment finishes.

No build step, API key, account, backend, or package installation is needed. All asset paths are relative, so project sites work too. You can also open `index.html` directly for a local preview. Clipboard access may require HTTPS; a manual copy fallback is provided.

## Development

Run parser tests with `node --test tests/reference.test.js`.

QR codes use the vendored qrcode-generator 1.4.4 library (MIT; see vendor/LICENSE-qrcode). QR generation happens entirely in the browser, with a four-module white margin and medium error correction. Downloads are black-on-white PNGs.

Chapter/verse counts and Church book slugs were derived from https://github.com/bcbooks/scriptures-json. Only reference metadata is included, not scripture text. Links target the English Church scripture website with verse highlighting and an anchor to the first verse. This is an independent tool, not an official Church product. Special introductory pages and Official Declarations are not currently supported.

## Gospel Library share links

Paste an `https://www.churchofjesuschrist.org/...` or `https://www.lds.org/...` share link into the same input used for scripture references. Links without `https://` are also accepted. Conference talks, manuals, and other Church content are supported. Select the paragraph(s) in Gospel Library and copy the share link to include that selection.

The app preserves query parameters, language, paragraph IDs/ranges, and fragment anchors when copying or encoding the URL. It does not fetch the page, verify paragraph existence, or rewrite legacy URLs; old links depend on the Church’s redirects. Only HTTP(S) links on these domains and their subdomains are accepted. Links are limited to 2,000 encoded characters to fit QR capacity.

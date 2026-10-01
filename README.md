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

The header uses Nabla from Google Fonts, hosted locally in `vendor/fonts` under the SIL Open Font License (see `vendor/fonts/OFL-Nabla.txt`).

## Retro edition

Open `retro/index.html` for the alternate early-2000s design, or visit `/retro/` under your GitHub Pages project URL. It has its own HTML and stylesheet and shares the main page’s scripture parser, reference data, and QR code logic. The original page remains at the site root. Publish the whole project folder so the shared scripts remain available.

### Retro animations and browser compatibility

The retro page includes a scrolling welcome banner, twinkling stars, a traveling envelope, a floating logo icon, and animated badges. Reduced-motion preferences disable animations automatically; the navigation also links to the modern edition.

The retro edition uses a separate ES5 controller (`retro/legacy.js`) and an ES5 copy of the book catalog (`retro/books.js`). If the main book catalog changes, regenerate the retro copy by replacing its initial `const BOOKS` declaration with `var BOOKS`. QR codes render as GIF images without requiring canvas. Browsers without a download attribute can save the QR image through their context menu. Copying falls back to selecting the link for manual copying. Layout falls back to stacked panels without CSS Grid, and unsupported animation simply stays static.

This improves compatibility with older ES5-era browsers; it does not promise support for every historical browser. Very old browsers may lack data-image support or the TLS capabilities needed to reach GitHub Pages or the Church website. JavaScript is required for generation; page content remains readable without it. Actual legacy-browser verification is still needed before claiming support for a specific version.

The retro title bar, step labels, status message, and sharing note use locally hosted Comic Neue (regular and bold) from Google Fonts. Its SIL Open Font License is included at `vendor/fonts/OFL-ComicNeue.txt`. No external font requests are needed.

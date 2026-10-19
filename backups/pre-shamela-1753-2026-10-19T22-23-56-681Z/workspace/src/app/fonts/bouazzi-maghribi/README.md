# Bouazzi Maghribi — local display experiment

Source: https://github.com/aleftypefoundry/bouazzi-maghribi

Upstream revision: `f8829d1bc4e7f7885ac172b9203cbf2565028ee2`

Unmodified file: `fonts/WOFF/BouazziMaghribi-Regular.woff2` (23,168 bytes).

SHA-256: `8aae62a94115dd664092ac7d1769065021c6ebe390bbe19e622610b0d6580e5c` (case-insensitive).

The repository describes this as a revival of traditional Maghribi script,
dedicated to Dr. Ahmed Bouazzi. The binary identifies itself as Bouazzi Maghribi,
Regular, version 1.000, with Mohamed Gallah in its designer metadata and
https://github.com/iyadh as its designer URL. No font conversion, subsetting or
outline edits were made.

## License and attribution status

The upstream `OFL.txt` declares SIL Open Font License 1.1 and reserves the name
“Bouazzi Maghribi.” Its complete notice is preserved verbatim alongside the font
and at `/licenses/bouazzi-maghribi/OFL.txt` in the public build.

The copyright holder is still the literal placeholder
`[Your Name or Foundry Name]`. The downloaded font has no embedded copyright
entry. In addition, its embedded license URL points to https://mit-license.org,
whereas the repository currently supplies OFL 1.1. These are unresolved upstream
attribution and license-metadata inconsistencies, not corrected or inferred by
this project. This is a local visual experiment; obtain clarification from the
maintainer before recommending public deployment. No endorsement is implied.

## Application and reversal

`next/font/local` self-hosts the regular WOFF2 file with swap loading. The optional
`font-maghribi` class supplies a display-font token with the existing Amiri/serif
fallbacks and disables synthetic styling.

The class is used only on the header wordmark, homepage hero wordmark, homepage
“ذخائر من التراث المغربي” heading, and the main title of featured Al-Shifa covers
(homepage and book profile). Cover subtitles, catalog covers, other book covers,
footer wordmark, interface, descriptions, metadata and reader typography retain
their existing fonts. Removing these classes restores the existing font rules;
the local font import can then also be removed from the root layout.

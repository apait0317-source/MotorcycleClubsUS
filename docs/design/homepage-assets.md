# Homepage assets

The black/silver/orange direction was selected in the design conversation. The approved visual reference is `docs/superpowers/specs/motorcycle-style-reference.png`.

## Photography

All four homepage photographs were generated for this redesign with OpenAI image generation. They are illustrations, not documentary evidence of a listed club or an endorsement by pictured people. The hero and guide section carry that distinction in visible captions. No Google-hosted club photography was added or repurposed.

- `motorcycle-hero.webp`: black motorcycle machinery, workshop gathering; 1536 × 1024, about 126 KiB. Wide desktop crop; center-right subject with dark left space for typography.
- `guide-joining.webp`: helmet and gloves; 800 × 533.
- `guide-clubs.webp`: riders talking outside a workshop; 800 × 533.
- `guide-riding.webp`: riders on a rural road; 800 × 533.

Generated PNG masters remain in the workspace's generated_images folder; web assets are encoded as WebP using Sharp. Guide images lazy-load; the hero has explicit responsive sizing and priority loading.

## Fonts

Barlow Condensed Bold/ExtraBold and Inter Variable are distributed by Google Fonts under the SIL Open Font License. Source: https://github.com/google/fonts/tree/main/ofl/barlowcondensed and https://github.com/google/fonts/tree/main/ofl/inter . License files accompany the fonts in `app/fonts`.

Fonts are hosted locally through next/font/local. This preserves Inter for body text and removes the existing build's reliance on fetching Google Fonts. WOFF2 encoding retains the original glyph coverage and variable axes; no proprietary fonts or new runtime font service is used.

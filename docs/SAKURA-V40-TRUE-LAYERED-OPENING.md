# Sakura Vintage V4.0 — True Layered Opening

Status: ACTIVE Effect Lab opening engine.

## Goal
Replace the V3.9.x duplicate-image / crop-mask opening illusion with physical raster depth plates while preserving the mobile-first centered stage and V3.9.6 performance baseline.

## Physical V4.0 plates
- `public/assets/sakura-v40/far-sky.webp`
- `public/assets/sakura-v40/mid-landscape.webp`
- `public/assets/sakura-v40/fg-branches.webp`
- `public/assets/sakura-v40/fg-floral.webp`

These assets are separated from the existing Fuji/Sakura artwork for Effect Lab use. They are independent raster plates, not repeated copies of the full artwork masked by CSS.

## Runtime
- `public/sakura-v40.css`
- `public/sakura-v40.js`
- V4.0 is loaded from `public/sakura-v393.js` after the legacy visual CSS layers.
- V3.9.6 CSS remains as the mobile performance baseline.
- V3.9.6 opening JS is intentionally not imported.
- V3.9.4/V3.9.5 opening builders are kept in bypass mode while their non-opening section decoration remains available.
- Opening butterflies from the V3.9.3 scene layer are excluded so they do not compete with the V4 hero timeline.

## Opening choreography
1. Far vintage world establishes.
2. Mid Fuji/lake landscape arrives independently.
3. Sakura branch foreground enters from a different direction/speed.
4. Floral foreground rises independently.
5. Warm atmosphere/light and one-shot petal burst create the hero beat.
6. Ceremonial frame arrives before the paper panel.
7. Opening text reveals in hierarchy.
8. Temporary effects are released and the mobile scene settles to a quiet state.

## Performance contract
- Mobile-first source of truth.
- Desktop keeps the centered mobile-stage composition.
- No continuous heavy opening animation after settle on coarse-pointer devices.
- Temporary `will-change`, shimmer, veil, light sweep, and burst petals are released/hidden after the intro.
- Ambient canvas petals pause during the V4 intro and resume at restrained intensity afterward.

## Rollback
V3.9.6 remains the immediate performance rollback reference. V3.9.5 remains the prior WOW visual reference.

## Scope
Effect Lab only. Dini Anif Production remains frozen and untouched.

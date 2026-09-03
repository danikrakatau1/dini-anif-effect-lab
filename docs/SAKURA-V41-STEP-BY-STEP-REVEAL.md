# Sakura Vintage V4.1 — Step-by-Step Reveal

Status: Effect Lab active candidate. Production is untouched.

## Purpose
Match the reference opening grammar more closely by revealing the invitation one construction step at a time instead of showing panel/frame/text together.

## Runtime ownership
- V3.9.4/V3.9.5 opening builders: disabled through the V3.9.6 target gate.
- V3.9.6 opening JS: not imported.
- V4.0.x opening JS: kept as rollback but not imported.
- V4.1 (`sakura-v41.js`): sole post-cover opening owner.

## Reveal order
1. Artwork world pull-back / zoom-out.
2. Mid landscape, branches and bottom floral settle subtly.
3. Thin vertical ivory slit appears in the center.
4. Paper panel expands horizontally from the slit.
5. Maroon outer border draws from bottom to top.
6. Inner gold border follows.
7. Small crest appears.
8. Eyebrow appears.
9. Couple title appears.
10. Divider appears.
11. Invitation copy appears.
12. Settle and mobile cleanup.

## Performance
- One physical master image element for the far artwork.
- Secondary depth zones use the same cached artwork as CSS backgrounds with soft masks.
- No large light beam.
- Extra depth plates are removed after the hero intro on coarse-pointer/save-data/low-memory profiles.
- Ambient petals are paused during the hero intro and resumed at low intensity after settle.

## Trigger synchronization
V4.1 listens to `sakura:opening-reveal`, emitted by the cover exit choreography immediately before the cover begins its main slide-up. Fallback `sakura:opened` remains available if the reveal event is missed.

## Rollback
V4.0.3 files remain in the repository and are not deleted.

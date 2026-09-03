# Sakura Vintage V3.8 — Final Visual QA & Calibration

Scope: Dini Anif Effect Lab only. Production remains untouched.

## Code-level QA matrix

- 320–350px mobile: compact typography, 2x2 countdown, gallery row reduction, minimum touch targets.
- 351–390px mobile: full portrait stage, circular compact music seal, safe horizontal padding.
- 391–430px mobile: source-of-truth portrait composition with 390px content shell.
- Desktop >430px: centered 430px invitation stage with ambient artwork outside the stage.
- Short landscape viewport: reduced cover spacing, compact controls, lightbox viewport guard.
- iPhone safe-area: top/bottom/left/right env() padding applied to cover, lightbox and floating music control.
- Touch behavior: 44px minimum interactive targets; carousel uses pan-y and swipe threshold; tap highlight removed.
- Overflow: horizontal overflow guarded at html/body and shell/grid levels.
- Artwork crop: portrait focal point held around center; desktop is a presentation wrapper, not a separate wide composition.
- Decorative panels: width constrained inside mobile stage, inner border retained at small widths.
- Countdown: tabular numerals and mobile 2-column fallback.
- Gallery: mobile 2-column grid, lightbox max-height and safe-area guard.
- Forms: 16px input size on coarse/mobile prevents iOS auto-zoom; width constraints prevent overflow.
- Floating music: safe-area positioning and compact icon-only mode under 390px.
- Reduced motion: continuous scene/petal/ambient animation disabled.
- Low-power/save-data: Ken Burns, backdrop blur, particles and continuity effects reduced.

## Validation boundary

This checkpoint is a code-level audit/calibration. It does not claim physical-device visual verification on a real iPhone, Android handset, or desktop browser. Physical/device screenshots remain the final external verification source if needed.

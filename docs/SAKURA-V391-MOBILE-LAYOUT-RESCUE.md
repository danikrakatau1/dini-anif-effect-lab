# Sakura Vintage V3.9.1 — Mobile Layout Rescue

Status: CALIBRATION PATCH ON TOP OF V3.9 FINAL CANDIDATE
Project: Dini Anif Effect Lab
Production: NOT TOUCHED

## Why this patch exists
Real mobile-stage screenshots exposed layout regressions in V3.9:
- opening title wrapping too aggressively,
- Couple cards becoming too narrow and fragmenting names/body copy,
- Event section retaining a two-column layout that fragmented date/location text.

## V3.9.1 fixes
- Restores normal word wrapping for titles, names and event/body copy.
- Keeps the opening composition expressive but readable.
- Converts Couple to stacked full-width portrait cards on the 320–430px mobile stage.
- Keeps Faqih and Dini as horizontal readable names.
- Converts Event to stacked full-width decorative event panels.
- Adds arch-like decorative framing using CSS layout/surfaces only; original Sakura artwork remains the visual artwork source.
- Uses original Sakura artwork as a translucent event-panel background/crop.
- Maintains the mobile-first 430px centered desktop presentation.
- Preserves reduced-motion, low-power, save-data and existing stability guards.

## Boundary
This patch does not claim physical-device final validation. User screenshots remain the source for any further V3.9.x calibration.

## Commit
V3.9.1 mobile rescue CSS calibration: 0e337c87d4fa2bbb9dd2f6fbcc65cec72214d964

## Rollback
Rollback reference before this patch remains V3.9 root activation commit:
8080cd5de0d158e73117efaca070c20d395e7713

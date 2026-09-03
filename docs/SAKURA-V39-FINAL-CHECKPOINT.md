# Sakura Vintage V3.9 — Effect Lab FINAL Candidate

Status: FINAL CANDIDATE / THEME #1 CHECKPOINT
Project: Dini Anif Effect Lab
Repository: danikrakatau1/dini-anif-effect-lab
Production: NOT TOUCHED

## Frozen architecture

1. V3.0 Global Sakura Effect Engine
2. V3.1 Visual Choreography
3. V3.2 Cinematic Continuity
4. V3.3 Section Art Direction
5. V3.4 Premium Detail & Micro-Interaction
6. V3.5 Mobile-First Stage Layout
7. V3.6 Layered Scene Composition
8. V3.7 Performance & Stability Hardening
9. V3.8 Final Visual QA & Calibration
10. V3.9 FINAL Candidate marker and rollback checkpoint

## Golden direction

- Mobile portrait is the source of truth.
- Desktop presents the same mobile invitation as a centered 430px stage with ambient surroundings.
- Original Sakura artwork remains the visual source; no Fuji/bridge/flower reconstruction via CSS or vector placeholders.
- Scene content may use layout frames, paper surfaces, borders and ambient accents, but artwork itself is not redrawn.
- Cover uses cinematic exit into a real long-form invitation.
- Reveal, ambient, petals, carousel, countdown, gallery lightbox, RSVP, gift and closing are handled by the custom Effect Lab stack.
- Reduced-motion, low-power, save-data, visibility and resize/orientation guards are preserved.

## Final-candidate boundaries

- This freeze is for Effect Lab Theme #1 only.
- It is not a Production release.
- No Netlify/Production Fetch/Source Graph/resolver/ownership/true-replace code was modified.
- Physical-device validation is not claimed by this checkpoint. V3.8 records code-level QA; real-device screenshots/testing can still trigger a V3.9.x calibration patch if a reproducible issue appears.

## Rollback anchors added in final batch

- V3.5 mobile-first stage: 8ad8c5db6c879db8b817d9cf23f34bee95c901b3
- V3.6 layered scenes: 177efb62ba059414dc16c3adedca03f15a3c0031
- V3.7 stability controller: b976bb2cf5ee03afbdd4aea302addb1963f26edc
- V3.7 stability CSS: 91ef0c78eec37b4d071e6c1c37a1ab4316f054bd
- V3.7 JS integration (corrected): 58afa363cf18d2fa044a189995d61959c93b222b
- V3.8 calibration CSS: 010e03ad5e76d9324c17491fbd1143535885208c
- V3.8 QA document: 721946b670d48d6a4da506d7e1874aabe068d288
- V3.9 final root activation: 8080cd5de0d158e73117efaca070c20d395e7713

## Post-freeze rule

Only patch this final candidate for a clear reproducible visual/device/stability issue or an explicit new art-direction request. Preserve V3.9 as the rollback reference.

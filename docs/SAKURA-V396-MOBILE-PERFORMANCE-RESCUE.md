# Sakura Vintage V3.9.6 — Mobile Performance Rescue

Status: ACTIVE Effect Lab calibration layer.

## Goal
Keep the V3.9.5 WOW opening identity while reducing Safari/iPhone GPU and paint workload.

## Changes
- Opening duplicate artwork textures reduced from four visual image plates to two: far + combined near plate.
- V3.9.4 and V3.9.5 legacy opening stages are bypassed before they build when V3.9.6 is active.
- Canvas petals use lower DPR and lower count on coarse-pointer/save-data devices.
- Canvas petals pause during the opening hero sequence and resume at restrained intensity afterward.
- Mobile scroll-continuity requestAnimationFrame loop is disabled.
- V3.9.3 mobile fake-camera scroll loop is disabled.
- Butterfly count reduced to one per eligible scene on coarse pointer.
- Fixed animated grain is disabled on coarse pointer.
- Continuous living-light animation is disabled on coarse pointer.
- Offscreen ornament layers are not painted on mobile; side duplicate artwork edges are removed while bottom decoration and panel framing remain.
- Temporary opening beam, shimmer, burst petals and will-change hints are released after the intro settles.
- Desktop retains a restrained slow far-layer idle animation; mobile settles to static depth after the hero sequence.

## Visual contract
Preserve:
- Sakura/Fuji original artwork identity.
- portal/frame reveal.
- warm light hero beat.
- one-time petal burst.
- decorative panel landing.
- staggered opening text hierarchy.

Do not restore the old four-image opening stack unless performance evidence supports it.

## Rollback
V3.9.5 remains the visual rollback reference immediately below V3.9.6.

Production Dini Anif remains untouched and frozen.

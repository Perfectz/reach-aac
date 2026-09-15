# Verification

Verified 14 September 2026 (local date).

## Reach app

Production build and 78 unit tests passed. Focused browser checks passed for hand entry, six-language welcome, camera permission errors and retry, canceled camera starts, preserved input preference, eye entry/recovery, responsive header controls, and simulated hand pointing/dwell/navigation/scrolling. The browser input tests use simulated landmarks; they do not establish physical hand-tracking accuracy or clinical suitability.

## Film

- HyperFrames 0.8.40 full check: zero lint, runtime, layout or motion findings; 61/61 sampled text contrast checks passed.
- Scene midpoints, both sides of cuts and late frames inspected before rendering. Fixed an overlapping demonstration label and a prematurely captured phone layout.
- Render: `--quality high --workers 1`, with FFmpeg 8.1.1 selected for this process. The system's older FFmpeg failed audio mixing on the first attempt; the delivered file comes from the successful retry.
- Final MP4: 131.300 seconds; 1920 × 1080; H.264 at 30 fps; AAC audio at 48 kHz, two channels; 12,295,847 bytes.
- Full FFmpeg video/audio decode completed without errors.
- Actual-file Microsoft Edge playback reached the end at 8× speed with no page errors; dimensions and duration asserted by `verify-video.mjs`.
- Rendered-file contact sheet and full-resolution phone scene inspected. Phone has four phrase choices; desktop has twelve.
- Mixed audio mean volume −25.6 dB, peak −1.7 dB; non-silent with no measured full-scale clipping. Local speech recognition was used for subtitle timing; proper nouns and “a rest” were corrected against the locked script. This is not a claim of human listening review.
- SHA-256: `8d4993be9a714f147e265a1a94b8d76d505da7e23a4da595cd72027215b01f4c`.

Costs and comparison scope are documented in SOURCES.md. The illustrative pointer and experimental webcam eye mode are explicitly labeled. No patient footage or clinical validation is claimed.

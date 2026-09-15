# Reach: small movement, real choice

A narrated, captioned HyperFrames film explaining Reach's hand controls, accessible boards, free software, comparisons with other hand and eye setups, and constructive AI-assisted development.

**[Download the finished video and subtitles](https://github.com/Perfectz/reach-aac/releases/tag/v0.1.0).**

- Runtime: approximately 2 minutes 11 seconds, 1920 × 1080, 30 fps.
- [Script](SCRIPT.md), [storyboard](STORYBOARD.md), [cost sources and limitations](SOURCES.md), [subtitles](reach-captions.srt).
- Six editable HTML scenes live in `compositions/frames/`. Narration and actual app screenshots are included in `assets/`.
- Narration: locally generated Kokoro `am_michael`. Subtitles aligned with local faster-whisper and corrected against the script.
- Pointer overlay is illustrative. Screens show the real app with sample phrases; no physical tracking or clinical performance is implied.

## Preview and render

From this directory, with Node.js and a current FFmpeg/FFprobe on PATH:

```sh
npm run dev
npm run check
npm run render -- --quality high --workers 1 --output renders/reach-hand-communication.mp4
```

The CLI is pinned to HyperFrames 0.8.40. First use downloads the CLI, browser and required fonts. Render outputs and local tooling environments are excluded from Git. The editable source and ready-made audio are sufficient to render without re-generating narration.

`build-scenes.mjs` regenerates the six visual scenes from `audio_meta.json`. `capture-app.mjs` refreshes screenshots from Reach's local preview and requires the root app dependencies. `transcribe.py` is optional and requires faster-whisper; re-running recognition requires reapplying the documented proper-name corrections. `finalize.mjs` applies those corrections, sets exact audio windows and exports the SRT from caption groups. The assembled `index.html` and caption composition are checked in for direct use.

Third-party product names identify comparison subjects; no endorsement is implied. Reach source is MIT. Existing third-party software and models retain their licenses; see the repository's THIRD_PARTY.md.

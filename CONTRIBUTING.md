# Contributing to Reach

Reach is a free browser communication tool. Start by reading README.md and the current limitations. Useful contributions include testing hand movement with intended users, improving setup and recovery, language review, accessible navigation and performance on inexpensive devices.

Use Node.js 20.19+ or 22.12+, then `npm ci`, `npm test` and `npm run build`. Browser checks live in `tests/*.mjs`; run the production preview on port 4173 first. These scripts use Microsoft Edge through Playwright. Create `artifacts/` before browser checks that write screenshots or results.

Keep camera processing local. Never publish camera recordings, patient details, exported personal boards or voice recordings in an issue without the person's informed permission. Describe a reproducible problem using sample data, input mode, browser, screen size and expected behavior.

For hand-control changes, check calibration, sensitivity, dwell feedback, lost tracking, stop/restart, navigation and alternate-input recovery. Preserve explicit camera permission and the person's selected words. Distinguish simulated input coverage from physical-device testing. Do not make clinical or comparative accuracy claims without suitable evidence.

Open a focused issue or pull request describing the problem, the change and how it was checked. Include the smallest useful example. Translation reviews by fluent speakers and hands-on feedback are especially valuable.

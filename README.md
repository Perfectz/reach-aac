# Reach

A free, open-source browser communication app for people who find speaking difficult. Reach turns supported hand or finger movement into a visible pointer and large, selectable messages. An ordinary camera can provide experimental hand tracking; no held key, extension, account or AI subscription is required. Language, vocabulary, movement, timing and phrases are personalized for each person. Touch, switch scanning and experimental eye control remain available.

The software is free. A compatible computer or tablet, camera, suitable positioning and any assistance still have real costs. Reach controls its own communication interface; it does not replace the system mouse across other apps.

## Open it

**[Open Reach in your browser](https://perfectz.github.io/reach-aac/)** — no account, extension or installation required. Camera access starts only when you choose Start camera and grant browser permission.

[Public source code](https://github.com/Perfectz/reach-aac). The commands below run a local copy at **http://localhost:4173**.

To start it again on Windows, double-click **Start-Reach.cmd**. Node.js 20.19+ or 22.12+ is required for local development/hosting. End users of a hosted copy only need a browser.

```sh
git clone https://github.com/Perfectz/reach-aac.git
cd reach-aac
npm ci
npm run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort
```

For development: `npm run dev`. The development server does not install the offline board; use the production build and preview to test offline operation.

GitHub Actions builds and publishes `main` to GitHub Pages. `REACH_BASE_PATH=/reach-aac/` sets the deployed prefix for app assets, camera models and the scoped offline cache. Omit it when hosting at a domain root. `node tests/deployment.mjs` checks a prefixed build on port 4175; set `REACH_TEST_URL` to test another hosted copy. The camera test uses synthetic video while loading the real MediaPipe model.

The [narrated HyperFrames introduction](videos/reach-hands/README.md) shows the hand workflow, compares other setups and their costs, and explains the project's approach to AI-assisted development. See [CONTRIBUTING.md](CONTRIBUTING.md) to help test or improve Reach.

## Start with hand movement

1. On the welcome screen, choose **Set up hand movement**, or use the green **Hand control** button in the main header (hand icon on phones). This opens the hand settings; the camera stays off until you choose **Start camera** and allow browser access. You can also use **Set up → Input & movement → Hand pointer**.
2. Position the camera so the whole hand is visible in even lighting. Support the hand in a comfortable resting position. Pick the most reliable finger or thumb.
3. Choose **Set resting position**, then make a small movement. A marker in the preview identifies the tracked fingertip; the on-screen pointer shows what you are selecting.
4. Adjust **Movement gain** with the large decrease/increase buttons until movement feels comfortable. Adjust the dwell time to allow enough time to settle. Move away after each selection to avoid repeating it.
5. Choose **Done**, try a familiar message, and use the large page or scroll buttons to move around. Phones show fewer options; tablets and desktops show more. Use **Take a break** for a rest or **Turn camera off** to stop tracking.

Hand tracking needs a recognizable whole hand and enough controllable movement to aim. If aiming is difficult, try **Camera movement switch**: a movement in the central camera region selects the item highlighted by scanning. Neither method has been clinically validated; test the chosen setup with the person and their helper. Saved profiles retain the chosen input, but never start the camera automatically after reload.

## Set up for a person

Under **Set up**, **Keep screen awake** asks the browser to prevent dimming during the current session. **Allow screen to sleep** turns it off. Status reports active, denied/unavailable or system-released requests. Hidden tabs release the request; returning requests it again only while the session option remains enabled. Reload starts with it off. Keeping the screen lit uses more battery. Availability depends on the browser/device, and power-saving settings may override it; see [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).

1. Open **Set up** together. The three-step panel offers a language, a phrase preset, and an input method. Choose **Home care**, **Hospital care**, or **Communication with family**. Changing the phrase preset preserves input, calibration, dwell timing, voice preferences, and personal messages.
2. Choose **Input & movement**. Start with the easiest reliable input, using familiar “yes” and “no” questions to try it. Timing is adjustable; there is no need to rush.
3. Add names, preferred activities and messages under **Personal phrases**. They appear in **My phrases**. No person's name is included by default.
4. Select a tile to test the sound. If no matching voice is available, messages remain visible. The setup panel reports offline voice availability. Install the desired language voice through the device's speech/language settings if needed.
5. Export the setup as a JSON backup. Import it on another device to transfer the configuration. Exports contain personal phrases. Camera/scanning must be started deliberately after import or reload.

| Input | How it works |
|---|---|
| Touch or click | Tap/click a tile. Also accepts an existing mouse-control or eye-gaze pointer that can click. |
| Dwell | Rest an existing pointer over a tile or category. No click or held Alt key. Move away before repeating. |
| One switch | Start scanning, then press Space/Enter or activate a switch that emits either key. Tiles, repeat/clear and categories participate. A large on-screen selection pad is also available. |
| Camera movement switch — experimental | A supported finger/hand moves within the central camera box. Calibrate stillness before movement can select. Use **Try your input** for a separate practice session, or **Start scanning** to operate setup controls and the board. Movement must persist briefly; relaxation is required before another trigger. Calibration updates the displayed and saved threshold. |
| Hand pointer — experimental | Show the whole hand. Select a finger, set its resting position, and adjust movement gain. Small movements steer the app pointer; dwelling selects. Hold the pointer near the screen edge to scroll. |
| Eye control — experimental | Select Eye control in Input & movement, then Set up eye control. Allow the browser camera. Follow 5 large targets nearer the centre, then 4 separate accuracy-check dots. Passing enables a screen-sized board (4 tiles on phones, 6 on tablets, 8 on roomy desktops; Larger tiles keeps 4) with a visible gaze pointer and at least 1.8 seconds of dwell. More pages through other messages. No extension, driver or application installation is required. |

Eye setup uses a local MediaPipe face/iris model plus Reach's calibrated regression from eye features to screen coordinates. It is an experimental estimator, not a clinically validated gaze device. Calibration offers large pace buttons for a 3-second or 5-second settling period, or helper-paced collection. The selected pace stays highlighted; no dropdown is required. On short screens, large Up/Down buttons scroll the setup instructions and choices while Cancel remains reachable. Thirty training samples per point are collected, and the 20 nearest the per-feature median are retained to reduce the effect of brief outliers. Validation samples are not trimmed. Blinks pause collection without discarding progress; there is no face-detection deadline. Take a break preserves completed points, Redo repeats only the current point, and failed validation retries only difficult targets. Calibration and validation use different screen targets; all four validation targets must have at least 70% of samples within 18% of viewport width and height of the expected point. These are implementation thresholds for large targets, not a clinical accuracy standard. Calibration remains in memory and is repeated for every camera session; it is never exported. Closing the eyes, losing the face, substantial head-position changes or stale frames cancel selection. Resizing the viewport requires recalibration. A helper can start setup; the person calibrating only needs to look at the dots. If the accuracy check fails, activation is blocked and retry/touch remain available.

Daily communication uses **Previous page / Next page / Home / Set up**, with a **Topics** menu. Pages show up to 12 tiles on roomy desktops, 8 on tablets, 4 on portrait phones, and 2 on short screens. The larger-tile option keeps 2 or 4 tiles. All phrases remain accessible; the larger layout does not remove vocabulary. After selecting a page with a camera or dwell pointer, move away from the page button before selecting again. Tracking loss alone does not release this protection.

Inside setup, the dock provides **Scroll up / Scroll down** instead. Short landscape screens and overflowing message layouts also retain scrolling, with separate page buttons beside Topics. Keep pointing at a scroll button to repeat scrolling; move away to stop. Switch scanning includes navigation and setup controls. Text entry, native sliders, and device permission prompts may still require a helper. Camera calibration hides the dock. Printing includes every phrase in the selected category/preset, rather than only the current page, including when initiated from eye mode.

### Adjust input without dragging

If saving an input adjustment fails, Reach restores the previous value and shows a storage error. This applies to input mode, dwell/scan timing, scan previews and their speed, finger choice, movement gain and threshold. A failed mode change keeps the current input running; retry after resolving storage or a conflicting tab.

Under **Set up → Customize**, large buttons supplement the native controls for board language, layout and phrase preset. Large toggles control speech and higher contrast. Selected buttons show their state; native controls and buttons stay synchronized. These choices participate in the same scanning and dwell system as the communication board. System file pickers and permissions still depend on device accessibility or assistance.

Input & movement provides large **Decrease / Increase** buttons for dwell time, scan time, hand movement gain and motion threshold. Each activation moves one step; limits disable the corresponding button. The sliders remain available for direct adjustment. Individual finger buttons supplement the finger dropdown. Adjustment labels and buttons support all six interface languages.

The buttons participate in dwell, finger/eye pointing and switch scanning. After a pointer selection, move away before selecting the same adjustment again. Changing the tracked finger clears its resting position, so a new resting-position calibration is required; assistance or another input may be needed for that step. Physical camera and switch usability still require individual testing.

### Languages and phrase presets

All 60 built-in communication phrases, category names, the three-step setup choices, and core navigation controls support **English, Mandarin Chinese (Simplified script), Hindi, Spanish, Modern Standard Arabic, and Thai**. Arabic uses right-to-left layout. English, Mandarin, Hindi, Spanish and Standard Arabic were chosen using total-speaker rankings rather than native-speaker-only rankings; Thai is retained for existing users. Ranking context: [Ethnologue 200 methodology](https://shop.ethnologue.com/products/2025-ethnologue-200) and [2025 total-speaker summary](https://lilata.com/en/blog/most-spoken-languages-in-the-world/).

- **Home care:** daily comfort, meals, bathroom, repositioning, rest and assistance.
- **Hospital care:** pain, breathing difficulty, nurse/doctor requests, suction, positioning, nausea, explanations and asking someone to stop.
- **Communication with family:** affection, listening, company, music, photos, calls and sharing the day.

Each preset supplies 12 priority messages across pages. Eye control retains Yes / No / Help / More as its first page, then prioritizes the selected preset's messages. Other categories remain available. Personal phrases can include translations for all six languages and survive export/import. Untranslated personal text falls back to English with an English voice instead of being pronounced with the wrong language's voice. Installed voice availability varies by device. Detailed camera diagnostics and some advanced caregiver settings remain in English; translations should be reviewed with fluent users before care use.

**Take a break** stops communication selections and cancels speech while keeping an already-running camera and its calibration available. A large rest screen offers Resume, Input & movement, and Turn camera off. Dwell, hand, eye and switch input can operate the rest screen. Its text explicitly tells you when the camera remains on. Returning from rest preserves vocabulary, page and prior scanning state; moving away from Resume is required before another camera/dwell selection.

**Pause input** and **Turn camera off** fully stop the camera and scanning. Escape pauses/resumes the board when no dialog is open; in a dialog it closes the dialog. Leaving the tab stops the camera; start it again from setup. Returning from a full pause does not silently reactivate camera access. The board shows camera-off, calibration-needed, tracking-visible and tracking-lost status in the selected language. If the camera is unavailable, touch and keyboard access remain usable; the app cannot recover a completely lost movement signal without another available input or a helper.

When the app window loses focus while still visible, selection pauses. Returning gives an active switch scan a fresh full interval on its highlighted control. A scan that was stopped stays stopped. This is separate from hiding the tab, which stops camera access and scanning.

### Auditory scanning

In Change input, **Try preview voice** reads a short sample at the selected scan-preview speed. It works before starting a scan and does not turn on automatic previews or change the message. **Stop preview** cancels it. Setup shows missing-voice and playback status even when scanning is off. The Speech preference still applies; leaving setup or reaching the 20-second limit stops a trial. Listen to the sample to check actual device sound and comfortable pacing.

The input area shows whether a preview is reading, waiting, blocked by another message, unavailable, failed or timed out. This status is also visible in input setup and supports all six interface languages. A missing preview voice does not disable visual scanning. The status describes software playback state, not confirmation that sound was audible.

Main-board personal phrases carry their actual displayed language and automatic text direction. A phrase without a translation into the interface language is previewed in its original language. An explicit translation uses that translation's language. The preview does not substitute an unrelated voice when the matching local voice is missing.

In **Change input**, enable **Speak scan previews** to hear highlighted choices while switch or camera-movement scanning runs. It is off by default and saved per person. Prompts begin with a translated “Option” prefix; they do not commit a message. Selection still uses the chosen switch input. Prompts require an available offline device voice and the Speech preference enabled. Headphones can help distinguish previews from communication to a partner.

Scanning holds the current choice while its prompt plays, then allows the configured selection interval. You can select during playback. A 20-second limit stops a stalled or excessively long preview so scanning can continue. Previews pause for committed speech/recorded output and are suppressed in recording and audio-backup dialogs. Stopping scanning, pausing input, leaving the window or selecting a target stops the current preview. Scan preview speed can be adjusted from 0.5 to 1.5 using large Decrease/Increase buttons in Change input. It is saved per person and applies to subsequent previews, independently of scan selection timing and committed speech. There is no separate audio-output device control. Actual listening, fatigue and physical-switch usability remain unverified.

### Correcting a message

The conversation controls provide **Stop speaking**, **Wrong selection**, **Please wait**, and **Not sure**, translated into all six supported languages. They remain visible above the navigation dock on long boards and participate in dwell, camera-pointer and switch selection. Wrong selection explicitly says that the previous selection was not intended; stopping speech cannot undo words already heard.

**Set up → Review before speaking** optionally previews each selected message until **Speak now** is selected in the message bar. Help and Wrong selection speak immediately, as described beside the setting. The voice-off preference still applies. Clear cancels speech and removes any pending message. Review preference is retained in backups. Speech behavior is tested using an instrumented speech API; that does not verify device voice pronunciation or loudspeaker output.

### Personalize a phrase pack

The message composer also offers **Download message**. It saves only the current text to `reach-message.txt`, including line breaks and non-English characters. This remains available when local browser storage cannot save the draft. It does not send the message to anyone; use your device's file tools if you choose to share the downloaded text.

If a pack cannot be saved, its editor stays open with your draft arrangement and the existing board remains unchanged. Retry Apply or discard the draft. Failed quick phrase-entry saves also preserve the typed text and translations for retry.

Printed fallback boards retain saved personal photos and include partner instructions in the selected interface language. Printing shows the complete selected pack rather than only the current screen page; the normal input controls return afterward. Check a printed copy with the intended user and partner before relying on it.

Setup import reports success only after the profile is saved. If storage rejects the write, the current setup remains in use and the same file can be retried. Closing setup while a backup is being read prevents that pending import from changing the app later.

While a photo is being processed, **Cancel photo processing** returns to the unchanged phrase draft. Save is disabled until processing finishes or is cancelled. Cancelling does not abort the browser's underlying image decode, but its late result is ignored. If saving fails because storage is full, the draft and photo preview remain available for retry.

Personal phrases can also use **Choose a photo**. JPEG, PNG and WebP files up to 10 MB and 16 megapixels are converted locally into a small JPEG, preserving proportions. Only the compressed copy is stored, with a maximum encoded size of 16,000 characters. Save the phrase to keep it; discard leaves the saved phrase unchanged. Photos replace the symbol on the board and are included in Reach setup backups and OBF exports. They are not uploaded by this feature. Browser storage limits still apply; a failed save must be retried or cancelled. Setup import accepts files up to 8 MB. Keep original photos separately.

When creating or editing a personal phrase, choose **Choose a symbol** to select among 12 labeled symbols. Four large choices appear per page, with Back/Next controls and six-language labels. The choice is a draft until the phrase is saved; discarding edits leaves the saved phrase unchanged. Symbols are preserved in Reach setup transfers and appear on the communication board when no photo is attached. This is a small starter symbol set using the existing Lucide artwork, not a comprehensive AAC symbol library.

Choose a care/family preset in **Set up**, then **Edit this phrase pack**. Select a numbered position and replace its message using the built-in or personal library. **Leave this position empty** hides the message without moving later positions. Yes and No remain protected in the first two positions. You can append positions up to 60; the personal library supports up to 200 messages.

Edits are drafts until **Save phrase pack**. **Discard changes** or closing the editor leaves the saved board unchanged. **Restore original pack** restores the draft; save to apply the restoration. Home care, Hospital care and Family each retain their own edited pack. All six languages use the same saved positions; phrases without a personal translation use the existing English fallback.

Packs are included in Reach JSON backups. Personal phrase IDs remain stable on reload and import. Deleting a personal phrase leaves its pack position empty instead of moving other messages. Eye mode retains its Yes/No/Help start page, then the pack's positions, including empty positions, before the remaining library.

### Export to another AAC app

**Set up → Export board to another app** downloads the selected care/family phrase pack as an [Open Board Format](https://www.openboardformat.org/docs) `.obf` file. Choose a language and 2, 3 or 4 columns. Export preserves phrase order, repeated phrases and empty positions, embeds PNG icons with attribution, and optionally includes current-person recordings whose phrase, text and language match exactly. Private user content is not relicensed for public sharing.

Missing translations block download unless you explicitly choose to leave their positions empty. No automatic translation is generated. The review lists the positions before download. Exports exclude input/calibration settings, other profiles, conversation drafts and the handover card. Keep downloaded personal content private.

This is single-board export; OBZ import and multi-board export remain unfinished. A synthetic English board was imported into AsTeRICS AAC release-2026-09-03-10.08/+0200 on 13 September 2026: labels, positions and icons rendered correctly. Its OBZ re-export preserved grid labels and exact PNG bytes, but omitted the recording and icon attribution. Selecting Yes invoked text-to-speech in that test. Choose a home grid in AsTeRICS before OBZ export to obtain a manifest with a root board. Keep the original Reach file. This does not establish compatibility with other apps, languages or codecs, or a complete round trip back into Reach. The export screen currently uses English instructions; board text supports the six existing languages.

### Use an imported communication board

Choose **Set up → Boards from other apps**, select a single `.obf` file and review it before saving. Boards are stored separately for each person. Unsupported actions, linked-board navigation, unsupported languages and missing/external media block saving; the importer does not silently remove them or fetch remote content. The supported languages are English, Chinese, Hindi, Spanish, Arabic and Thai. The viewer, library, backup explanation, import review instructions and removal confirmation use the selected interface language. Validation issues and file/storage failures have translated guidance with expandable technical details.

Open a saved board to select a message, review its full spoken text, then choose **Speak**. Large pages retain numbered positions and empty slots; the original grid is retained in the downloaded file. Speak, Stop and Help have large targets. Embedded recordings use the existing speech controls; missing or failed output remains visible as a status message. Unreadable images display “Image unavailable” while retaining their labels.

The imported board's text and speech remain in its original language when the interface language changes. Its choice grid retains the original language's direction; Arabic interface controls do not reverse an English board. Board review issues have translated explanations and expandable English technical details. File and storage failures also have translated recovery guidance; low-level diagnostics remain in their original language. If library loading fails, use Try again. A failed save retains the reviewed file for retry. Translations need native-speaker review; automated checks establish rendering and routing, not linguistic quality.

**Download original** preserves the source file byte-for-byte, including attribution and unused content. Reach settings backups do not contain imported boards: download each original separately. Storage is limited to 20 boards or 64 MB per person; an individual file may be up to 32 MB. Removal requires a confirmation. Clearing browser site data also removes these local boards.

Browser checks cover import review, explicit speech, recorded/TTS routing, original label versus spoken text, pages, downloads, reload, removal, image failure and contrast. Storage tests cover owner isolation and failed-write rollback. These do not establish physical input usability, audible pronunciation, every media codec, or OBZ compatibility.

### Practice an input method

**Set up → Try your input** offers four numbered targets, followed by a ten-second rest without selecting a number. Targets have no time limit. The trial records requested targets selected, other target selections, active practice time, and number selections during rest. Camera modes need setup first; motion-switch practice requires completed stillness calibration. Practice uses the current input and does not speak communication messages.

During rest, camera signal availability is measured separately. Missing signal is disclosed rather than interpreting no selections as success. For touch, dwell and keyboard input, availability means the app is active; it does not establish physical switch connectivity. Timers pause when the tab lacks focus and exclude long frame stalls. Mark if someone helped select the targets. The result is a short practice observation, not a clinical assessment or proof of reliable communication.

Results offer explicit actions for slower selection, larger board tiles, retry, or another input. These changes are never applied automatically. Closing practice restores prior scanning state and preserves the communication board/message. Results and assistance disclosure exist only in the current practice session and are not saved in backups. Real-user comfort, fatigue, literacy and camera suitability still need individual trials.

### Write your own message

The phrase composer inserts only originals or explicit translations that match the draft language. Untranslated phrases keep their positions but are disabled, with a translated explanation. Their originals remain usable on the main board. This prevents an automatic foreign-language fallback from being treated as text in the draft's language. Manually entered text is not language-detected.

**Write a message** opens the composer from the input bar. Combine phrase-library buttons, use the large grouped letter buttons, or enter text using a device keyboard. The grouped keyboards provide English/Spanish Latin letters and Arabic, Hindi and Thai characters. Chinese users can combine existing Chinese phrases; entering new Chinese words requires the device's Chinese keyboard in the text box. The composer does not yet provide its own Pinyin IME.

Messages can contain up to 500 Unicode code points. Letter buttons append at the end; the text box supports native editing. Delete removes the last grapheme where browser support is available, and Undo restores up to 40 edits. No composed message speaks automatically. **Speak now** explicitly submits the message, and **Stop speaking** cancels speech. Voice availability is shown inside the composer.

The draft and its source language autosave only in this browser under `reach-draft`; clearing the draft removes its stored text. Drafts are not included in setup backups. **Save to My phrases** makes a message part of the backed-up personal library, preserving its source language and preventing exact duplicates. A saved native-language message uses that language's voice when no translation exists in the chosen interface language. The app does not invent translations for custom messages. Existing translated presets are unchanged.

Personal phrases now allow 500 code points per language. Settings imports accept up to 4 MB to cover the enlarged library. Storage failures are reported, and the composer does not report a phrase as saved when persistence fails.

## Offline, privacy and cost

- The basic app and board cache automatically. Wait for **Saved for offline use**, then test an offline reload on the intended device.
- The basic compressed JavaScript and CSS are about 41 KB, plus a pre-cached ~47 KB compressed optional camera-tracking loader. No external fonts, analytics, advertising, or account services are used.
- The hand model and one WebAssembly runtime download on first use (approximately 20 MB uncompressed) and cache on this device. Motion-switch mode does not need these downloads. After updating the app, the optional camera assets may need downloading again.
- Camera video is processed locally and is neither uploaded nor stored. Settings and phrases are saved in browser local storage. Clearing site data removes them; export a backup first.
- A same-origin connection policy blocks external camera-library diagnostic connections. Models and runtimes are served by this website; there is no external camera-processing endpoint.
- Speech uses the device's Web Speech voices. Reach prefers a local voice. If only an online voice exists, the status identifies it; that voice may send the selected text to the device's speech service. Local voices are needed for offline audio.
- A browser can evict offline data. Test the actual device and keep a printed board as a fallback. **Set up → Print board** prints the current category, including personal phrases when selected.
- Install from the app's **Install app** button when the browser offers it, or use the browser's installation/home-screen option. Installation support varies by browser.

## Scope and limits

This is a working AAC board and in-browser input layer. It **does not control the operating-system mouse or TD Snap/other desktop applications**. That would require a separately installed native input bridge with appropriate OS permissions. Eye-gaze estimation is experimental; deliberate-blink selection is not implemented.

Camera options remain experimental. Real movement reliability depends on the person, camera angle, lighting and device. They need an individual trial, including periods of stillness and unintended movement. A generic motion detector cannot determine whether movement was intentional. Camera loss/stalls stop or cancel tracking selection.

The help tile displays and speaks “I need help” on the local device. It does not call, message or notify anyone elsewhere. This app communicates requests; it is not a monitoring or emergency-response system.

Phrase wording should be reviewed with the actual user and a fluent communication partner. The app does not assume that the user can read every label or interpret every icon.

## Hosting

`npm run build` produces the static `dist/` folder. Serve it at the root of an HTTPS site. Localhost also permits camera/service-worker access; an ordinary HTTP LAN address generally does not. A public URL has not been deployed as part of this delivery.

Use revalidation headers for `index.html` and `sw.js`; hashed `/assets/` files can be cached immutably. The build creates a versioned service worker. Core assets pre-cache before offline-ready status; optional camera assets cache when requested. Existing personal settings remain separate from application cache updates.

## Verification

```sh
npm test
# Start the production preview first, then:
node tests/browser.mjs
node tests/setup.mjs
node tests/eye.mjs
node tests/navigation.mjs
```

The browser suite uses installed Microsoft Edge and generated canvas video, not a person's real camera feed. Results and screenshots are in `artifacts/`. It checks onboarding, messages, settings persistence, custom-phrase escaping, dwell, switch scanning, camera calibration/lifecycle, hand-model initialization without a detected hand, accessibility rules, responsive layouts and offline reload.

Automated checks do not establish physical switch compatibility, real hand-tracking accuracy, spoken audio quality, Thai translation quality, or usability for a particular person. Physical Android/iOS devices and Safari still need testing.

## Technology and licenses

### Editing saved personal phrases

Choose **Personal phrases → Add a personal phrase** to create a message using the accessible draft editor. Select its original language, use **Edit with large buttons** to compose without a physical keyboard, and save explicitly. New phrases show the original-language field first; **Add translations** reveals the other fields. Hiding unused languages keeps entered translations visible and preserves all draft text. English text is not required for a message in another original language. Optional translations require review when more than one language is entered. Discard leaves the library unchanged; a failed save keeps the draft available to retry. New Chinese words still require a device IME.

Open **Set up → Customize → Personal phrases**, then choose **Edit personal phrase** beside a saved message. Edits remain a draft until **Save changes**. Preview all supplied translations, select the original language, and confirm that retained translations were reviewed. English is optional when another original language is selected. Clearing a translation removes it instead of silently substituting old wording.

Saving keeps the same phrase ID and its positions in all packs. Existing speech and the last selected message retain their original wording; selecting the updated tile uses the edited text. A saved recording is used only when its language and exact text still match. **Discard edits** leaves the phrase unchanged. Removal has a separate confirmation and leaves pack positions empty. Recordings for removed phrases remain in audio backup until removed separately or the person profile is deleted.

Each translation field offers **Edit with large buttons**. Use grouped letters or matching-language phrases, delete, undo, clear or insert spaces. **Use this text** updates only the phrase draft; save the outer phrase editor to commit it. **Discard text edits** restores that field's previous draft text. These controls do not speak or overwrite your conversation draft. Original-language buttons also support dwell and scanning without a native dropdown. Existing Chinese phrases can be inserted, but new Chinese words still need a device IME. Large-button editing in other setup forms and physical accessibility-device verification remain unfinished.

### Guided first setup

Choose **Personalize setup** on first use, or **Set up → Find my setup** later. The guide asks for language, reading preference, usual position, and a comfortable selection method. It supports touch/click, pointer dwell, one-key/switch scanning, camera methods and a helper selecting on the person's behalf. Review before applying; cancelling preserves the current setup. Personal phrases, handover details and timing settings are retained.

Applying a touch/pointer/switch setup opens practice. Camera choices open camera setup first, then practice after Done or successful eye calibration. Practice remains unavailable until the required camera calibration is ready. The guide does not start the camera automatically. A helper-selection choice marks the initial practice assistance flag, which can be corrected in results. Larger-text and partner-reading choices use larger board targets.

The guide describes existing capability; it is not a clinical suitability assessment. The board still relies on words and simple icons, and does not provide a complete symbol-language vocabulary. OS accessibility that already clicks should use Reach's touch/click mode to avoid adding a second dwell system. Current position/reading answers are retained per profile, but do not replace the person's explicit communication handover instructions.

### Offline readiness and camera downloads

Open **Set up → Offline readiness** to verify the cached board and camera files against the current build's byte sizes and SHA-256 checksums. Missing or damaged files can be downloaded again; the screen shows remaining bytes. Hand and eye downloads share the runtime appropriate for this browser, and do not request camera permission. Downloads can be cancelled; completed files remain reusable. Camera files have a separate content-versioned cache, so app-only updates retain unchanged models.

Voice readiness is separate: the screen distinguishes a listed local voice, an online-only voice, no matching voice, and speech being turned off. **Play voice test** speaks a test in the configured speech language; **I heard it clearly** records confirmation for this open screen only. A software voice listing or completed download does not prove audible sound, good calibration or reliable movement recognition. Browser storage can be cleared/evicted. Try reloading with the network disabled on the actual device before depending on offline use.

The readiness screen requires the production build and an active service worker; it reports a reload/setup need in an uncontrolled or development session. Its voice test checks the device voice, independently of saved phrase recordings.

### Recorded speech

Open **Set up → Recorded speech**, select a message, and record its exact text in the configured spoken language (or board language when speech follows the board). Recording starts only after pressing **Record message** and granting microphone permission, and stops after 30 seconds or when you press Stop. Preview before choosing **Use this recording**. Closing the editor or hiding the app releases the microphone. Stop playback is also available.

Saved clips play instead of synthesized speech for the matching person, phrase, language and exact text. A changed phrase does not reuse its old recording. Voice-off and review-before-speech settings still apply. Stop, Clear, Pause, rest and profile changes stop recorded playback too. Clips live in IndexedDB on this browser and work offline where browser audio playback is supported. Limits are 2 MB per clip and 100 clips / 10 MB per person.

Download saved clips individually, or open **Recorded speech → Back up recordings** to export all recordings for the current person into one file. On another device, import the person's setup first, then choose the recording backup. Preview shows exact phrase/language/text matches and unmatched clips. Existing clips are kept by default; replacement requires selecting **Replace matching saved recordings**. Unmatched clips are not imported. A malformed file is rejected before writing, and a failed import rolls back its writes.

Setup JSON exports do **not** contain audio: keep both the setup and recording backup. Audio backups accept up to 100 clips and 10 MB of decoded audio (15 MB file limit). They contain phrase text and recordings, not other people's profiles. Removing a person also removes their saved recordings, but does not remove downloaded backups. Browser playback restrictions, microphone quality and pronunciation need testing on the actual user's device. Cross-platform audio codecs and open AAC formats remain separate interoperability work.

### Communication handover card

Open **Set up → How I communicate** to record an optional name, yes/no signals, response waiting time, comfortable positioning, backup communication method and other personal instructions. **Edit card** opens a draft; **Save card** commits it, while **Discard edits** restores the saved version. **Clear these fields** clears the draft only until saved. Empty fields are explicitly shown as not provided.

The saved card survives changes between home, hospital and family presets and is included in setup JSON exports/imports. **Print card** prints only the handover information. **Download card** creates a self-contained HTML document that can be read offline or printed in a browser without Reach. It contains the card and current board language/input method, not personal phrase lists, symptom drafts or camera data. Labels support all six languages; personal notes are displayed exactly as entered and are not translated. Native text entry may require a helper or the device's accessible keyboard.

There is one card per person profile. Switch to the correct person before viewing or exporting their card.

### People sharing a device

Open **Set up → People on this device** to name the current profile or add another person (up to 12). New profiles start with an empty personal library, draft and handover card. Each profile preserves languages, timing, input preference, phrase packs, personal messages and composition draft. Switching stops speech/camera input and scanning, clears the selected message and temporary care draft, and opens the new person's setup. Restart the person's camera or scanning deliberately when ready.

Existing single-person data migrates into **My profile**. Saves use one authoritative local registry; legacy settings/draft keys are compatibility mirrors. Another tab changing the registry causes open Reach tabs to reload, so stale person data is not left onscreen. Stale writes are rejected. Profiles organize people’s data; they are not password-protected accounts, and anyone using this browser can access them.

To remove an inactive person, select **Remove profile**, review the deletion notice and confirm. You must switch away before removing an active profile. Export each person's setup separately before removal if needed. Setup exports exclude composition drafts and other profiles; save a draft to My phrases before exporting it. Downloaded files are not deleted when a profile is removed. Browser storage clearing can remove all profiles, so keep external backups.

### Describe discomfort

Open **Topics → Describe discomfort** to build a care message through large choices: pain, discomfort, itching or numbness; body area; side; intensity; and when it started. Body areas use pages of four choices. Details may be omitted or marked **Not sure**. **All over** omits the side question. The final review lets you change individual details, speak, stop speech or start a new message. Selection alone never speaks the draft.

The message contains only chosen details, with authored text in all six supported languages. It works with the same touch, dwell, switch and camera selection controls as the other dialogs. After speaking, the message can also be shown in the partner display. Drafts remain during the current page session, but are not stored across reloads or included in setup backups. This feature communicates a person's choices; it does not assess symptoms or recommend care. Native-speaker review and trials with AAC users remain outstanding.

### Bilingual conversations

Open **Set up → Display & spoken languages** to choose a partner display language and a spoken language independently of your board language. After selecting a message, the people icon beside it opens a large partner display with explicit **Speak partner language** and **Stop speaking** controls. Opening this display does not speak a pending message.

Only provided translations are shown or spoken. Personal messages without a requested translation say **Translation not provided** in partner view; an explicitly selected speech language does not substitute untranslated text. Automatic speech follows the board language where translated, otherwise the message's recorded source language. Voices must be available on the device; online voices require a connection. Preferences persist locally and in setup exports. Legacy setups retain their previous Thai/English secondary display until changed.

Application code: MIT; see `LICENSE`. Uses Vite, Lucide icons (ISC) and MediaPipe Tasks Vision (Apache-2.0). Dependency license texts are distributed by their packages. Model and runtime assets are under `public/tracking/`; see `THIRD_PARTY.md`.

References: [MediaPipe hand-landmarker web guide](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js), [face-landmarker web guide](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js), [device speech voices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices). Reach uses its own calibrated eye-feature estimator, not WebGazer.





Standard boards adapt to screen space: up to 12 choices on roomy desktops, 8 on tablets or shorter desktop windows, and 4 on phones (2 on short phone screens). The Larger tiles setting retains 2–4 choices.

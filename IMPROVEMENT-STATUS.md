# Reach improvement work

## Hand movement entry and camera retry

Welcome now offers a primary **Set up hand movement** button in all six languages, with touch and personalized setup alongside it. A green **Hand control** header shortcut stays visible alongside the secondary eye shortcut; phones use labeled 44px icon buttons, verified to fit from 320px through desktop widths. Hand pointer appears first in the input choices. Choosing it opens the hand camera controls without requesting camera access. Existing saved input choices remain unchanged unless the user chooses another method. README now explains the hand setup sequence and distinguishes free software from equipment costs and from controlling the operating system.

Camera startup uses a separate UI attempt token: an ordinary permission denial or unavailable camera restores the Start button, while canceled older requests cannot unlock or overwrite a newer attempt. Production build and all 78 unit tests passed. Browser checks passed: camera-error-languages (six-language denial/missing/unreadable retry), camera-start-cancel, hand-entry (explicit camera start, saved switch preference, failed save), welcome-languages (six-language phone layout and axe), and pointer (simulated fingertip feedback, dwell, tracking loss, rest/resume, paging and setup scrolling). These checks do not establish real-person hand tracking accuracy or physical-device usability.

## More choices on larger screens

Following the user's preference, standard boards now adapt to screen space: 12 slots on roomy desktops (at least 1100x850), 8 on tablet/desktop windows, 4 on phones, and 2 on short phone windows. Explicit Larger tiles still limits the board to 2–4 slots. Eye boards use 4 on phones, 6 on tablets and 8 on roomy desktops, with Larger tiles retaining 4. Eye More stays in the last slot even on incomplete pages. Setup labels and eye instructions describe the adaptive behavior.

Evidence: production build, all 78 unit tests and responsive-density.mjs passed. Browser checks cover 320x640, 390x844, 768x1024, 1024x768 and 1440x1000, resize adaptation, tile bounds/clipping, all eye pages and the larger-target override. eye.mjs passed simulated desktop calibration, dwell selection, rest/resume, correction, setup scrolling, visibility loss, resize recalibration and failed-accuracy gating. Inspected artifacts/responsive-desktop.png. Physical iPad/phone use and real-person accuracy with denser eye targets remain unverified; the larger-target option remains available.

## Held keys trigger a single pause action

Repeated Escape events and repeated Space/Enter events targeting buttons are prevented before native activation. This avoids a held Enter resuming input and then activating the newly focused Pause button. Normal text-input repetition remains available. Production build, six-language pause.mjs, scan-focus.mjs and print-input.mjs passed, including held Enter/Escape and print suppression.

## Unapplied guide answers survive same-tab reload

Guided setup now keeps a validated draft of answers and the current question in session storage, scoped to the current person. Reopening the guide after a reload resumes that draft without applying it. Cancel/close, successful Apply and switching people clear it. The guide explains this in six languages and reports when draft storage fails. Drafts are separate from exported/applied settings and are not intended as cross-device backups.

Evidence: production build, guide-draft.test.js, guide-draft.mjs, setup-guide.mjs and setup-guide-recovery.mjs passed. Checks cover interrupted questions, returning from review to camera choice, retained Spanish, unchanged active settings, apply/cancel cleanup, other-person isolation, invalid/incomplete draft rejection and storage-failure feedback. Session restoration after closing/reopening the browser depends on browser behavior; no cross-session recovery guarantee is made.

## Interrupted first-time setup returns to Welcome

Opening Welcome no longer immediately marks it dismissed. Reloading while reading it or before applying the first guide returns to Welcome in the saved language. Deliberately closing Welcome, choosing touch, or successfully saving guided setup avoids repeating it on subsequent loads. Existing dismissal markers remain respected.

Evidence: production build, welcome-recovery.mjs and welcome-languages.mjs passed. Tests interrupt both welcome and guide, verify Spanish survives reload, and distinguish unfinished onboarding from touch entry and applied guide settings. This change does not restore partially answered guide questions; only saved language and applied settings persist.

## Language choice on the first screen

Welcome now offers six native-script language buttons before its introduction. The title, introduction, setup guidance, privacy/offline explanation and action buttons translate immediately. The selected choice has visible and aria-pressed state. Language changes save before applying; touch entry likewise does not silently apply a rejected change from another input mode. Choosing touch when it is already active remains possible when storage is unavailable.

Evidence: production build, welcome-languages.mjs and setup-guide.mjs passed. Browser checks cover all languages at 390px, accessibility rules, guide-language handoff, persistence and failed-save behavior. Existing guide input/practice routing remains green. Translation fluency and first-use comprehension with intended users remain unverified.

## Movement-meter feedback in six languages

Motion setup now translates its initial and live movement/threshold reading. The meter has a localized accessible name and matching aria-valuetext, making the threshold comparison available to assistive technology without adding a rapidly repeating live announcement.

Evidence: the full unit suite passed 77 tests before this change; the production build and motion-meter-languages.mjs passed afterward. Six browser contexts use generated changing video and check the initial accessible reading, live measurement and synchronization after a threshold change. Actual screen-reader announcements, physical cameras and fluent-language review remain unverified.

## Camera startup can be cancelled and retried

Stopping a pending camera startup now re-enables Start immediately. The setup handler checks the camera attempt's generation before changing controls or preview placement, so an obsolete permission result cannot unlock a newer pending attempt or change its preview. Existing camera-layer generation checks release obsolete streams and ignore stale errors.

Evidence: production build, camera-start-cancel.mjs and calibration-readiness.mjs passed. Controlled browser permission promises verify Stop/retry, late old permission grant with stream release, continued gating of the new request, successful newest startup and ignored late rejection after Stop. Real browser permission-dialog behavior still requires physical-device testing.

## Calibration controls reflect camera readiness

Hand/motion calibration starts disabled until the camera is running. Motion baseline collection disables the button until it finishes, preventing repeated selections from restarting the sampling window. Stopping the camera disables calibration again. Availability updates immediately after a calibration action and through the existing tracking-state refresh.

Evidence: production build, calibration-readiness.mjs and motion-calibration-recovery.mjs passed. The readiness test holds the camera permission request pending, then releases a generated stream and verifies each control transition through sampling and stop. Failed-save recovery and recalibration remain green. Physical camera startup and input-device operation remain unverified.

## Motion calibration commits before enabling selection

Motion calibration now asks the app to save its threshold before marking the input ready. A rejected write leaves the previous threshold intact, clears readiness and reports the localized save failure; the existing calibration button can be tried again after recovery. Successful values are rounded to the control's 0.5 step so stored, active and displayed thresholds agree. Programmatic control updates refresh their display without writing a second time.

Evidence: production build, three motion-calibration unit tests, motion-calibration-recovery.mjs and input-save-recovery.mjs passed. The browser recovery test waits for a generated camera stream, rejects profile writes during calibration, checks disabled scanning/practice and unchanged threshold, then recalibrates successfully and checks output/persistence after reload. Physical movement detection and the suitability of thresholds remain unverified.

## Pause screen isolates keyboard focus

Full pause now opens a native modal dialog instead of a visual overlay. Resume receives focus, controls behind the pause screen cannot receive focus, and resuming returns focus to Pause. The status heading is localized in all six languages. Escape explicitly suppresses the native cancel default when toggling pause, preventing one keypress from opening and immediately closing the dialog. Full pause still stops camera/scanning; the separate rest workflow retains its existing behavior.

Evidence: production build, pause.mjs and rest.mjs passed. Six-language browser checks verify modal focus isolation, Enter resume, Escape toggle, message retention, 320x568 bounds and accessibility rules. Existing dwell rest/resume, switch scanning restoration and deliberate full-stop restart checks remain green. This does not establish camera-only resumption after full stop; that still needs another available input or helper.

## Reachable eye setup on short and landscape screens

Layout inspection found the eye heading overlapping Cancel at 320x568 and the calibration start button clipped at 844x390. Non-collecting eye setup now uses an independently scrollable content area with fixed, localized Up/Down buttons. Cancel remains outside the scroller. The scrolling controls hide during target collection, preserving the existing calibration layout.

Evidence: production build, eye-layout.mjs, eye-control-languages.mjs and eye-forgiving.mjs passed. Twelve browser contexts cover six languages at both short sizes; hit testing verifies fixed controls, reaching manual pace and Start through scroll buttons, returning to the heading and cancellation. Inspected artifacts/eye-landscape-ar.png. Simulated calibration still preserves visibility-loss progress, breaks and failed-target retry. Physical phone use and independent camera-only setup remain unverified.

## Large eye-calibration pace choices

The native pace dropdown is replaced by three directly selectable buttons for gentle, extra time and helper-paced collection. The chosen pace has visible contrast and aria-pressed state. Choices share the existing localized group heading and hide during collection, then return after a failed check. Each button has a minimum 48px height.

Evidence: production build, six-language eye-control-languages.mjs, eye-recovery-language.test.js and eye-forgiving.mjs passed. Browser checks select all three choices, verify exactly one pressed state and viewport fit at 390x844. The complete simulated calibration selects the manual button and verifies delayed collection, prolonged visibility loss, breaks, redo and failed-target retry. These buttons improve direct pointer/touch and helper access; independent camera-only setup before calibration is not established.

## Eye-entry instructions in six languages

The input-settings eye panel now translates its full setup, privacy and access guidance, including helper pacing, breaks, recalibration and the four-tile/minimum-dwell behavior. It no longer gives a fixed model-download estimate or implies that looking at dots is sufficient for every person. The initial/stopped main-board eye hint uses the selected language instead of an English literal.

Evidence: production build, expanded eye-control-languages.mjs and eye-entry-recovery.mjs passed. Browser checks cover all three entry paragraphs, camera-off board hints, narrow dialog geometry and existing error/cancel/fallback behavior in six languages. Storage-failure entry recovery remains green. Translations still need fluent-speaker review; physical gaze reliability remains unverified.

## Localized eye-tracker failures and live guidance

EyeInput now uses six-language messages for failed accuracy checks, unsuccessful model fitting, screen-size changes, head-position/visibility pauses, out-of-board gaze, dwell instructions, camera exceptions and stalled frames. Model-fitting exceptions are presented as understandable calibration guidance instead of raw internal error text. Failure summaries preserve the passed-target count and the option to retry difficult targets.

Evidence: production build, eye-recovery-language.test.js and a complete Arabic eye-forgiving.mjs run passed. Controlled six-language tests verify camera/resize failures clear selection, failed checks preserve retry indices and insufficient training data produces localized recovery. The simulated browser run verifies a three-of-four summary and successful retry of only the failed target. Live drift/outside guidance was changed in source but not physically exercised. Main-app camera-off text and longer eye-entry instructions remain localization work; physical gaze reliability and fluent-language review remain unverified.

## Localized eye-calibration progress

Training and validation target instructions, collection percentages, settling countdowns, helper-ready guidance, eye-visibility pauses and successful completion feedback now use the selected language. The completion screen retains the translated reminder that passing setup does not guarantee accuracy. Calibration thresholds and selection gating are unchanged.

Evidence: production build and eye-control-languages.mjs passed. eye-forgiving.mjs now accepts EYE_LANGUAGE and passed complete English and Arabic runs with simulated landmarks: prolonged eye loss preserves progress, manual pacing and break/resume work, a failed check remains gated, and retrying only that target enables the board after success. Screenshots are artifacts/eye-forgiving-en.png and artifacts/eye-forgiving-ar.png. Other languages have control/error browser coverage but not complete calibration runs. Detailed failed-check summaries, live board tracking diagnostics and entry-panel paragraphs remain localization gaps; physical accuracy and fluent-speaker review remain unverified.

## Eye shortcut preserves working access when saving fails

The eye-control shortcut now saves a changed input choice before stopping the current camera or opening eye setup. A rejected save restores the previous mode and leaves the existing communication screen and camera running. Reopening setup when eye control is already selected does not require an unnecessary preference write.

Evidence: production build, eye-entry-recovery.mjs and eye-entry.mjs passed. A generated live camera stream remains live after an injected storage failure; a later unrelated save retains the original mode. Successful retry stops the old stream once, saves eye mode and survives reload. Existing eye setup remains reachable with writes rejected. Direct entry, narrow layout and offline entry regression checks passed. This verifies browser lifecycle and storage behavior, not physical camera accuracy.

## Eye setup controls and startup recovery in six languages

The eye setup entry, calibration buttons, pacing choices, positioning guidance, loading/ready feedback and break message now use the selected language. The calibration dialog declares its language and text direction. Denied permission and a missing camera have distinct localized messages; other startup failures retain the first-model-download guidance and offer another input method without assuming touch is usable.

Evidence: production build, three language unit tests, eye-control-languages.mjs and eye-forgiving.mjs passed. The new browser checks exercise all six languages at 390px, button and Escape cancellation, denied/missing/startup failures, hidden activation before calibration, and return to touch communication. Simulated landmarks verify retained progress during visibility loss, helper pacing, break/resume, single-point redo and retry of only a failed accuracy target. Physical gaze accuracy and fluent-language review remain unverified. Detailed target/progress diagnostics and the longer entry-panel instructions still require localization.

## Motion calibration requires enough observed frames

Motion-switch stillness calibration now requires at least 20 samples as well as three elapsed seconds before committing its noise threshold. Slow feeds continue collecting instead of passing on elapsed time alone. The existing 95th-percentile calculation and threshold bounds are retained. Instructions in all six languages explain the minimum duration and waiting for samples.

Evidence: production build and five focused camera/calibration unit tests passed. Tests reject one/19 samples even after a long wait, reject sufficient samples before three seconds, accept enough samples afterward and preserve the percentile/bounds. This engineering minimum does not establish clinical suitability or physical low-frame-rate performance.

## Fresh coordinates required after changing fingers

A successful tracked-finger change now clears the previous hand sample, timestamp, resting position, smoothing and pointer/marker feedback. Calibration cannot immediately reuse the old finger's coordinates. A missing-hand detection also clears its sample while preserving the established resting position, so a brief loss does not itself force recalibration.

Evidence: production build, three camera-calibration-language tests and input-save-recovery.mjs passed. Controlled samples verify rejection before fresh data, use of the new sample and preservation of resting position across loss. The existing browser save-recovery test confirms failed finger changes remain unapplied and successful controls persist. Physical tracking accuracy and a real hand-loss/reacquisition session remain unverified.

## Hand and motion calibration status localization

Hand-tracker preparation, positioning prompts, missing-hand feedback, resting-position confirmation, the three-second stillness instruction and calibration completion now use the selected language. CameraInput's status callbacks now use localized keys throughout; eye tracking is a separate component and remains a localization gap.

Evidence: production build, camera-calibration-language.test.js and camera-error-languages.mjs passed. Calibration methods are exercised with controlled fresh/stale hand coordinates and all six languages, verifying unchanged missing/stale rejection and the three-second motion deadline. Browser failure/retry/fallback checks remain green. This is not physical calibration accuracy or fluent-language validation.

## Localized camera permission and failure recovery

The hand/motion camera layer now translates permission requests, permission denial, missing camera, generic startup failure, tracking exceptions and stalled frames. A missing device is distinguished from denied permission. Messages offer another input method without assuming it is physically usable for every person.

Evidence: production build, camera-error-languages.mjs and setup.mjs passed. Six contexts inject browser denied/missing/unreadable errors, verify distinct localized feedback and enabled retry, keep unavailable practice gated and successfully select Yes using touch afterward. Existing setup import/export and narrow accessibility checks passed. Actual camera errors and frame-stall transitions still need device testing; calibration progress and eye diagnostics remain localization work.

## Camera positioning and practice instructions in six languages

Hand and motion setup now localize positioning steps, practice instructions, movement-area label and individual-testing guidance. Hand instructions point to large setup scroll buttons and no longer give a fixed camera-download estimate. The input dialog heading now uses the selected language as well.

Evidence: production build and expanded camera-control-languages.mjs passed across six phone-width contexts. Checked rendered hand/motion paragraphs, controls and geometry; inspected artifacts/camera-instructions-ar.png, which exposed the remaining English heading and prompted its correction. Tracker-generated errors and eye calibration diagnostics still need localization; no physical tracking or fluent-language validation is claimed.

## Localized camera setup buttons and basic feedback

Camera start/stop, resting-position and stillness-calibration controls now use all six interface languages. The camera-off placeholder, initial privacy message, local-running message and finger-change reminder are also localized. Device/tracker-generated diagnostics and the longer positioning instructions remain separate work.

Evidence: production build, camera-control-languages.mjs and input-adjustments.mjs passed. Six phone-width contexts verify hand/motion control labels, finger-change and stop feedback without starting a camera. Existing adjustment, dwell, switch and accessibility checks passed. No physical camera or pronunciation validation is claimed.

## Practice adjustments preserve results when saving fails

The results screen's slower-selection shortcut now saves dwell and scan timing together before navigating away. The larger-tile shortcut likewise closes only after a successful save. A rejected adjustment keeps the measured results and current settings available for retry, avoiding a repeated practice trial.

Evidence: production build and practice-save-recovery.mjs passed. The browser test completes the four-target/rest trial, rejects both adjustment saves, checks unchanged results/settings, then retries slower selection and verifies both timings increase once and survive reload. Rejected larger layout is not included in a later save.

## Screen-awake feedback on the communication board

The input area now displays screen-awake status while the session option is requested or a lock remains held. System-release/failure feedback is visible without reopening setup. Turning the option off hides the status; changing language updates it. Layout overflow detection updates when the status changes.

Evidence: production build and screen-awake-board.mjs passed at 320, 390, 768 and 1280px, including opt-in, system-release feedback, Arabic language change and opt-out. Inspected artifacts/screen-awake-board-ar.png. Wake-lock events are instrumented; actual display dimming remains unverified.

## Wake-lock release results cannot overwrite newer requests

Screen-awake release completions now check request identity before updating status. A late successful or rejected release cannot replace the status of a newly acquired wake lock. Six screen-awake unit tests and the production build passed, including controlled out-of-order release completion and rejection. These tests cover asynchronous ownership rather than physical device behavior.

## Optional screen-awake control

Set up now includes Keep screen awake and Allow screen to sleep, with six-language status and explanation. It is session-only and off initially. Hidden tabs release the wake lock and returning can reacquire it while requested; page exit cancels the request. A system release or rejection remains visible in setup and can be retried deliberately. Late pending requests are released after cancellation. No extension or additional library is used.

Evidence: production build, four screen-awake unit tests and screen-awake.mjs passed. Unit checks cover request cancellation, visibility transitions, system release, denial and unsupported APIs. Browser checks use an instrumented wake-lock API to verify actual controls, reopen state, retry/release, no reload opt-in and narrow accessibility. Physical display dimming, battery behavior and mobile-browser support remain unverified. Implementation reference: [MDN Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).

## Localized live hand guidance

The main hand-pointer hint now uses six-language text for camera off, resting-position needed, hand missing and active crosshair guidance. Motion scanning's selection prompt and initial input hints also use localized strings. Tracking logic is unchanged.

Evidence: production build and the expanded input-languages.mjs passed. The six browser contexts now also switch to hand mode without starting a camera and wait for the localized camera-off instruction. Live camera/origin/hand-loss transitions were inspected in source but not exercised with physical tracking. Detailed camera setup and eye diagnostics remain incomplete localization areas.

## Localized input-method explanations

Input setup's introduction and all six method descriptions now support the six interface languages. Camera method descriptions explicitly retain experimental status. The main Start scanning / Stop scanning control now uses existing localized labels.

Evidence: production build and input-languages.mjs passed. Six browser contexts check nonempty translated descriptions, actual start/stop label changes and nonoverflowing input dialogs at 390px. The initial test incorrectly required more than 20 characters per description, which rejected concise Chinese text; the corrected assertion checks actual text rather than an English-oriented length threshold. Detailed camera instructions and dynamic tracking hints remain separate localization work; translation quality still needs fluent-user review.

## Shared save errors in six languages

The shared settings-save failure notice now has English, Mandarin, Hindi, Spanish, Arabic and Thai text. It uses the currently displayed interface language rather than a tentative unsaved language setting. Existing specialized draft/setup failure feedback remains available alongside this shared notice.

Evidence: production build and save-error-languages.mjs passed. Six fresh browser contexts choose each interface language, reject a subsequent language-change write, check the translated error and confirm the saved/displayed language remains unchanged. The text requires fluent-user review before claiming native-language quality.

## Message downloads through alternative input

composer-download-access.mjs passed for dwell and switch scanning in desktop Edge. After helper-driven setup and text entry, each test activates Download message through the selected input, checks exact file contents, retains the draft and verifies no repeat download while waiting. The switch test uses Space; the dwell test uses a synthetic pointer. This is not a physical-camera, hardware-switch or mobile file-picker trial.

Composer instructions in all six languages now ask users to check the draft status before closing/reloading instead of promising unconditional persistence. They describe Speak now as committing the message, without implying optional spoken scan previews are silent.

## Portable plain-text messages

The main composer offers Download message, producing reach-message.txt with only the current draft. The control and explanation support all six interface languages; empty messages cannot be downloaded. This uses a local browser download without saving a personal phrase or sending the message to another person. A download-start error preserves the draft and displays feedback.

Evidence: production build, composer-download.mjs and composer.mjs passed. The download test rejects browser profile writes, downloads the unsaved message, reads the resulting file and verifies exact Arabic/English/Thai/emoji text and line breaks. Simulated download creation failure preserves text. Existing Arabic accessibility, composition and dwell checks passed. Actual mobile file-picker and camera/switch-triggered download behavior remain unverified.

## Bilingual preferences commit before changing communication

Partner-display and spoken-language choices now save before stopping output or updating the board. Rejected writes leave the current language selection, displayed translation and speech configuration unchanged. Retrying remains available in the same panel.

Evidence: production build, partner-recovery.mjs and partner.mjs passed. The recovery test checks rejected Arabic partner/Spanish speech choices against saved state, live display, cancellation calls and subsequent English utterance language, then verifies successful retries after reload. The existing independent-language, missing-translation, partner-speech, accessibility and responsive checks passed. Speech evidence uses an instrumented browser API, not listening verification.

## Explicit composer draft persistence

The main composer now reports whether its latest draft was saved on the device. A rejected write shows a localized persistent warning to keep the page open and enables a large Retry saving draft control. Retrying preserves the text and disables the retry control after success. Embedded phrase-text editors do not claim independent draft persistence.

Evidence: production build, composer-draft-recovery.mjs and composer.mjs passed. The browser test verifies the old stored draft is unchanged during failure, the new text remains editable, explicit retry succeeds without retyping and reload restores it. Existing composition, Arabic accessibility, voice-language and dwell checks passed. Clearing browser data still removes local drafts.

## Composed phrases do not leak into later saves

Saving a composed message to My phrases now rolls back the phrase-list mutation on failure. Previously, the next automatic draft save could persist the rejected phrase. The composer shows a localized persistent failure message while retaining the speakable draft; successful retry replaces the error with saved confirmation.

Evidence: production build, composer-save-recovery.mjs and composer.mjs passed. A single rejected profile write followed by successful automatic draft writes leaves the phrase library unchanged. The message can still be spoken through the instrumented API; explicit retry creates one phrase and survives reload. Existing composition, undo, Arabic phrase saving, voice-language selection and dwell checks passed.

## Guided setup preserves access on save failure

Find my setup now saves the reviewed settings before stopping existing input or speech. A rejected save leaves the current access method and the reviewed answers available. A persistent error in the chosen setup language offers retry or keeping the current setup; repeated failures do not duplicate the error. Successful retry follows the existing practice/calibration route.

Evidence: production build, setup-guide-recovery.mjs and setup-guide.mjs passed. The recovery test starts a switch scan, reviews Spanish touch/larger-tile choices, rejects saving, checks unchanged saved/live settings and continuing scan highlights, then verifies retry enters practice with the chosen answers. Existing first-run, cancellation, RTL, camera-gating, helper, dwell and responsive checks passed. Physical camera continuity was not tested.

## Phrase-pack and quick-entry draft recovery

Applying an edited phrase pack now changes the saved board and closes the editor only after storage accepts the update. A failed apply keeps the arrangement open for retry or discard and preserves the existing communication board. The quick phrase-entry form likewise keeps typed text and translations on a failed save; repeated failed submissions do not add hidden in-memory phrases or later duplicates.

Evidence: production build, phrase-save-recovery.mjs and packs.mjs passed. Browser checks cover rejected pack apply, successful retry, failed restore followed by discard, repeated rejected phrase submissions, multilingual draft retention, exactly one saved phrase after retry and reload persistence. Existing stable-position, separate-preset and Arabic accessibility checks also passed.

## Board preferences recover from rejected saves

Quick setup now commits language, phrase preset and review-before-speaking changes before changing the board. Advanced settings restore the original native values and matching large-button states when language, layout, preset, speech or contrast cannot be saved. Failed language/preset changes do not navigate or reset the board; failed speech changes do not stop existing output.

Evidence: production build and preference-recovery.mjs passed. Forced profile-write failures preserve quick selections, advanced native/button states and persisted setup; successful language/preset/review retries survive reload. This addresses these preference controls, not every remaining save path in the application.

## Input settings recover from rejected saves

Input setup now restores previous values after failed saves for mode, dwell/scan timing, scan-audio enablement, movement gain, finger choice and motion threshold. Preview speed already had this protection. Native controls, step buttons and selected-finger indicators stay synchronized. Mode changes stop active input only after saving succeeds; finger/threshold calibration state is reset only after a successful change.

Evidence: production build, input-save-recovery.mjs and scan-audio-speed.mjs passed. The browser test rejects canonical profile writes, checks unchanged settings and controls across touch/hand/motion setup, restores writes and verifies retries survive reload. Camera tracking itself is not exercised by this storage-failure test.

## Preview voice trial during setup

Change input now includes localized Try preview voice and Stop preview controls. An explicit sample uses the selected preview rate without enabling automatic scanning prompts or committing a message. Setup status remains visible when scanning is off. The trial respects the speech preference, matching-local-voice requirement and existing message playback. The timeout now runs even without an active scan, so a stalled setup trial is bounded; closing setup cancels output.

Evidence: production build, scan-audio-try.mjs and the existing scan-audio.mjs regression passed. Instrumented browser checks cover sample content/rate, no automatic opt-in, unchanged message, explicit stop, missing voice, a real 20-second stalled trial and cleanup on close. Existing scan timing, speech selection and narrow accessibility checks passed. This does not verify audible output or native-language pronunciation.

## Adjustable auditory preview speed

Change input now offers a localized scan-preview speed control with large Decrease/Increase buttons. The 0.5–1.5 rate is saved per person and included in setup data; old settings retain the previous 0.95 default. Changes affect subsequent preview utterances, leaving scan selection time and committed message speech unchanged. Failed saves restore the previous speed. The shared adjustment controls provide boundary disabling and participate in normal accessible selection.

Evidence: production build, four scan-audio unit tests, scan-audio-speed.mjs and scan-audio.mjs passed. Browser checks verify button adjustment, reload persistence, the rate passed to the speech API, lower-bound disabling, existing playback holds, message selection, missing voices and narrow-screen accessibility. Actual listening and comfortable rates for intended users remain unverified.

## Printing suspends communication input

The print lifecycle now cancels active output and resets selection state before rendering the paper board. Animation-frame input processing and switch selection are gated while printing. Capture-phase keyboard and click guards also suppress native button activation and navigation underneath print preview. Returning from print restores the board with fresh selection timing; the previously running scan remains available.

Evidence: production build, print-input.mjs and photo-print.mjs passed. The initial dwell test exposed Space activating a focused setup button while printing; the capture guards fix that path. Browser tests dispatch print lifecycle events, hold a pointer, press Space/Enter/Escape and click phrase/setup controls during print, verify no utterance/message change, open dialog or active selection highlight, and verify both switch and dwell input work after return. The photo/Arabic print regression passes. Native print-dialog and physical camera/switch behavior still require device testing.

## Printed photo fallback and partner instructions

Printed board partner instructions now use the selected interface language instead of fixed English. Personal photos remain visible with their phrase labels in the full selected pack, and interactive controls return after printing.

Evidence: production build and photo-print.mjs passed. The test creates a synthetic photo, verifies decoded/visible print imagery, all selected pack positions, Arabic instructions, hidden interaction dock during printing and restored controls afterward. Generated artifacts/photo-board-ar.pdf and inspected the print-media screenshot. This is browser/PDF verification, not a physical-printer or bedside readability trial.

## Overlapping setup imports

Each setup-file selection now invalidates earlier pending reads in that settings session. An older file cannot apply while the latest file is reading, and rejection of the latest file does not revive an older selection. Superseded errors also cannot overwrite the current result message.

Evidence: production build, setup-import-order.mjs and setup-import-recovery.mjs passed. Controlled file-read completion order verifies the old file finishing first, latest-file application and an invalid latest file preserving the existing setup. Recovery regression still verifies write rollback, same-file retry, abandoned reads and photo restoration.

## Setup import rollback and photo restoration

Fixed setup import's false-success path: a rejected profile write now restores the previous in-memory settings, retains persisted settings and leaves the save-failure message visible. The file field resets so the same backup can be retried. Imports are applied only while the originating settings screen and person remain current; closing setup invalidates a pending read. Successful import stops output/input only after the settings commit succeeds.

Evidence: production build, setup-import-recovery.mjs and profiles.mjs passed. Forced storage failure verifies equality of live exported and persisted settings, followed by successful same-file retry. A delayed read is ignored after closing setup. An actual exported photo backup restores and decodes in a fresh browser context. Cross-device physical restoration and maximum-quota scenarios remain unverified.

## Photo processing cancellation and failed-save recovery

Added a six-language, large-target Cancel photo processing control. Cancellation invalidates the pending result, clears the pending file selection and re-enables saving while preserving draft text and the previous photo. The underlying browser decode may finish later, but cannot update a cancelled or closed editor.

Evidence: production build, photo-recovery.mjs and phrase-photo.mjs passed. Controlled decode delays verify cancellation and closed-editor late completion without runtime errors. Forced storage failure verifies retained draft photo, no premature persisted phrase and successful retry. Photo processing remains device/browser dependent; physical access and real-photo quality are not established by these tests.

## Personal photo phrase buttons

Added local photo selection and removal to phrase drafts, bounded image decoding/resizing, small JPEG storage in profiles/backups, board/eye-board display and OBF photo embedding without relicensing user content. Existing symbols remain the choice when no photo is attached. Failed image replacement preserves the previous draft image; late processing results are ignored after editor replacement. Setup import size now allows 8 MB to accommodate embedded copies. Storage quotas remain a constraint.

Evidence: build, 62 unit tests, phrase-photo.mjs, phrase-create.mjs and board-export.mjs passed. Photo checks use synthetic imagery to verify resize, proportions, invalid replacement, discard, save and reload. Export tests retain existing media/attribution checks; unit coverage verifies private JPEG embedding. Screenshot inspected. Original photos are not retained, native file selection may need a helper, and real-photo recognition/quality plus physical-device coverage remain unverified.

## Symbol picker access verification

Returning from symbol selection or cancellation now restores focus to Choose a symbol and brings it into view while retaining the phrase draft. This avoids losing keyboard position when the picker replaces the editor content.

Evidence: production build, phrase-symbols.mjs and symbol-access.mjs passed. The access test uses actual app dwell and scanning logic with simulated pointer/Space input to navigate two symbol pages and choose Drink, verifies focus return and unchanged phrase text, and confirms no save occurred. The preceding navigation to the editor is assisted in this test. Physical switches, camera users and symbol recognition are not verified.

## Personal phrase symbols

Added a paged, labeled symbol picker with 12 existing Lucide symbols and six-language labels to personal phrase creation/editing. Selection is part of the phrase draft; Save commits it and Discard retains the prior phrase. Settings validation preserves allowlisted symbols and replaces unknown names with MessageCircle, so setup transfer no longer strips valid personalized symbols.

Evidence: production build, 61 unit tests, phrase-symbols.mjs and phrase-create.mjs passed. Browser checks cover real SVG rendering, keyboard choice, paging, draft discard, persisted symbol rendering after reload and narrow accessibility; screenshot inspected. Unit checks cover transfer preservation and unknown-name rejection. Personal photos, broader symbol vocabularies and user recognition trials remain outstanding.

## Composer phrase-language consistency

Composer phrase insertion now requires the original or explicit translation to match the draft language. Unavailable translations retain their slots with disabled insertion and a six-language explanation. Phrase and letter buttons carry their content language and automatic direction; scan previews respect button language metadata. Manually typed content is not automatically language-detected or rewritten.

Evidence: build, 60 unit tests, composer-language.mjs and composer.mjs passed. Tests cover blocked fallback insertion, Arabic original and Spanish translation with English interface controls, retained slot, native-language metadata, composition/undo, save, speech and dwell regression. Actual pronunciation and multilingual-user review remain outstanding.

## Personal-phrase scan language

Added actual display-language and automatic direction metadata to main/eye board phrase labels. Auditory scanning now uses the source language for untranslated personal phrases instead of assuming the interface language. Explicit translations retain their own language.

Evidence: production build and scan-audio-languages.mjs passed. The browser test uses an Arabic original under English controls, its explicit Spanish translation under Spanish controls, and missing-Arabic-voice behavior. It verifies preview and committed utterance language, displayed text and direction metadata. Pronunciation and physical access remain unverified.

## Auditory scan status and compact layout

Added six-language status for preview waiting, playing, busy, missing local voice, playback failure and timeout. Status appears in the communication input area and setup; it is hidden when previews are disabled. Compact layouts now retain this status rather than hiding it with secondary input hints.

Evidence: build and 59 unit tests passed. Expanded scan-audio.mjs verifies playing status, hidden disabled state, unavailable-voice output without speech, 390-pixel visibility, no horizontal overflow and automated accessibility. Screenshot inspected. Page layout regressions passed during this change. Status reports software state; actual sound and screen-reader interaction remain unverified.

## Auditory scan timing

Scanning now holds the current target while its preview is active and defers the next advance by the configured scan interval. A user can still select during playback. The hold is bounded at 20 seconds to recover from a speech engine that never reports completion. Stopping input or changing targets continues to cancel only the active preview.

Evidence: production build and 59 unit tests passed. scan-audio.mjs holds a simulated preview beyond the two-second scan interval, verifies the target stays highlighted, ends the prompt and verifies time remains to select. Unit coverage verifies completion release and the stalled-voice limit. Speech events are simulated; audible pacing and suitability for real users remain unverified.

## Optional auditory scan previews

Added per-person, opt-in scan audio with a six-language setting and “Option” prefix. Previews use local device voices, leave the communication message untouched, stop when targets change or input stops, and do not replace committed speech. Recording/audio-backup dialogs suppress prompts. Existing scan timing controls prompt duration; separate output routing and automatic timing adaptation are not implemented.

Evidence: 58 unit tests, production build and scan-audio.mjs passed. Tests cover preview cancellation ownership, no matching voice, protection of committed speech, strict boolean backup validation, real app scanning with instrumented speech, deliberate selection, stop and preference reload. Actual audible distinction, native-speaker quality and real-user effort remain unverified; R18 is not complete.

## Recoverable board storage and file failures

Fixed cached rejected IndexedDB openings so a synchronous browser refusal can be retried on the same library instance. Retry cleanup only resets the matching attempt; an older failure cannot clear a newer opening. The library offers a retry control on load failure. File, save and other storage failures now have six-language guidance with expandable original diagnostics. Failed saves retain the reviewed file and re-enable Save; existing records are not cleared.

Evidence: production build, import-recovery.mjs and board-library.mjs passed. Recovery test injects a synchronous first-open refusal, malformed JSON and a failed storage write, then verifies retry without re-upload, prior-board preservation and reload. imported-languages.mjs remains the six-language UI regression. Guidance is localized; low-level diagnostics remain in their original language. Real browser storage policies, physical users and native-speaker review need broader validation.

## Translated import validation guidance

All structured board-review issue codes now map to six-language guidance covering unsupported language/actions/extensions, missing or invalid media, media size, invalid text and text length. Original diagnostics remain available through accessible expandable buttons with English language metadata. Save remains disabled when issues exist; no action or media is silently discarded.

Evidence: production build, 56 unit tests and imported-boards.mjs passed. Expanded imported-languages.mjs checks a blocked action in each interface language, translated explanation, detail expansion/collapse and cancellation without adding a board. Parser exceptions and IndexedDB errors still require localized handling, and translation quality needs native-speaker review.

## Imported-board library and review localization

Translated the library introduction, backup exclusion warning, file prompt, loading/count/empty states, import summary, review-only explanation, unplaced-button disclosure, save/cancel and removal confirmation into six languages. Board names are rendered separately with their source language and automatic text direction. Review entries distinguish source text from translated empty-position labels.

Evidence: production build, imported-boards.mjs and expanded imported-languages.mjs passed. Every interface language exercises review cancellation and removal cancellation while verifying the saved board remains available. Detailed parser validation issues and storage failures remain English; native-speaker review remains required before claiming complete localization.

## Imported-board interface languages

Viewer instructions, empty/image-error labels, paging, Speak/Stop/Help, title and library action labels now support en/zh/hi/es/ar/th. Imported labels and speech remain in the board's source language. Grid direction follows that source language, preventing an Arabic interface from reversing an English board. Page counts remain ordered current/total.

Evidence: production build, imported-boards.mjs and imported-languages.mjs passed. The latter exercises all six UI languages around the same English board, checks original English speech routing, narrow overflow and Arabic automated accessibility. Screenshot inspection found and led to fixes for reversed counters and choice direction. Detailed import/storage/confirmation errors still need localization; native-speaker quality review is outstanding.

## Imported-board access continuity

Selecting an imported phrase now updates the existing tiles and message preview instead of rebuilding the page. This retains keyboard focus, scan-target identity and loaded images. The reviewed message carries the original board language for assistive technology.

Evidence: production build, imported-boards.mjs and imported-access.mjs passed. The latter uses real application dwell and scanning logic with synthetic pointer/Space input to open a board, select without speech, speak once, move pages, select another message and return. It verifies the selected tile remains connected. Keyboard Enter retains focus in the standard browser test. Switch tests observe the existing 1.8-second repeat guard; they do not validate faster activation or physical hardware. A reload assertion now waits for the asynchronous board list before checking persistence.

The active objective is to make Reach the best free tool for its intended care and family communication users. That claim remains unproven. The requirements in MARKET-SWOT-AND-REQUIREMENTS.md are the working roadmap; passing synthetic tests is not a substitute for comparative and real-person usability evidence.

## 2026-09-13: correction and speech review

Implemented R03's initial communication repair workflow: six-language Stop speaking, Wrong selection, Please wait and Not sure controls; optional preview followed by explicit Speak now; immediate correction/help exceptions explained in setup; Clear cancels pending/current speech; backup validation preserves review preference. Controls participate in eye/dwell/switch target selection and remain above the navigation dock on scrolling boards.

Evidence: 14 unit tests and production build pass. tests/communication.mjs covers instrumented speech sequencing, no speech before confirmation, correction/help exceptions, cancellation, persistence and single activation per dwell. tests/eye.mjs now exercises correction and waiting with simulated landmarks. Real-person eye accuracy and actual audio remain unverified.

## Next implementation work

1. R07: real-person trials, physical-device coverage and comparative task-performance evidence remain missing. Synthetic camera and generated-audio checks do not prove suitability or market leadership.
2. R12: single-board OBF export and import are implemented. OBZ import, multi-board export and a complete verified round trip through another AAC app remain unfinished. Reach setup and audio backups remain separate Reach-specific formats; imported originals must be downloaded separately.
3. R13/R14: complete hands-free text editing and real external accessibility device validation remain unfinished. Local phrase draft editing is now available.
4. R01–R06 and R08–R11 have substantial initial implementations documented below; native-speaker review, device-specific limitations and real-user recovery/communication trials still matter. Later remote communication and optional AI work remain separate roadmap items.

Do not describe this first improvement as completion of the market-leadership objective. Compare actual task performance and accessibility with relevant free alternatives before making that claim.

## 2026-09-13: paged communication verification

16 unit tests pass. Production build passes. pages.mjs verifies every preset phrase in order, viewport fit at 1280×900, 390×844 and 320×640, short-landscape fallback, complete print output, and one page per dwell visit. Browser, setup, navigation, simulated hand-pointer and communication-control regression suites passed after adapting expectations to paginated vocabulary and the Topics menu. Arabic accessibility checks pass. No real camera user or physical mobile device has been tested.

Next priority is R04: improve rest/resume and recovery without silently restarting cameras or depending on touch. The compact layout also needs clearer visible camera-state feedback as part of that work.

## 2026-09-13: rest and camera continuity

Implemented an explicit Take a break action, keeping existing camera/calibration while permitting only rest-screen controls. Full camera-off/pause stays separate. Resume and Escape restore previous scanning state. Six-language rest instructions and visible tracking status are present. Navigation-release protection prevents falling through Resume into a phrase.

Testing exposed and fixed video detachment when replacing setup content: active hand/motion video now stays attached outside replaceable panels, and returns to the setup preview when needed. Full stop removes the video and stops tracks. An asynchronous camera start also parks the video if setup was closed during loading. Fixed the switch selection pad overlapping phone controls.

Evidence: rest.mjs passes dwell, switch, Escape, full stop and accessibility checks. Extended pointer.mjs passes finger-only rest/resume and subsequent page/setup use. Extended eye.mjs passes eye-only rest/resume without recalibration, correction, tracking loss and failed-calibration gates. These use generated video/landmarks, not people. Pages and communication regression checks continue to apply.

Next: R01 ability-led input practice and R05 editable stable phrase packs. Complete loss of a user's only available signal still requires recovery of that signal, an alternate input, or assistance; no software should claim otherwise. R04 remains subject to real-user fatigue/recovery trials.

## 2026-09-13: editable phrase packs

R05 initial implementation: per-setting draft editors, replacement in numbered positions, empty positions that preserve subsequent positions, protected Yes/No, explicit save/discard, and restoration of the original pack as a draft. Built-in, personal and repair messages are selectable. Added up to 60 pack positions and expanded personal messages from 24 to 200. Eye priority pages preserve empty positions. Remaining vocabulary stays available elsewhere.

Fixed personal IDs being regenerated during settings validation; IDs now survive reload and JSON backup/import. Invalid or deleted pack references become empty positions, never another person's/message's content. Import accepts up to 2 MB to accommodate the enlarged library. Existing saved settings without packs retain original defaults.

Evidence: 20 unit tests pass, including stable-ID round trips, invalid references, deletion without shifting and expanded library bounds. packs.mjs passes draft isolation, saved replacement/hiding, reload, restoration/discard, personal references, appended repair message, separate profiles and Arabic accessibility. Pages and setup regressions pass. Browser and communication regressions are run for this change. No comparative market-leadership claim is established.

Next implementation priority: R01 guided input practice that measures intentional selections and false activations without treating it as a diagnostic assessment, followed by structured care communication and user-authored sentences.

## 2026-09-13: guided input practice

Added Set up → Try your input in all six languages. Four numbered target requests have no deadline; a subsequent ten-second active-window rest counts target activations and tracks camera signal availability separately. No trial speaks communication phrases. Results disclose missing signal, offer an assistance flag, and explicitly avoid a reliability/clinical pass claim. Slower timing, larger tiles and input changes require deliberate user selection. Closing restores prior scanning and leaves messages/phrases unchanged.

Results are ephemeral. Keyboard/touch availability is application availability, not proof of physical switch connection. This is an initial R01 practice tool; broader ability-led guidance and real-user evidence are still outstanding.

Evidence: 23 unit tests pass, including phase transitions, wrong-target counting, missing signal, focus pause and frame-stall handling. practice.mjs covers touch/dwell practice, result counts, camera setup gating, assistance disclosure, accessibility, preserved messages and explicit timing changes; switch selection and restoration are included. Existing pack/rest/browser regressions were run. Next substantial feature is structured care-message composition and unrestricted user-authored communication.

## 2026-09-13: message composer

Added Write a message with phrase composition, four-choice grouped character selection, device text entry, Unicode-aware deletion, 40-edit undo, explicit Speak/Stop, and Save to My phrases. Drafts autosave locally across reloads, separately from personal phrase backups. Personal messages now support 500 code points; source language survives import so a native-language message does not acquire an English voice when the interface changes. Duplicate saves are prevented; persistence failure is not reported as success.

Group keyboards cover English/Spanish Latin, Arabic, Hindi and Thai characters. Chinese phrase composition works, but new Chinese text still requires a device IME; a browser-native Pinyin input remains a gap. Letter entry appends at the end; native text editing supports cursor movement. This is not complete support for all languages or optimized communication speed.

Evidence: 27 unit tests pass. Composer browser tests cover phrase/letter composition, undo, explicit speech/cancellation, draft reload, source-language voice selection, duplicate saves, Arabic accessibility and single dwell activation. Page, pack, rest and main browser regressions pass. Speech is instrumented, not human-listened. Next: structured care-message details and improved cross-language partner display, alongside remaining market roadmap requirements.
## 2026-09-13: independent partner display and speech languages

R10 initial implementation: separate board, partner display and spoken-language preferences; large partner view; deliberate partner-language speech; no-second-language option; six-language preference labels. All controls participate in the existing scanning/dwell target system. Opening partner view does not trigger speech. Missing translations are disclosed, never inferred from a native-language fallback field. JSON validation preserves supported preferences and rejects invalid values.

Evidence: 29 unit tests pass. Partner browser checks pass independent English/Arabic/Spanish behavior, explicit partner speech, missing-translation suppression, persistence, accessibility and 320/390/1280px widths. Composer regressions pass. Speech routing is instrumented; actual audio and translation review with speakers remain outstanding. Page and main browser regressions also run for this change. Structured care details, interoperability and real-user validation remain unfinished roadmap requirements.
## 2026-09-13: structured discomfort messages

R08 initial implementation: Topics → Describe discomfort offers four sensations, twelve body locations in four-choice pages, optional side/intensity/onset, explicit uncertainty and omission. All-over location clears and skips side. Final review supports individual corrections, deliberate speech, stop and restart. Six authored language variants feed existing voice and partner-display settings. Drafts persist only in memory during the page session; no symptom history is saved. No diagnosis or treatment is generated.

Evidence: 31 unit tests pass, including literal selection-only message construction, omitted details, uncertainty and six-language vocabulary coverage. Care browser checks cover review-before-speech, correction, all-over side removal, session-only draft behavior, Arabic accessibility, dwell release, switch selection and responsive widths. Partner and paged-board regressions run for this release. Actual audio, translation review by native speakers and real-user care communication remain unverified. R08 still needs broader detail options and usability trials; R07 validation and R12 open-format interoperability remain major gaps.
## 2026-09-13: communication handover card

R11 partial implementation: optional, locally saved How I communicate card with name, yes/no signals, wait time, positioning, fallback and notes; draft editing with save/discard; clear-as-draft; independent of care preset. Setup backup validation bounds optional text and preserves the card. Export disclosure now names this content. Print isolates the card from board/dialog UI; downloadable standalone HTML safely escapes user text and needs no scripts, camera, account or network. Labels support six languages, while personal notes remain as entered.

Evidence: 33 unit tests pass. Passport browser tests pass save/discard/clear, literal HTML escaping, reload, independent care presets, standalone download, print isolation/restoration, Arabic accessibility and narrow/desktop widths. A PDF was generated through Edge. Setup and paged-board regressions run. Multiple isolated person profiles, a shared-device reset workflow, input-independent text editing and real-user handover validation remain unfinished R11/R13 work.
## 2026-09-13: multiple local person profiles

R11 expanded: up to twelve local person profiles, separate from home/hospital/family presets. Each preserves settings, stable phrase packs, personal phrases, handover card and composition draft. New profiles start empty. Switching stops speech, camera and scanning, clears selected/temporary care messages, restores only the selected person's draft, and opens setup. Rename and explicit confirmed removal of inactive profiles are available. Active profiles cannot be removed. No password/access-control claim is made.

Existing settings and draft migrate into My profile. A single registry write commits profile changes; failed writes leave the prior stored person active. Compatibility keys mirror the active settings/draft. Stale registry writes are rejected and other tabs reload on changes. Setup export remains per-person and excludes drafts; UI/docs disclose this.

Evidence: 36 unit tests pass, including migration, isolation, quota-failure rollback, stale writes and active-profile deletion protection. Browser profile tests pass independent draft/phrase/language behavior, rename/create/switch/remove, selected-message clearing, actual synthetic video track ending, reload, other-tab refresh, Arabic accessibility and widths. Composer/setup/passport/rest regressions pass; pages and communication regression tests run. Remaining R11 work includes a simpler guest/shared-device reset workflow and real-user verification. This storage change has not been tested across all mobile browsers or storage eviction scenarios.
## 2026-09-13: verified offline readiness

R06 expanded: build-generated file manifest with byte sizes and SHA-256; separate content-versioned board/camera caches; cached camera assets survive app-only releases. Readiness verifies the board and the browser-selected hand/eye runtime/model files, shows missing bytes, and downloads/repairs them without camera permission. Cancellation retains completed files. Footer board status now checks cached files rather than relying solely on a marker.

Voice readiness distinguishes local/online/missing/off settings and requires explicit test playback and user-reported confirmation; it never treats a listed voice as audible verification. Confirmation is ephemeral. Labels cover six languages; translation and actual-device audio remain unverified.

Evidence: 38 unit tests pass. Offline browser tests verify initial missing files, explicit sound confirmation, camera-free preparation, checksum detection/repair of deliberately corrupted model data, offline browser reload, and real MediaPipe hand-model initialization offline using generated video. Generated service-worker activation is tested with a simulated cache store to prove current camera-cache retention and obsolete-cache cleanup. Main browser regressions run. Full airplane-mode trials on physical mobile devices, real hand/eye accuracy, storage-eviction recovery trials and recorded-audio fallback remain incomplete.
## 2026-09-13: recorded speech fallback

R06 initial recorded-audio fallback: explicit microphone recording of phrase translations, 30-second capture limit, preview-before-save controls, IndexedDB storage isolated by person, offline playback in preference to TTS, and exact phrase-text/language matching. Stop/Clear/Pause/rest/profile switch stop both sound systems. Editor close, page hiding and late permission resolution release recording tracks. Device-voice testing bypasses recorded clips. Controls follow the interface language, while recorded text follows spoken-language preference.

Individual clip download/removal is available; setup export disclosure excludes audio. Limits are 2 MB per clip and 100 clips / 10 MB per person. Profile removal cleans up its audio before deleting profile settings. Bulk audio transfer, recording import, independent microphone usability, audio quality and cross-device format testing remain unfinished.

Evidence: 40 unit tests pass, including exact text/language matching and invalid/oversized clip rejection. Browser recording tests use a real MediaRecorder with generated audio and real Audio playback: preview/save, persistence through offline reload, playback stopping, microphone release on editor close, profile isolation, removal and accessibility pass. Profile/offline tests pass; communication regressions run. These tests do not establish intelligibility or human listening quality.
## 2026-09-13: bulk recording backup and restore

Added Recorded speech → Back up recordings. Export includes the current person's clips with exact phrase IDs, language, text, MIME type and encoded audio, excluding person identifiers and other profiles. Imports enforce bounds/type/base64/duplicate validation, preview exact matches and unmatched entries, keep existing clips by default, and require deliberate replacement. Setup must be transferred first for personal phrase IDs/text to match. Individual preview and Stop are available. One IndexedDB transaction imports all chosen clips; synchronous and asynchronous write failures abort the transaction.

Evidence: audio-backup unit tests cover binary/metadata round trips, invalid fields, duplicate keys, exact matching and maximum-size base64 handling. Browser transfer tests create real recorded audio from a generated signal, export it, restore into a separate browser profile, exclude mismatches, preserve existing clips, replace explicitly, reject malformed backups, and play after an offline reload. A forced failure after a staged write proves the original recording is preserved. Recording/profile regressions pass. Cross-device codec compatibility and open AAC format round trips remain unverified; this is Reach's own recording backup format.
## 2026-09-13: ability-led setup guide

R01 expanded with a first-run/reusable Find my setup flow: language, reading preference, supported position, comfortable input, explicit helper selection, review and apply. No changes are committed while answering. Phrases, handover and timing remain intact. Larger/partner-reading choices enlarge targets. Touch/pointer/switch paths enter practice; camera paths enter setup and then practice, with calibration readiness still gating trials. Eye success/cancel routing preserves existing fallback behavior. Position/reading/helper preferences validate through profile import/export.

Evidence: 46 unit tests pass. Guide browser checks cover first-run discovery, uncommitted cancellation, Arabic direction/accessibility, switch practice, missing-camera gate, helper settings, no leaked practice routing, once-per-hover dwell and responsive widths. Setup and practice regressions pass. Full synthetic eye calibration/practice/fallback tests run. Real-person suitability, meaningful symbol support and native-speaker review remain incomplete; no clinical or market-leadership claim is made.
## 2026-09-13: personal phrase draft editing

R13 expanded: saved personal phrases can be edited as drafts, previewed across six languages, saved or discarded. Original language is explicit and English is optional. Retained translations require review; cleared translations are actually removed. Stable IDs and pack positions survive edits. Removal requires confirmation and leaves empty pack positions. Current speech and last selected message are retained while editing; subsequent tile selection uses edited text. Recording text matching prevents edited words from reusing a stale clip.

Evidence: 48 unit tests pass. Editor browser checks cover cancel/save, translation-review gate, native-only source text, escaped preview, stable pack positions, absence of speech-cancel calls during editing, retention of the last selected message, confirmed removal, reload and accessibility. Existing pack regressions pass. The top priority list now reflects current gaps instead of obsolete early tasks. Physical users, native-speaker review and input-independent text entry remain unverified or incomplete.
## 2026-09-13: large-button personal phrase editing

R13 expanded: translation fields now open an isolated text editor using the shared grouped-letter/phrase composer. Apply and discard operate on the field draft; only outer Save changes commits the phrase. Speech/save-to-library actions are absent in text-edit mode, and conversation drafts are untouched. Original language can be selected with large buttons. Text-editor control language stays independent of the edited language. Phrase insertion filters out missing translations. Fixed clear/delete being disabled for whitespace-only text.

Evidence: 48 unit tests and production build pass. Large-text browser checks cover letter/phrase editing without native text entry, undo/delete, apply/discard boundaries, original-language buttons, independent Arabic text/English controls, preserved conversation draft, no speech controls, once-per-hover dwell and accessibility. One-switch group/letter selection is tested. Existing composer and phrase-editor regressions pass. Chinese IME-free word entry, other setup forms and physical device validation remain incomplete.

## 2026-09-13: large input adjustment controls

R19 initial improvement: added six-language large step buttons alongside dwell/scan/gain/threshold sliders and individual finger choices alongside the native dropdown. All buttons use existing access targeting and navigation-release protection. Bounds disable unavailable changes, slider and button values remain synchronized, and finger changes retain the existing requirement to recalibrate the resting position.

Evidence: production build and all 48 unit tests pass. input-adjustments.mjs passes bounded changes, persisted finger/gain settings, motion threshold, single dwell activation with deliberate release, actual app switch-scanning selection via Space, 320px overflow and accessibility checks. Screenshot inspected. Existing setup suite passes after fixing its asynchronous import-error assertion to await the error state. No physical switch, real camera user or native mobile device validation is claimed. Other native settings and permission flows still need work; R19 is not complete.

## 2026-09-13: accessible preference choices

Extended R19 with large board-language, layout and phrase-preset choices, plus speech and contrast toggle buttons. Native controls remain synchronized. Selected states use aria-pressed; labels support the six interface languages. Reused navigation-release protection to prevent repeated dwell toggles. The advanced panel title and Done button now use existing translations.

Evidence: production build and 48 unit tests pass. preference-controls.mjs covers native/button synchronization, Arabic language redraw, preservation across reload, narrow Arabic accessibility and overflow, one toggle per dwell visit, and selecting layout through real app scanning with a synthesized Space key. Existing setup regression suite passes. Physical switches, actual camera users, complete advanced-copy translation and remaining native file/permission flows are not validated by these checks.

## 2026-09-13: screen-transition selection protection

Fixed dialog input gating so a missing hand/eye point cannot fall back to the unrelated mouse position to release navigation protection. A capture-phase click listener now records the original activation rectangle and applies protection after handlers replace the control or change dialogs. Normal unchanged selections retain selected-state feedback; repeat scrolling remains available.

Evidence: build and all 48 unit tests pass. New transition-release.mjs uses generated camera frames and landmarks through the real hand-input pipeline to select a replacing review toggle, verifies the replacement still occupies the tested point, holds without repeat, loses tracking while moving the mouse, reacquires without repeat, and deliberately exits/re-enters to select again. Pointer, paged navigation, rest and preference suites pass, including scrolling, selected feedback and switch behavior. Updated the pointer test to rest explicitly outside controls because added setup buttons now occupy the former empty screen center. This is synthetic camera evidence, not real-person eye/hand validation.

## 2026-09-13: accessible personal phrase creation

Connected Personal phrases to a new creation mode of the large-button draft editor. Users can choose any supported original language, compose through grouped letters or existing phrases, optionally enter translations, review and explicitly save. Native English text is no longer required in this path. IDs are generated once per draft; the 200-phrase limit is checked at commit. Cancel does not modify the library. Storage failure restores the prior phrase array and leaves the draft available to retry.

Evidence: production build, all 48 unit tests and phrase-create.mjs pass. Creation test covers large-button text entry, Arabic-only source, draft discard, no writes until save, forced storage failure and successful retry, stable ID after reload, no speech interruption and narrow-screen accessibility. Existing phrase-editor.mjs passes. Chinese new-word entry still needs a device IME; physical input usability and native-speaker review remain outstanding.

## 2026-09-13: reduce phrase-creation navigation

New phrase drafts show only the original-language field until Add translations is selected. A six-language toggle reveals empty fields or hides them again while keeping entered translations visible. The original-language field appears first, including after changing its language. Existing saved-phrase editing starts with all languages expanded. Reordering avoids moving the active textarea during typing.

Evidence: production build, phrase-create.mjs and phrase-editor.mjs pass. Added checks for one versus six visible fields, preserving typed Spanish when collapsing unused languages, changing the original language, and discarding without saving. Existing checks cover accessible composition, save failure/retry, translation review and narrow-screen accessibility. Updated screenshot inspected. This reduces navigation demands; independent-use speed and fatigue still require real-person measurement.

## 2026-09-13: motion-switch setup navigation

Removed the unconditional practice counter that consumed every camera movement while input setup was open. Calibrated movement now selects the scanned setup control, including adjustments and Done. Added explicit Start/Stop scanning and Try your input controls; practice uses the existing separate measured trial. Camera motion emits no selections before stillness calibration. Calibration now synchronizes the threshold control and persisted settings; the tracking notice reports calibration needed until ready.

Evidence: production build, all 48 unit tests, setup and practice regressions pass. motion-setup.mjs uses generated video through actual central-region pixel scoring and MotionGate to select a threshold increase and Done, verifies continued scanning, separate practice, and disabled controls after camera stop. The video generator uses changing grayscale rather than an alternating two-frame pattern that can alias against sampling. This checks the software pipeline; physical finger movement reliability, fatigue and camera/device coverage remain unverified. Starting camera permissions and initial calibration may still need a helper or another available input.

## 2026-09-13: stable switch-scanning identity

Scanning now retains the actual highlighted control when earlier controls are inserted, removed or enabled. If that control disappears, selection refuses it and the replacement receives a full scan interval. Empty target sets reset cleanly. Selection verifies that the current control is both available and visually highlighted, and refuses input while the document is hidden or unfocused. Keyboard and camera movement use the same selection path.

Evidence: production build and all 50 unit tests pass. New unit coverage verifies insertion, removal, empty sets, stale selection rejection and replacement timing. scan-identity.mjs inserts a control ahead of a live scanned adjustment and verifies the correct adjustment still activates; synchronous disabling before a frame cannot trigger a replacement. Camera motion setup and rest regression suites pass. No physical switch/user validation is implied.

## 2026-09-13: predictable return after window focus loss

Returning focus now clears pending dwell and gives an active switch scan a fresh full interval. It preserves the current scan target and does not restart stopped scanning. Hidden-tab behavior still stops camera/scanning and requires deliberate restart.

Evidence: production build and scan-focus.mjs pass. The browser test models visible-window focus loss separately from visibility, waits past the old deadline, verifies an unfocused switch press cannot speak, returns focus and verifies the original highlighted phrase remains through the fresh interval before advancing. A stopped scan remains stopped after another focus cycle. This uses simulated focus events/state; OS-specific window switching remains unverified.

## 2026-09-13: Open Board Format export

R12 initial implementation: Set up now exports the selected phrase pack as a single OBF board with a chosen language and 2/3/4 columns. Empty positions and duplicate references are preserved. Local Lucide icons are rasterized to embedded PNGs with attribution and license text; exact current-person recorded speech is optional. Missing translations require explicit empty-position consent. User content remains private by default. Closing the screen cancels pending preparation before download.

Evidence: production build and all 52 unit tests pass. Core tests parse exported files using independent @shayc/open-board-format, verify layout, duplicates, private default, exact audio and missing translations. board-export.mjs checks actual downloads through that parser, PNG decoding/dimensions and license content, explicit missing-language consent, column changes, current-person audio isolation, stale-audio exclusion, cancellation during preparation and narrow-screen accessibility. Generated media is structural evidence, not a human speech-quality assessment. Export UI instructions currently remain English. OBF/OBZ import, multi-board transfer and actual use/round-trip in another AAC app remain outstanding; R12 is not complete.

## 2026-09-13: actual AsTeRICS interoperability check

Imported the synthetic English OBF export into the live AsTeRICS AAC no-registration workflow (release-2026-09-03-10.08/+0200), inspected its rendered grid and exported it back to OBZ. Labels, null positions and icon PNG bytes survived. The recording and icon attribution did not survive re-export; selecting Yes invoked TTS in the instrumented check. Choosing a home grid fixed the missing-root manifest produced when none was selected.

Saved source exports, two returned archives, screenshot, version, output routing capture, an artifact comparison script/report and reproducible steps in artifacts/ASTERICS-INTEROP.md. Reach export now discloses these observed limits. Production build and board-export browser checks pass, along with interop-artifacts.mjs. This is stronger evidence than schema validation but not lossless interchange or a complete round trip back into Reach; R12 remains unfinished.

## 2026-09-13: OBF import review foundation

Added obf-review.js to plan a single-board import without modifying profiles or fetching external media. It preserves original JSON/source and attribution, distinguishes visible labels from vocalization, retains empty/duplicate positions and unplaced-button IDs, and flags unsupported actions/navigation/extensions rather than turning them into ordinary speech. Duplicate IDs, malformed grids and invalid references fail. Referenced media must be embedded in supported bounded formats with matching signatures. Unknown languages require resolution; oversized text is flagged without truncation.

Evidence: all 56 unit tests passed; focused review checks pass after moving the actual synthetic export into a stable test fixture. Coverage includes longer spoken text, original extensions/private attribution, unsupported navigation, external/missing media, duplicate IDs, malformed grids, falsely declared PNG data, unknown locale and exact PNG/WAV bytes from a Reach export. Signature checks are not full codec validation. This is preparation code only: import UI, persistent board storage, supported-action playback, OBZ archives and complete round-trip use remain unfinished. The current preview app has no new import action yet.
# Imported boards: integrated workflow verification

Single-board OBF review, per-person local storage and the imported-board viewer are integrated. Original downloads retain source bytes; unsupported actions and missing media prevent saving. Message selection is followed by explicit Speak. The viewer preserves position numbers and empty slots while paging into large choices.

Current verification found and fixed insufficient contrast in the message preview. Speak, Stop and Help now have at least 64-pixel targets. Failed image decoding displays a notice without dropping the label; Stop updates the voice status. A blocked IndexedDB opening closes its handle if it later succeeds after rejection.

Evidence: production build and 56 unit tests passed; imported-boards.mjs, board-library.mjs and profiles.mjs passed. The final imported-board test also checks failed images, stopped status, target height and automated accessibility. Audio routing is instrumented, not human-listened. Real camera/switch users, full setup localization, OBZ/linked-board support and complete cross-app round trips remain outstanding. This is progress toward the market requirements, not proof of comparative superiority.


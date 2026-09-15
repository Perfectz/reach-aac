# Third-party assets

- `public/tracking/hand_landmarker.task`: Google MediaPipe hand landmark model, downloaded from https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task . MediaPipe project: https://github.com/google-ai-edge/mediapipe .
- `public/tracking/face_landmarker.task`: Google MediaPipe face landmark model (including iris landmarks), downloaded from https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task . Uses the same Apache-2.0 project license. Eye-control model/runtime downloads cache automatically on first use.
- `public/tracking/vision_*`: WebAssembly runtimes and loaders copied from the exact `@mediapipe/tasks-vision` version pinned by `package-lock.json`. The Apache-2.0 license text is included as `public/tracking/LICENSE`.
- Lucide: icon library, ISC license, https://lucide.dev . Its license is included as `public/lucide-LICENSE`.

These local files allow camera operation without a third-party runtime CDN. Only the requested model/runtime files are cached on first use; the app does not pre-download every runtime variant.

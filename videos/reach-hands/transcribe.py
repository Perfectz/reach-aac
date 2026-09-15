import json
from pathlib import Path
from faster_whisper import WhisperModel

model = WhisperModel('base.en', device='cpu', compute_type='int8')
meta = json.loads(Path('audio_meta.json').read_text())
for voice in meta['voices']:
    segments, _ = model.transcribe(voice['path'], language='en', word_timestamps=True, beam_size=5)
    voice['words'] = [dict(text=w.word.strip(), start=round(w.start,3), end=round(w.end,3)) for s in segments for w in (s.words or [])]
    print(voice['frame'], len(voice['words']), 'aligned words', flush=True)
Path('audio_meta.json').write_text(json.dumps(meta,indent=2))

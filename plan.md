# Virtual Piano Synthesizer — Implementation Plan

## Product outcome
Deliver a production-ready, dependency-free browser instrument that lets users play at least two full octaves through pointer/touch or QWERTY keyboard input, with selectable oscillator waveforms, a master volume control, and natural ADSR note envelopes.

## Architecture and serving
Use a static frontend only: `index.html` is the complete page shell, `styles.css` owns the responsive analog-console presentation, `app.js` owns the Web Audio engine and interaction state, and `public/manus-routes.json` declares the single `/` route. No server, database, framework, library, package manager, or external asset is required. Production delivery should serve the files as static output; HTML remains revalidatable while versioned assets may use long-lived caching when configured by the host.

## Implementation decisions
- Build a two-octave plus high C keyboard from 25 semitones (15 white keys and 10 black keys), anchored to C4 through C6.
- Compute frequencies using equal temperament relative to A4 = 440 Hz rather than hardcoding a fragile table.
- Use one AudioContext, a master GainNode, one OscillatorNode and per-voice GainNode per active note.
- Schedule ADSR attack, decay, sustain, and release with `AudioParam` automation and a short release fallback to avoid clicks.
- Use Pointer Events with pointer capture and hit testing so mouse/touch drag-off releases notes correctly; keep pointer and keyboard sources independent.
- Map keyboard rows to contiguous white/black key slots, suppress `event.repeat`, and release all computer-keyboard voices on window blur.
- Keep controls semantic and keyboard accessible, including live labels for waveform, volume, and active-note status.

## Project structure
- `index.html` — semantic shell, controls, branding mark, accessible piano key containers.
- `styles.css` — responsive layout, keyboard geometry, warm analog palette, focus/pressed states, and mobile overflow behavior.
- `app.js` — note model, frequency calculation, Web Audio engine, ADSR voice lifecycle, pointer/touch interaction, QWERTY mapping, and UI status updates.
- `public/manus-routes.json` — current route manifest for `/`.
- `assets/pianolab-logo.png` — project-specific square favicon/logo.

## Verification
Use source inspection plus focused Node syntax checking and a running HTTP readiness check. Confirm the route manifest returns HTTP 200 JSON, inspect that all requested note mappings and audio controls are present in source, and run the browser app through the Webdev preview server. No external dependency install or browser automation is necessary for this static implementation.

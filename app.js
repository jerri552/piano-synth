(() => {
  'use strict';

  const WHITE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const BLACK_AFTER = new Set(['C', 'D', 'F', 'G', 'A']);
  const SEMITONES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const START_MIDI = 60; // C4
  const END_MIDI = 84; // C6
  const ATTACK = 0.018;
  const DECAY = 0.12;
  const SUSTAIN = 0.68;
  const RELEASE = 0.18;

  const whiteKeysEl = document.querySelector('#white-keys');
  const blackKeysEl = document.querySelector('#black-keys');
  const pianoEl = document.querySelector('#piano');
  const waveformEl = document.querySelector('#waveform');
  const volumeEl = document.querySelector('#volume');
  const volumeValueEl = document.querySelector('#volume-value');
  const statusTextEl = document.querySelector('#status-text');
  const statusDotEl = document.querySelector('#status-dot');
  const activeNotesEl = document.querySelector('#active-notes');

  const noteById = new Map();
  const voiceByNote = new Map();
  const pointerNotes = new Map();
  const keyboardNotes = new Map();
  let audioContext = null;
  let masterGain = null;
  let lastPointerKey = null;

  const midiToFrequency = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  const midiToName = (midi) => `${SEMITONES[midi % 12]}${Math.floor(midi / 12) - 1}`;

  function isBlack(midi) { return SEMITONES[midi % 12].includes('#'); }

  function createKey(midi, className, shortcut) {
    const key = document.createElement('button');
    const id = midiToName(midi).replace('#', 's');
    key.type = 'button';
    key.className = `piano-key ${className}`;
    key.dataset.note = midiToName(midi);
    key.dataset.midi = String(midi);
    key.id = `key-${id}`;
    key.setAttribute('aria-label', `${midiToName(midi)}, ${midiToFrequency(midi).toFixed(2)} hertz`);
    key.setAttribute('aria-pressed', 'false');
    key.innerHTML = `<span class="key-label">${shortcut ? shortcut.toUpperCase() : ''}</span>`;
    noteById.set(key.dataset.note, { midi, id: key.dataset.note, element: key, frequency: midiToFrequency(midi), shortcut });
    return key;
  }

  // Map the home row to white keys and the number/top row to black keys.
  const whiteShortcuts = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'z', 'x', 'c', 'v'];
  const blackShortcuts = ['w', 'e', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];

  function buildKeyboard() {
    let whiteIndex = 0;
    let blackIndex = 0;
    for (let midi = START_MIDI; midi <= END_MIDI; midi += 1) {
      const note = midiToName(midi);
      if (isBlack(midi)) {
        const key = createKey(midi, 'black-key', blackShortcuts[blackIndex]);
        const previousNatural = midi - 1;
        const naturalPosition = Array.from({ length: previousNatural - START_MIDI + 1 }, (_, index) => START_MIDI + index).filter((value) => !isBlack(value)).length - 1;
        key.style.left = `${((naturalPosition + 1) * 100) / 15}%`;
        key.style.transform = 'translateX(-50%)';
        blackKeysEl.append(key);
        blackIndex += 1;
      } else {
        whiteKeysEl.append(createKey(midi, 'white-key', whiteShortcuts[whiteIndex]));
        whiteIndex += 1;
      }
      // Keep the generated note model explicit and inspectable.
      if (!noteById.has(note)) throw new Error(`Failed to create ${note}`);
    }
  }

  function ensureAudio() {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        statusTextEl.textContent = 'Web Audio unavailable';
        return false;
      }
      audioContext = new AudioContext();
      masterGain = audioContext.createGain();
      masterGain.gain.value = Number(volumeEl.value) / 100 * 0.8;
      masterGain.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return true;
  }

  function setActive(note, active) {
    note.element.classList.toggle('is-active', active);
    note.element.setAttribute('aria-pressed', String(active));
    const activeCount = document.querySelectorAll('.piano-key.is-active').length;
    activeNotesEl.textContent = activeCount ? `${activeCount} active note${activeCount === 1 ? '' : 's'}` : 'No active notes';
    statusDotEl.classList.toggle('is-active', activeCount > 0);
    statusTextEl.textContent = activeCount ? 'Sound in motion' : 'Ready to play';
  }

  function playNote(noteId, source) {
    const note = noteById.get(noteId);
    if (!note || !ensureAudio()) return;
    const existing = voiceByNote.get(noteId);
    if (existing && !existing.released) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = waveformEl.value;
    oscillator.frequency.setValueAtTime(note.frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.82, now + ATTACK);
    gain.gain.linearRampToValueAtTime(SUSTAIN, now + ATTACK + DECAY);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now);
    const voice = { oscillator, gain, released: false, source };
    voiceByNote.set(noteId, voice);
    setActive(note, true);
  }

  function releaseNote(noteId) {
    const note = noteById.get(noteId);
    const voice = voiceByNote.get(noteId);
    if (!note || !voice || voice.released) return;
    voice.released = true;
    const now = audioContext.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + RELEASE);
    voice.oscillator.stop(now + RELEASE + 0.025);
    window.setTimeout(() => {
      if (voiceByNote.get(noteId) === voice) voiceByNote.delete(noteId);
      setActive(note, false);
    }, (RELEASE + 0.04) * 1000);
  }

  function releaseAll(source) {
    for (const [noteId, voice] of voiceByNote) {
      if (!source || voice.source === source) releaseNote(noteId);
    }
  }

  function keyFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    const key = element && element.closest('.piano-key');
    return key && pianoEl.contains(key) ? key : null;
  }

  function noteIdFromElement(element) { return element ? element.dataset.note : null; }

  pianoEl.addEventListener('pointerdown', (event) => {
    const key = keyFromPoint(event.clientX, event.clientY);
    if (!key) return;
    event.preventDefault();
    pianoEl.setPointerCapture?.(event.pointerId);
    const noteId = noteIdFromElement(key);
    pointerNotes.set(event.pointerId, noteId);
    lastPointerKey = key;
    playNote(noteId, 'pointer');
  });

  pianoEl.addEventListener('pointermove', (event) => {
    if (!pointerNotes.has(event.pointerId)) return;
    event.preventDefault();
    const currentKey = keyFromPoint(event.clientX, event.clientY);
    const nextNoteId = noteIdFromElement(currentKey);
    const currentNoteId = pointerNotes.get(event.pointerId);
    if (nextNoteId === currentNoteId) return;
    if (currentNoteId) releaseNote(currentNoteId);
    if (nextNoteId) {
      pointerNotes.set(event.pointerId, nextNoteId);
      lastPointerKey = currentKey;
      playNote(nextNoteId, 'pointer');
    } else {
      pointerNotes.delete(event.pointerId);
      lastPointerKey = null;
    }
  });

  function endPointer(event) {
    const noteId = pointerNotes.get(event.pointerId);
    if (noteId) releaseNote(noteId);
    pointerNotes.delete(event.pointerId);
    lastPointerKey = null;
  }
  pianoEl.addEventListener('pointerup', endPointer);
  pianoEl.addEventListener('pointercancel', endPointer);
  pianoEl.addEventListener('lostpointercapture', endPointer);

  buildKeyboard();

  const shortcutToNote = new Map();
  for (const note of noteById.values()) if (note.shortcut) shortcutToNote.set(note.shortcut, note.id);

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const noteId = shortcutToNote.get(key);
    if (!noteId || event.repeat || keyboardNotes.has(key)) return;
    event.preventDefault();
    keyboardNotes.set(key, noteId);
    playNote(noteId, 'keyboard');
  });

  window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    const noteId = keyboardNotes.get(key);
    if (!noteId) return;
    keyboardNotes.delete(key);
    releaseNote(noteId);
  });

  window.addEventListener('blur', () => {
    for (const noteId of keyboardNotes.values()) releaseNote(noteId);
    keyboardNotes.clear();
    releaseAll('pointer');
    pointerNotes.clear();
  });

  waveformEl.addEventListener('change', () => {
    for (const voice of voiceByNote.values()) voice.oscillator.type = waveformEl.value;
  });

  volumeEl.addEventListener('input', () => {
    const value = Number(volumeEl.value);
    volumeValueEl.textContent = `${value}%`;
    volumeEl.style.background = `linear-gradient(90deg, var(--brass) 0 ${value}%, var(--walnut-700) ${value}% 100%)`;
    if (masterGain && audioContext) masterGain.gain.setTargetAtTime(value / 100 * 0.8, audioContext.currentTime, 0.015);
  });

  volumeEl.dispatchEvent(new Event('input'));
})();

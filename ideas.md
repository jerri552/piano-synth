# Virtual Piano Synthesizer — Design Brief

## Design direction
**Warm Analog Console** — a tactile retro-synth interface using walnut brown, muted amber, cream keys, and understated hardware-inspired detailing. The experience should feel musical and handcrafted while staying clean, responsive, and performance-focused.

## Design movement
Analog instrument panel translated into a modern browser UI: warm materials, precise control geometry, and generous breathing room around the playable surface.

## Core principles
- **Instrument first:** the keyboard is the visual and interaction hero.
- **Tactile clarity:** pressed states should feel physical through depth, color, and shadow changes.
- **Warm precision:** amber accents and monospaced labels add studio-console character without reducing legibility.
- **Quiet confidence:** restrained decoration, strong hierarchy, and no unnecessary panels.

## Color philosophy
- Walnut / espresso surfaces anchor the interface.
- Toasted amber marks active controls and interaction states.
- Cream and ivory keys provide high contrast and a familiar piano visual language.
- Muted clay and brass details support the analog-console feel.

## Layout paradigm
A single responsive instrument workspace: compact identity header, horizontal control strip, then a full-width keyboard surface. On narrow screens the control strip wraps, while the keyboard remains horizontally scrollable and usable with touch.

## Signature elements
- A compact piano-mark wordmark built around a two-key silhouette.
- Fine brass dividers and small uppercase instrument labels.
- Pressed keys lift in amber with visible depth.
- A subtle “ready / active notes” status indicator.

## Interaction philosophy
Every control should acknowledge input immediately. Pointer capture keeps touch and drag performance reliable; active note styling stays synchronized with audio voices. Focus rings are warm amber and clearly visible.

## Animation
Short, low-amplitude transitions only: key press/release depth, panel hover, and status changes. Avoid motion that competes with playing. Audio envelopes handle the natural fade of notes.

## Typography system
Use a system monospace stack for the instrument label and technical values, paired with a system sans stack for body copy and control text. No external font dependency is permitted.

## Brand essence
A small, browser-native instrument that feels like a beloved tabletop synth: immediate, expressive, and dependable.

## Brand voice
Concise, encouraging, and technical: “Choose a voice. Play a phrase.”

## Wordmark / logo
A geometric two-key piano glyph inside a full-bleed walnut square, with an amber key edge suggesting a lit instrument panel. The header can use the same glyph as a small inline mark; the favicon uses the square icon.

## Signature brand color
Toasted amber `#D89B4A` on walnut `#3A211D`.

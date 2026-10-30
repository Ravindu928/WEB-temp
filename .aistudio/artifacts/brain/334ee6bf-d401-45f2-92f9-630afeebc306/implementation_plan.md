# Minimalist 3D Spatial "SOON" Experience

An ultra-minimalist, gallery-grade landing page announcing the upcoming launch of **Spatial** (the free 2D-to-3D space conversion engine). The experience features a clean off-white editorial ivory atmosphere, the word **SOON** rendered in the iconic tall Apple lockscreen clock typography, a sculptural 3D suspended swinging chair gently moving in the foreground to demonstrate spatial depth occlusion, and a whisper-quiet email notification input.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following confirmed decisions incorporate your exact feedback from Phase 1:
> - **No Phone Frame**: Removed all phone bezels, chassis, and rectangular phone frames. The 3D scene floats freely in full-bleed open space.
> - **3D Swinging Chair Centerpiece**: A bespoke modernist suspended swinging chair floats and sways gracefully in front of the typography.
> - **No Sinhala Text / Zero Visual Clutter**: Removed all secondary scripts, multi-column cards, chapter navigation docks, and paragraphs.
> - **Clean Off-White Editorial Ivory Palette**: Light, warm architectural linen and limestone tones (`#F7F4EE` / `#FBF9F5`) with antique charcoal ink.
> - **Apple Clock Typography**: The word "SOON" is set in the signature tall, slender, rounded condensed Apple lockscreen clock style.
> - **Ultra-Minimal Layout**: Just the 3D scene, the clock-style word, and a minimal inline notification form.

---

### 1. Overview & Core Concept

- **What It Does**: Presents a serene, high-taste coming-soon page for a free service that converts 2D photos into 3D volumetric space.
- **The Core Metaphor**: The foreground 3D sculptural swinging chair hangs and oscillates in front of the tall clock-style "SOON" text, providing an intuitive, physical demonstration of foreground-background depth separation—the core promise of the service.
- **Atmosphere**: Silent luxury, architectural monograph, museum curation. No neon, no gamer dark mode, no cards within cards.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme
- **Background Canvas**: Archival Warm Ivory (`#F7F4EE` / `#FBF9F5`).
- **Typography**:
  - *Clock Style "SOON"*: Custom procedural geometry / high-precision vector texture inspired by Apple's iOS 16/17/18 lockscreen clock font—ultra-tall, slender aspect ratio, monoline stroke width, and rounded terminals.
  - *Quiet Editorial UI*: Refined sans-serif (`Plus Jakarta Sans`) and subtle monospace markers (`JetBrains Mono`) set in antique charcoal (`#1C1917`) and warm stone gray (`#78716C`).
- **3D Sculptural Subject (The Swinging Chair)**:
  - *Structure*: An elegant hanging egg/ring chair with curved organic outer shell, slender suspension cable reaching upward, and soft linen cushion.
  - *Materials*: Warm bentwood/charcoal matte finish, textured cream fabric cushion, and subtle brushed metallic suspension hook.
  - *Lighting & Shadows*: Soft ambient overhead lighting casting a diffuse contact shadow directly on the ivory floor.

#### User Flow & Motion
1. **Initial Reveal**: The scene opens seamlessly into the airy ivory space. The tall clock-style "SOON" stands calmly in the background, while the suspended chair hangs in front.
2. **Physics & Parallax**:
   - The chair gently sways with a natural, continuous harmonic pendulum oscillation ($T \approx 3.2\text{s}$).
   - Moving the cursor or dragging on the canvas introduces smooth, damped rotational parallax, making the chair sway toward the pointer while the letters behind remain grounded in depth.
3. **Minimal Notification Form**:
   - Pinned quietly at the bottom or lower center: a single hairline input line reading `Enter your email — notify me`.
   - On submission, it morphs into a quiet confirmation: `Access reserved · Dispatch key #0842`.

---

### 3. Key Product Decisions & Trade-Offs

- **Procedural 3D Geometry vs External 3D Models**:
  - *Chosen Approach*: Procedurally construct the swinging chair in Three.js using `TubeGeometry`, `LatheGeometry`, and `TorusGeometry` grouped together.
  - *Why*: Eliminates 404 dependencies, external `.glb` download delays, and ensures immediate, buttery-smooth 60fps rendering on both mobile and desktop.
- **Fullscreen Unobstructed Spatial Viewport**:
  - *Chosen Approach*: The WebGL canvas occupies the full screen, with top and bottom editorial text overlaid with `pointer-events-none` (interactive elements enabled).
  - *Why*: Gives maximum breathing room and visual impact to the 3D depth effect.
- **Single-Line Inline Form**:
  - *Chosen Approach*: An unboxed hairline text line without heavy buttons or modals.
  - *Why*: Respects the user's strict requirement for "just minimal, just the word soon and a minimal notify form".

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│               Minimal Ivory Canvas (App.tsx)           │
│                                                        │
│  [SPATIAL — 2D TO 3D ENGINE]              [AUDIO BTN]  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Three.js WebGL Viewport              │  │
│  │                                                  │  │
│  │                [Suspension Cable]                │  │
│  │                         │                        │  │
│  │    S    O   ┌──────┐   O    N                    │  │
│  │   (Clock)   │Chair │  (Clock)                    │  │
│  │             └──────┘                             │  │
│  │                 ░░ (Contact Shadow)              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│      [ enter your email — notify me               → ]  │
│      FREE SERVICE · OPERATIONS COMMENCING SOON         │
└────────────────────────────────────────────────────────┘
```

#### Component Structure
- `src/App.tsx`: Main minimalist shell, housing the top brand mark, the 3D canvas viewport, and the bottom inline notify input.
- `src/three/SwingingChairScene.ts`: Three.js scene manager containing:
  - Software WebGL detection and frame pacing.
  - Studio `RoomEnvironment` with soft warm lighting.
  - The background 3D Apple lockscreen clock-style "SOON" typography mesh.
  - The composite procedural 3D swinging chair (rings, ribbing, suspension cable, cushion, contact shadow plane).
  - Pendulum kinematics loop with smooth mouse drag and tilt interaction.
- `src/audio/sound.ts`: Subtle procedural Web Audio chime for form feedback.

---

### 5. Verification Plan

1. **Visual Verification**: Confirm the off-white ivory canvas (`#F7F4EE`), absence of phone frames, complete removal of Sinhala text, and clean typographic restraint.
2. **Kinematic & Physics Verification**: Confirm the swinging chair oscillates smoothly with pendulum physics and reacts to cursor drag/hover.
3. **Build & Lint Verification**: Run `compile_applet` and `lint_applet` to ensure zero compilation or TypeScript errors.

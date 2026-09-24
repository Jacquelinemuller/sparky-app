---
name: Kinetic Emerald
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#00687a'
  on-tertiary: '#ffffff'
  tertiary-container: '#00b2d0'
  on-tertiary-container: '#003f4b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  container-max: 1040px
---

## Brand & Style

The design system is engineered specifically for an 11-year-old brain navigating ADHD: lively, rewarding, highly structured, and visually uncluttered. Its aesthetic blends clean functional modernism with soft, tactile micro-gamification. Every interaction delivers immediate sensory feedback—crisp, satisfying tactile states, cheerful sunny rewards, and distinct visual milestones.

### Core Personality & Emotional Directives
- **Encouraging, Never Overwhelming:** Minimizes cognitive overload by chunking tasks into singular, digestible focal points. Clean negative space frames vibrant focal elements.
- **Energizing & Dopamine-Friendly:** Accomplishment is celebrated through vivid emerald greens and joyful golden-amber accents that signal forward momentum, progress, and mastery.
- **Supportive & Safe:** High-legibility sans typography and ultra-smooth, pill-shaped geometry remove visual tension, creating an interface that feels friendly, forgiving, and impossible to "break."
- **Gamified Companion Integration:** Interactive prompts and feedback mechanisms incorporate companion cues featuring Sparky the dog—an encouraging guide offering praise, gentle nudges, and visual anchor points across transitions.

## Colors

The palette leverages high-clarity chroma pairing to differentiate active work zones from background scaffolding without causing sensory fatigue.

### Palette Architecture
- **Primary (`#10B981` — Kinetic Emerald):** Represents focus, successful completion, primary actions, and positive reinforcement. Tonal variations include `#059669` (interactive press/active states) and `#D1FAE5` (selected soft highlights).
- **Secondary (`#F59E0B` — Sunny Amber):** The dopamine accelerator. Used for streaks, star rewards, companion badges, Sparky's energy meters, and celebration callouts. Paired with soft tint `#FEF3C7`.
- **Tertiary (`#06B6D4` — Sky Spark):** Used for informational tips, companion dialog bubbles, and secondary navigation anchors.
- **Background & Canvas (`#F0FDF4` — Soft Mint Canvas):** A gentle, anti-glare light mint tinted canvas that provides superior reading comfort over harsh sterile white.
- **Surface Cards (`#FFFFFF` — Crisp Canvas White):** Elevated surfaces pop cleanly off the mint background, maintaining a distinct physical boundary around content chunks.
- **Neutral / Text (`#1E293B` — Deep Slate Navy):** High-contrast text color ensuring maximum readability (passing WCAG AAA standards) while remaining softer on young eyes than pure black. Secondary copy is anchored in `#64748B`.

## Typography

Plus Jakarta Sans is utilized across all levels. Its balanced x-height, open apertures, and subtle geometric warmth make it exceptionally legible for readers with attention variability and dyslexia tendencies.

### Execution Guidelines
- **Chunked Information Hierarchy:** Avoid massive text walls. Headings must instantly announce what the user needs to do next. Use `headline-md` and `headline-sm` to break tasks into clear 1-2-3 steps.
- **Weight as Meaning:** Medium (`500`) is the baseline body weight to prevent thin strokes from disappearing on mobile screens. Bold (`700`) and ExtraBold (`800`) are reserved for titles, actionable items, and milestone counts.
- **Letter Spacing:** Tighter negative letter spacing is explicitly limited to large headlines; body and label sizes retain standard to loose tracking for effortless character distinction.

## Layout & Spacing

The layout model utilizes a centered, single-track or dual-track fluid grid designed to keep focus tethered to the center of the visual field, preventing peripheral distraction.

### Spatial Architecture
- **Scale:** An 8pt base grid governs all layout containers, paddings, and vertical rhythm (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Target Sizes for Small Hands:** All touch targets must adhere to a minimum size of 48px × 48px (ideal 56px height for primary buttons) to eliminate tap frustration.
- **Containers:** Content width is deliberately capped at `1040px` on desktop to prevent broad horizontal scanning that causes focus drift. Tablet adopts an 8-column layout, and mobile collapses to a 4-column flow with wide `1rem` margins and generous `1.5rem` vertical spacing between task modules.

## Elevation & Depth

This design system uses playful, tactile depth inspired by physical, pressable toy blocks and layered sticker books rather than dark, moody realism.

### Depth Rules
- **Layer 0 (Canvas):** Base level `#F0FDF4` (Soft Mint Canvas). Flat, static, noise-free.
- **Layer 1 (Cards & Islands):** Pure White (`#FFFFFF`) with a dual shadow structure: a soft diffused ambient lift `0 4px 20px -2px rgba(16, 185, 129, 0.08)` complemented by a crisp bottom rim border `2px solid #E2E8F0`. This anchors content modules with friendly clarity.
- **Layer 2 (Interactive Buttons & Badges):** 3D "Pushable" elevation. Buttons feature a solid bottom pseudo-border (e.g., a `4px` solid rim in `#059669` beneath the `#10B981` surface). On press, elements shift 2px downward with reduced rim depth, giving a mechanical, rewarding "click" feel.
- **Layer 3 (Modals & Sparky Celebrations):** Crisp floating overlays with `0 16px 36px -4px rgba(15, 23, 42, 0.16)` and a full backdrop blur (`backdrop-filter: blur(8px)`) over a soft translucent mint scrim (`rgba(240, 253, 244, 0.85)`).

## Shapes

The shape system is defined by pill-shaped geometries and hyper-rounded card envelopes (Level 3 Roundedness). 

### Geometry Foundations
- **Pill Primitives (`rounded-full`):** All action triggers, chips, badges, segmented controls, and input text fields possess fully rounded pill caps (radius ≥ `9999px`). This removes sharp friction points and creates an approachable, toy-like tactile universe.
- **Surface Envelopes (`rounded-xl` / `rounded-2xl`):** Card panels, content containers, and popovers feature sweeping radii of `1.5rem` (`24px`) to `2rem` (`32px`), preserving visual fluidity and soft ergonomics across the entire interface.
- **Avatars & Sparky Badges:** Perfectly circular frames featuring sunny yellow borders (`3px solid #F59E0B`) that house companion imagery and gamified status tokens.

## Components

### Buttons
- **Primary Action (Go / Complete):** Fully pill-shaped. Background `#10B981`, bold white label (`label-lg`), with a physical 4px bottom edge in `#059669`. Active state shifts `transform: translateY(2px)` and compresses the edge to 2px. Minimum height: `52px`.
- **Secondary (Reward / Special):** Background `#F59E0B` with `#D97706` 4px bottom rim. White text. Used for redeeming points, viewing Sparky's shop, or streak multipliers.
- **Tertiary / Ghost:** Pill-shaped outline with a 2px stroke in `#A7F3D0` and text in `#047857`. Background transitions to `#E6FBF2` on hover.

### Chips & Badges
- **Pill Chips:** Height `36px`. Background `#DCFCE7`, border `1.5px solid #86EFAC`, text `#065F46`. Active/Selected chips swap to solid `#10B981` with white bold text.
- **Streak & Sparky Badges:** Micro-pills combining an emoji/icon (e.g., dog bone, paw, lightning bolt) with bold numbers in `#B45309`, set over `#FEF3C7` backgrounds.

### Cards & Focus Containers
- **Actionable Task Card:** Crisp `#FFFFFF` surface with `28px` rounded corners, padded at `24px`. Contains an active indicator bar on the left edge (4px thick pill in `#10B981` or `#F59E0B`), isolating tasks into standalone sensory pods.
- **Sparky Prompt Card:** Bordered in a playful 2px dashed `#34D399` stroke on `#F0FDF4`, featuring an avatar badge of Sparky anchored at the top-left edge providing contextual instructions in `body-md`.

### Checkboxes & Selection Controls
- **Gamified Check Circles:** Checkboxes are designed as oversized circular targets (size `32px × 32px`). Unchecked: white fill with a 3px border in `#CBD5E1`. Checked: immediate bounce animation into solid `#10B981` displaying a thick white checkmark, accompanied by micro-confetti feedback.
- **Radio Pills:** Enclosed horizontal selector where choices act as toggleable pills with bold text and cheerful press states.

### Input Fields
- **Pill Form Fields:** Height `52px`, `rounded-full`, white surface, encased in a 2px border `#E2E8F0`. Focused state intensifies to a 2px border in `#10B981` and a luminous ambient glow (`box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2)`). Text displays in `#1E293B` with `#94A3B8` placeholder guidance.

### Progress & Motivation Gauges
- **Kinetic Progress Bar:** Height `20px`, `rounded-full` container in `#E2E8F0` containing an animated striped or gradient emerald-to-mint bar (`#10B981` to `#34D399`). A floating circular thumb with Sparky's paw print sits at the front of the bar, marking real-time milestone progress.
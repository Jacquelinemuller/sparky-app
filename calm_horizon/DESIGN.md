---
name: Calm Horizon
colors:
  surface: '#fff8f6'
  surface-dim: '#e7d7d2'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#fbeae5'
  surface-container-high: '#f5e5e0'
  surface-container-highest: '#efdfda'
  on-surface: '#221a17'
  on-surface-variant: '#544243'
  inverse-surface: '#382e2b'
  inverse-on-surface: '#feede8'
  outline: '#877273'
  outline-variant: '#dac1c1'
  surface-tint: '#98434c'
  primary: '#98434c'
  on-primary: '#ffffff'
  primary-container: '#d9777f'
  on-primary-container: '#57121d'
  inverse-primary: '#ffb2b7'
  secondary: '#865045'
  on-secondary: '#ffffff'
  secondary-container: '#feb8aa'
  on-secondary-container: '#7a473c'
  tertiary: '#865046'
  on-tertiary: '#ffffff'
  tertiary-container: '#c28478'
  on-tertiary-container: '#4a2018'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#ffb2b7'
  on-primary-fixed: '#40010e'
  on-primary-fixed-variant: '#7a2c36'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#fbb6a8'
  on-secondary-fixed: '#351008'
  on-secondary-fixed-variant: '#6a392f'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#fbb6a8'
  on-tertiary-fixed: '#351009'
  on-tertiary-fixed-variant: '#6a3930'
  background: '#fff8f6'
  on-background: '#221a17'
  surface-variant: '#efdfda'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Lexend
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Lexend
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Lexend
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  timer-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  timer-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  container-max: 840px
---

## Brand & Style

This design system establishes a restorative, sensory-friendly environment tailored for young neurodivergent learners—specifically children managing ADHD. Traditional productivity tools trigger cognitive fatigue through relentless alarms, saturated alerts, and dense visual noise. This system counters that exhaustion with a low-stimulation, warm, and structured interface that anchors attention without inducing panic.

The personality balances structure with kindness:
- **Calm & Grounding:** A soothing base of linen and warm cream prevents sensory overload and screen glare.
- **Supportive & Non-Punitive:** Pale, dusty reds replace harsh error tones with warm encouragement, framing tasks as doable checkpoints rather than rigid deadlines.
- **Clear & Scannable:** Uncluttered layouts, generous spacing, and open letterforms minimize working memory strain and reading friction.

Drawing from warm, functional minimalism and quiet tactile metaphors, the visual language avoids stark sterile whites, jarring neon accents, and heavy skeuomorphism. Interactive touchpoints feel soft, deliberate, and predictable, giving learners a reassuring sense of control over their focus and routine.

## Colors

The color palette is built around soft crimson, dusty coral, and terracotta-infused neutrals set against warm linen surfaces. High-chroma saturated reds can activate anxiety or urgency, while this muted pale red creates a focal anchor that signals importance gently.

### Roles & Implementation Guidelines
- **Primary (`#D9777F` - Dusty Rose Crimson):** Reserved for the current focal task, active timer indicators, and primary completion triggers. Never used for loud warnings or punishment cues.
- **Secondary (`#C98A7D` - Terracotta Warmth):** Applied to progress milestones, category tags, and secondary action surfaces that require distinction without high contrast.
- **Tertiary (`#E8A598` - Pale Coral Blush):** Used for subtle card highlights, completed state badges, and ambient focus glows.
- **Neutral (`#8A7D79` - Warm Sandstone Neutral):** Used for supporting text, dividers, and structural outlines. It guarantees soft, readable contrast while avoiding the starkness of pure charcoal or black.
- **Background & Canvas:**
  - Base canvas: `#FAF6F2` (Warm Linen).
  - Elevated card surface: `#FFFFFF` (Soft Crisp Canvas) or `#F4ECE4` (Muted Warm Sand).
  - High-contrast text on surfaces: `#3D3331` (Deep Espresso Brown), ensuring full WCAG AAA legibility without the harshness of pure `#000000`.

## Typography

The typographic hierarchy pairs **Plus Jakarta Sans** for headlines and timers with **Lexend** for body copy and task labels.

- **Plus Jakarta Sans** brings rounded terminals, open counters, and a friendly, unhurried cadence to section titles and time readouts.
- **Lexend** was scientifically developed to reduce visual crowding, expand character recognition, and accelerate reading pacing—crucial for an 11-year-old reader with ADHD who might otherwise skip lines or feel overwhelmed by dense walls of text.

### Implementation Rules
- Never use all-caps for long instructions; reserve uppercase exclusively for short, pill-shaped category markers or timer labels (3–6 letters maximum).
- Maintain generous line-heights across body text to prevent horizontal crowding.
- Restrict paragraph blocks to a maximum of 3 lines per task description to prevent cognitive overload.

## Layout & Spacing

To aid focus, layouts adhere to a single-column or soft two-column fixed-max container (`840px`). Multi-column dashboards split attention and increase distraction; a centered, predictable vertical stream reduces spatial scanning effort.

### Layout Philosophy
- **Single-Path Focus:** Present only one primary task or active routine block front and center, pushing secondary actions into an orderly list below.
- **Touch-First Tap Targets:** Since younger users may use touchscreen tablets or trackpads, all interactive triggers have a minimum height and hit target of 48px, padded by `space-sm` or `space-md`.
- **Rhythm:** Spacing follows an 8px scale. Dense task items use `space-sm` (12px) separation, while independent context shifts (e.g., between "Now" and "Upcoming") employ `space-xl` (32px) to clearly demarcate boundaries without heavy graphic lines.

### Responsive Behavior
- **Mobile (< 640px):** 1-column layout, edge margins of `gutter-mobile` (16px), floating primary action button at the bottom navigation edge.
- **Tablet & Desktop (640px - 1024px+):** Centered card stream constrained to `840px`. Sidebar utilities (timers, streaks) tuck beside the primary task column with a 24px gutter.

## Elevation & Depth

Visual hierarchy is communicated through warm tonal layering and soft ambient drop shadows tinted with muted terracotta hues. Stark black drops or high-contrast borders create visual tension; the system uses diffuse, calm depth.

### Depth Layers
- **Ground (Base Surface):** `#FAF6F2` (Linen). Provides zero elevation.
- **Layer 1 (Cards & Task Items):** `#FFFFFF` with a subtle outline (`1px solid #EFE6DE`) and ambient shadow: `0 2px 8px -2px rgba(138, 125, 121, 0.08)`.
- **Layer 2 (Active/Current Focus Item):** `#FFFFFF` with a 2px pale-red border (`#D9777F`) and soft warm glow: `0 8px 24px -4px rgba(217, 119, 127, 0.16)`.
- **Layer 3 (Overlays, Modals & Floating Timers):** `#FFFFFF` accompanied by a warm backdrop overlay (`rgba(61, 51, 49, 0.25)`) and diffused depth: `0 16px 36px -8px rgba(138, 125, 121, 0.18)`.

## Shapes

The roundedness token is set to `2` (base `0.5rem` / 8px). 

- **Base Components (Inputs, Buttons, Cards):** Use `rounded-md` (8px) to `rounded-lg` (16px) for an organic, approachable feel.
- **Containers & Surfaces:** Main task containers and modal dialogs adopt `rounded-xl` (24px), eliminating sharp corners that convey tension or rigidity.
- **Badges & Progress Trackers:** Use fully pill-shaped geometries (`rounded-full`) to differentiate lightweight metadata chips from actionable square-cornered task cards.

## Components

### Buttons
- **Primary Button:** Solid dusty coral (`#D9777F`) background with `#FFFFFF` text. Pill or rounded-lg corner shape (12px radius), height 48px minimum. Hover/press states darken slightly to `#C86770` with a gentle scale depression (`transform: scale(0.98)`).
- **Secondary Button:** Warm linen surface (`#F4ECE4`) with neutral dark text (`#3D3331`) and no heavy border. Gives young users an explicit "Take a Break" or "Skip" action without guilt.
- **Ghost/Tertiary:** Transparent background, `#8A7D79` text, soft terracotta hover wash (`rgba(201, 138, 125, 0.1)`).

### Task Cards
- Cards feature an intentionally light interior canvas (`#FFFFFF`) framed by a 1px border (`#EFE6DE`).
- Left-side indicator stripe: A 4px vertical accent bar rendered in `#D9777F` denotes the single active "Do This Now" card; pending tasks have no colored stripe.
- Spacing inside cards is generous (`space-md` / 16px) to avoid crowded text.

### Chips & Badges
- **Duration Badge:** Pill-shaped, background `rgba(217, 119, 127, 0.12)`, text `#9E464E`, font `label-md`. Clearly signals task time (e.g., "10 min") at a glance.
- **Status Chips:** Light terracotta or warm linen backgrounds. Never use screaming neon greens or reds.

### Checkboxes & Completion Cues
- Checkbox targets are oversized (24px × 24px) with rounded corners (`rounded-md` / 6px) and a gentle 1.5px border (`#C98A7D`).
- Upon completion, the check animation transitions with a gentle burst into a pale coral wash (`#E8A598`), striking through the text in soft muted grey (`#B5AAA7`) to give rewarding, pressure-free closure.

### Input Fields
- Background: `#FFFFFF`. Border: `1.5px solid #E5DCD4`.
- Focus state: Border transitions to `#D9777F` with a soft outer ring: `box-shadow: 0 0 0 3px rgba(217, 119, 127, 0.2)`. Placeholder text sits in warm neutral `#A89C98`.

### Focus Visualizer (Unique ADHD Support Component)
- A non-intrusive circular or linear timer bar that fills using a soft gradient from `#E8A598` to `#D9777F`.
- Displays the remaining focus duration in large, rounded digits (`timer-display`) without aggressive ticking or stressful red countdown flashes.
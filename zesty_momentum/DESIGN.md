---
name: Zesty Momentum
colors:
  surface: '#f0ffd8'
  surface-dim: '#c1e696'
  surface-bright: '#f0ffd8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#dcffb2'
  surface-container: '#d5faa8'
  surface-container-high: '#cff4a3'
  surface-container-highest: '#c9ee9e'
  on-surface: '#0f2000'
  on-surface-variant: '#424936'
  inverse-surface: '#1e3700'
  inverse-on-surface: '#d7fdab'
  outline: '#727a64'
  outline-variant: '#c1cab0'
  surface-tint: '#416900'
  primary: '#416900'
  on-primary: '#ffffff'
  primary-container: '#84cc16'
  on-primary-container: '#315200'
  inverse-primary: '#91db2a'
  secondary: '#3f6a00'
  on-secondary: '#ffffff'
  secondary-container: '#aef35e'
  on-secondary-container: '#426e00'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#deb400'
  on-tertiary-container: '#594700'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf847'
  primary-fixed-dim: '#91db2a'
  on-primary-fixed: '#102000'
  on-primary-fixed-variant: '#304f00'
  secondary-fixed: '#b1f661'
  secondary-fixed-dim: '#96d947'
  on-secondary-fixed: '#0f2000'
  on-secondary-fixed-variant: '#2e4f00'
  tertiary-fixed: '#ffe083'
  tertiary-fixed-dim: '#eec200'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f0ffd8'
  on-background: '#0f2000'
  surface-variant: '#c9ee9e'
typography:
  display:
    fontFamily: Bricolage Grotesque
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.015em
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
  space-2xl: 3rem
---

## Brand & Style

This design system is tailored for the daily schedule view of an ADHD executive-function companion built for pre-teens (around age 11). The visual philosophy merges high-dopamine gamification with structured sensory grounding: vibrant, hyper-energetic chartreuse and apple-lime accents signal progress and excitement, while warm olive-sage underpinnings prevent visual exhaustion and overstimulation.

The design movement blends **Tactile Skeuomorphism** with **Playful Neomorphism**. Interactive elements mimic punchy physical toggles, chunky tactile buttons, and bouncy milestone stamps. Transitions between schedule blocks feel rewarding rather than punitive. Complex daily timelines are partitioned into digestible, pill-shaped physical capsules, transforming task switching from a point of executive fatigue into an empowering micro-game.

## Colors

The palette departs intentionally from standard calm blues and corporate emerald tones (#10B981) to avoid the look of a school administrative portal or chore tracker. It centers on bright chartreuse (#84CC16) for positive feedback loops and daily focus targets, reinforced by deep olive-leaf neutrals and warm citrus highlights.

- **Primary (`#84CC16` - Electric Chartreuse):** The hero dopamine trigger. Used for active time blocks, completed mission badges, primary action triggers, and celebration bursts.
- **Secondary (`#65A30D` - Crisp Apple):** A deeper, high-contrast vegetative green used for active border outlines, focus indicators, and structural UI elements requiring crisp definition against light backgrounds.
- **Tertiary (`#FACC15` - Warm Sunburst):** A secondary reward color used for XP chips, streak tallies, dynamic countdown warnings, and current-time indicator beacons.
- **Neutral (`#365314` - Deep Moss):** A rich, organic dark-olive that replaces harsh pure black for all typography and structural iconography. It preserves extreme readability without triggering the sensory glare of high-contrast pitch black on stark white.
- **Surface Backgrounds:** Off-white surfaces tinted with warm pear milk (`#F7FEE7` and `#ECFCCB`) form gentle, low-fatigue card backdrops that clearly distinguish today's dynamic schedule from the monthly calendar screen.

## Typography

Typography prioritizes extreme clarity alongside expressive charm. **Bricolage Grotesque** handles all headers and milestone achievements; its playful loops, idiosyncratic ink traps, and bold rhythmic curves resonate with young users without feeling childish. 

**Atkinson Hyperlegible Next** provides the functional backbone for task descriptions, time stamps, checklist entries, and sub-steps. Designed specifically to differentiate ambiguous character shapes (such as `1`, `l`, and `I`), it drastically reduces cognitive load and reading fatigue for neurodivergent kids navigating multi-step transitions.

## Layout & Spacing

The daily schedule interface uses a single-column, flow-centric layout on mobile devices (4 to 6 columns) to keep attention strictly on "Now" and "Next," eliminating peripheral distractions. On tablets and desktop screens, it transitions into an 8-to-12 column view featuring a fixed, pill-shaped focus sidebar beside the active schedule stream.

Spacing relies on a comfortable 8pt rhythmic base. Spacing tokens (`space-sm` through `space-xl`) govern generous gaps between time slots, preventing accidental taps and visual clutter. Outer margins scale dynamically across form factors while preserving large interactive hit targets (minimum 48px touch targets across all breakpoints).

## Elevation & Depth

Visual hierarchy uses **Tactile Tonal Layering** accompanied by chunky, directional drop shadows rather than blurry ambient elevation. Elements feel like physical game pieces that invite touch.

- **Base Layer (Level 0):** The app canvas rests on `#F7FEE7` (Pale Pear Dew).
- **Resting Container (Level 1):** Schedule cards and resting blocks sit on `#FFFFFF` or `#ECFCCB` with a solid offset base border: `0 4px 0 0 #D9F99D` and a crisp 1.5px structural outline in `#BEF264`.
- **Raised / Active Task (Level 2):** The current ongoing time block pops from the canvas using a physical offset shadow: `0 6px 0 0 #4D7C0F`, paired with an interior luminous top glow (`inset 0 1px 0 0 rgba(255,255,255,0.6)`).
- **Floating HUD (Level 3):** Fixed navigation capsules, quick-add triggers, and active timers hover above the feed with a dynamic dual-layer shadow: `0 10px 24px -4px rgba(54, 83, 20, 0.15), 0 4px 0 0 #365314`.
- **Pressed State:** All interactive elements physically depress on touch by translating down 3px along the Y-axis and collapsing their lower block shadow to 1px, providing clear physical confirmation of input.

## Shapes

The design system employs **pill-shaped geometry (`roundedness: 3`)**. Smooth, friendly curvatures eliminate harsh, sharp corners that induce stress or feel institutional. 

Small interactive elements (tags, badges, toggles, buttons) use fully rounded pill radii (`9999px`). Schedule cards, task groups, and modal drawers utilize oversized 2rem to 3rem (`rounded-lg` and `rounded-xl`) corner radii, reinforcing a safe, friendly, and game-cartridge aesthetic.

## Components

### Buttons
Buttons feature chunky, physical styling with bold typography and full pill profiles.
- **Primary Button:** Solid chartreuse `#84CC16` fill, deep moss `#365314` text, with a 3px solid underside shadow (`#65A30D`). On press, the button shifts down 2px with an immediate bounce transition.
- **Secondary Button:** Surface tint `#ECFCCB`, border 2px solid `#84CC16`, text `#365314`.
- **Celebration Button:** Shimmering gradient from `#84CC16` to `#A3E635` used exclusively for finishing daily quest routines.

### Task Schedule Cards
- **Upcoming Block:** Enclosed in a white card with an `#E2E8F0` hairline border and rounded 2rem corners. Displays time tags in subtle sage pills.
- **Active ("Now") Block:** Highlighted with a 3px outer border of `#84CC16`, a warm background gradient tint (`#F7FEE7` to `#FFFFFF`), an animated glowing pill badge labeled "IN PROGRESS", and prominent tactile sub-step checkboxes.
- **Completed Block:** Flattens to a subtle `#F4FCE3` container; header text strikes through with an animated green check and an earned XP chip.

### Checkboxes & Step Completers
Custom 32px circular pill targets. Incomplete states feature an empty, double-bordered ring (`#A3E635`). Checking triggers a tactile burst animation, filling the ring with `#84CC16`, followed by a crisp `#FFFFFF` checkmark and an audible haptic vibration.

### Chips & Time Badges
Small, tactile capsules (`height: 28px`, fully rounded).
- **Time Capsule:** Deep moss text on `#D9F99D` pill background.
- **Reward / XP Tag:** Warm sunburst `#FACC15` pill with dark olive text and a star icon.
- **Category Pill:** Muted olive-sage tones designating school, movement, creative play, or wind-down.

### Progress & Timers (Focus Capsule)
A pill-shaped persistent countdown bar for the current routine. Displays an energetic fluid fill in `#84CC16` pulsing within an olive track (`#ECFCCB`), accompanied by bold remaining-minute counters in `Bricolage Grotesque`.

### Input Fields
Inputs use generous 1rem internal padding and a 2rem border radius, featuring a warm cream background (`#FEFCE8`) and a 2px outline in `#D9F99D`. When focused, the outline expands to 3px in `#84CC16` with a soft chartreuse glow.
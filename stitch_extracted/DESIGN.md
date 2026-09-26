---
name: Cyber Campus Spatial Engine
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '800'
    lineHeight: 4rem
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.6rem
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.4rem
    letterSpacing: 0em
  label-tech-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.02em
  label-tech-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 0.95rem
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a high-precision, cyber-academic aesthetic tailored for mission-critical campus operations, spatial asset orchestration, and computational resource management. Built over a PostgreSQL Generalized Search Tree (GiST) indexing engine, the interface must project architectural authority, mathematical accuracy, and continuous situational awareness.

The visual style combines dark-mode technical minimalism with translucent glassmorphic surfaces. Visual density is calibrated for deep-work command centers, facilities registrars, and automated scheduling diagnostics:
- **Atmosphere:** Deep void slate canvas layered with micro-luminance borders, linear neon vector accents, and deep atmospheric glows.
- **Glassmorphism:** Frosted translucent surfaces with backdrop blurring, crisp semi-transparent borders, and internal ambient specular highlights that separate dynamic spatial data from static operational layouts.
- **Precision Data Visualization:** High-legibility monospaced markers for temporal bounds, spatial exclusion constraints, room identifiers, and index status.

## Colors

The palette operates in strict dark mode, establishing an ultra-deep canvas to emphasize luminescent state representations and GiST spatial overlaps without chromatic fatigue.

### Surface Architecture
- **Canvas Base:** `#0a0e17` (Deep Obsidian Slate)
- **Primary Panel Glass:** `#0f172a` applied at 70% to 85% opacity with backdrop blur.
- **Elevated Interactive Surface:** `#1e293b` applied at 60% to 90% opacity.
- **Specular Glow / Highlights:** `rgba(255, 255, 255, 0.08)` for 1px perimeter inset strokes and micro-dividers.

### Core Accents & Gradients
- **Primary Kinetic Accent:** Linear gradient from `#6366f1` (Indigo-500) to `#8b5cf6` (Purple-500) angled at 135deg, deployed on active command triggers, current timeline heads, and confirmed resource reservations.
- **Telemetry Cyan:** `#06b6d4` reserved for spatial query markers, vector bounding boxes, real-time node pings, and GiST algorithmic search pathways.

### State & Spatial Collision Identifiers
- **Free / Available:** `#10b981` (Emerald) with soft surface tint `rgba(16, 185, 129, 0.15)`. Indicates open temporal slots and zero intersection conflicts.
- **Occupied / Collision:** `#f43f5e` (Rose) with background fill `rgba(244, 63, 94, 0.15)`. Signals active occupancy or an aggregate exclusion lock collision `(&&)`.
- **Pending Check-in:** `#f59e0b` (Amber) accompanied by an active luminescent radial pulse (`rgba(245, 158, 11, 0.35)`). Represents reserved slots awaiting physical validation.
- **Maintenance / Lockout:** `#a855f7` (Royal Purple) with fill `rgba(168, 85, 247, 0.15)`. Denotes physical maintenance, inspection, or administrative lock.
- **Cleaning Buffer Interval:** Base tone `#818cf8` displayed as a repeating 45-degree diagonal stripe pattern (`repeating-linear-gradient(45deg, rgba(129, 140, 248, 0.12), rgba(129, 140, 248, 0.12) 8px, transparent 8px, transparent 16px)`).

## Typography

The typographic hierarchy implements a dual-engine model: **Plus Jakarta Sans** provides structural elegance and high legibility across natural language headers, status summaries, and interface navigational layers; **JetBrains Mono** delivers fixed-pitch technical readouts, operational telemetry, timestamp range bounds (`tsrange`), hardware MAC addresses, GiST constraint locks, and spatial matrix IDs.

- **Numerics & Metadata:** All mathematical values, timestamps, and space codes use tabular lining numbers via JetBrains Mono.
- **Case Formatting:** Engine logs, GiST predicates, and room hardware keys must render in uppercase monospaced text.
- **Contrast & Legibility:** Sub-headlines and secondary annotations rely on muted neutral tints (`#94a3b8`) rather than font weight reduction to preserve scanability on dark displays.

## Layout & Spacing

The layout is structured around a 12-column dense fluid grid anchored by persistent spatial monitor docks and operational sidebars.

### Grid & Breakpoints
- **Desktop (>= 1280px):** 12-column layout, 24px (`1.5rem`) gutters, 32px (`2rem`) screen safe-margins. Accommodates two persistent auxiliary panels (spatial hierarchy tree + GiST conflict queue) alongside the central interactive 2.5D campus schedule map.
- **Tablet (768px - 1279px):** 8-column layout, 16px (`1rem`) gutters, 24px (`1.5rem`) margins. Collapses structural sidebars into slide-over glass sheets; schedule converts to single-axis time ribbon.
- **Mobile (< 768px):** 4-column layout, 12px (`0.75rem`) gutters, 16px (`1rem`) margins. Stacks conflict inspection cards vertically below room selectors.

### Spacing Cadence
Interior padding uses strict multi-factor 4px base increments: micro-chips and status tags utilize `space-xs` and `space-sm`, data cell records adhere to `space-md`, and primary cybernetic dashboard cards use `space-lg` to prevent visual collision between adjacent translucent containers.

## Elevation & Depth

Visual depth avoids opaque elevations, relying instead on layered translucency, physical refraction, and directional specular glows.

### Elevation Layers
- **Level 0 (Canvas Base):** Deep solid `#0a0e17` with a non-repeating sub-surface radial gradient: `radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.07) 0%, transparent 70%)`.
- **Level 1 (Structural Shells & Timelines):** Surface `#0f172a` at 75% opacity, `backdrop-filter: blur(16px)`, outlined by a 1px border of `rgba(255, 255, 255, 0.07)`.
- **Level 2 (Interactive Cards & Overlap Inspects):** Surface `#1e293b` at 65% opacity, `backdrop-filter: blur(24px)`, subtle box shadow `0 8px 32px -4px rgba(0, 0, 0, 0.5)`. Inset highlight stroke `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`.
- **Level 3 (Modals, Conflict Resolution Overlays, Diagnostics):** Surface `#0f172a` at 92% opacity, `backdrop-filter: blur(32px)`, 1px border tinted with Primary Cyan `rgba(6, 182, 212, 0.3)`, cast shadow `0 20px 48px -8px rgba(0, 0, 0, 0.75), 0 0 24px 0 rgba(6, 182, 212, 0.15)`.

### Specular & Conflict Lighting
Shadows are tinted by surface state. A conflict-detected card sheds an ambient outer aura of `0 0 20px rgba(244, 63, 94, 0.25)`. A selected node emits a focused cyan beam `0 0 16px rgba(6, 182, 212, 0.3)`.

## Shapes

The geometric framework balances technical rigor with modern ergonomics using Level 2 roundedness:
- Standard control elements, input fields, badges, and spatial chips utilize `0.5rem` (8px) corner radii.
- Dashboard modules, map containers, and temporal grid panels use `rounded-lg` (`1rem` / 16px).
- Modal dial-outs, conflict-resolution flyouts, and command palette overlays use `rounded-xl` (`1.5rem` / 24px).
- Internal timeline blocks maintain a slightly tighter corner radius (4px to 6px) to maintain geometric rhythm when multiple reservations sit flush against cleaning buffers.

## Components

### Buttons
- **Primary Kinetic:** Background gradient `linear-gradient(135deg, #6366f1, #8b5cf6)`, text white, `Plus Jakarta Sans` 600 weight. Active state features a 1px cyan rim `box-shadow: inset 0 0 0 1px rgba(6, 182, 212, 0.5)`.
- **Ghost/Tertiary:** Transparent background, border `1px solid rgba(255, 255, 255, 0.12)`, hover reveals `rgba(30, 41, 59, 0.6)` with backdrop blur.
- **Conflict Resolve Trigger:** Background `rgba(244, 63, 94, 0.15)`, text `#f43f5e`, border `1px solid rgba(244, 63, 94, 0.4)`, hover shifts to `#f43f5e` fill with `#0a0e17` text.

### Interactive Resource Cards
- Constructed with `#0f172a` glass (80% alpha, 16px blur) and a 1px border of `rgba(255, 255, 255, 0.08)`.
- Features an upper-right monospace chip showcasing room capacity, GiST spatial lock status, and equipment bitmasks.
- Hover states initiate a subtle top-border illumination via an indigo-to-cyan gradient sweep.

### Status Indicators & Chips
- **Monospace Pill Badges:** Border radius `9999px`, padding `0.2rem 0.6rem`, font `JetBrains Mono` at `code-sm`.
- **Pending Pulse Chip:** Amber text on `rgba(245, 158, 11, 0.15)` with an interior 6px dot executing an infinite 1.5s ease-in-out box-shadow expansion: `0 0 0 0 rgba(245, 158, 11, 0.6)` to `0 0 0 6px transparent`.
- **Buffer Block:** Striped diagonal styling using `#818cf8` across scheduled intervals, indicating automated turnover, HVAC cycling, or sanitization lockouts.

### Input Fields & SQL Filter Selectors
- Background `#0a0e17` with 60% opacity, border `1px solid rgba(255, 255, 255, 0.1)`. Typography in `JetBrains Mono`.
- Focus state switches border color to `#06b6d4` with a glow: `box-shadow: 0 0 12px rgba(6, 182, 212, 0.25)`.
- Placeholder text tinted to muted slate `#64748b`.

### GiST Conflict Visualizer Panel
- Displays overlapping spatio-temporal reservations side by side.
- Conflicting time segments are bound within an accented `#f43f5e` outline containing animated diagonal warning stripes and an overlay detailing the PostgreSQL conflict predicate: `tsrange && EXCLUDE USING gist`.
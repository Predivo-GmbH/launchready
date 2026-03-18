---
name: brand-guidelines
description: >
  LaunchReady brand guidelines and design system. Enforces the dark-only website audit
  SaaS design language: zinc-dark backgrounds, blue primary accent, score-driven status
  colors. Applies brand tokens, component patterns, and visual standards across all generated UI.
  Use when building or modifying any LaunchReady frontend component, page, or visual element.
user-invocable: false
---

# LaunchReady Brand Guidelines

Every UI element generated for LaunchReady MUST follow these brand rules. No exceptions.

## Brand Identity

- **Name:** LaunchReady
- **Tagline:** Post-launch website audit — AI-powered SEO, performance, and security checks
- **Aesthetic:** Dark, technical, data-driven — like a developer tool that non-developers can use
- **Theme:** Dark only. No light mode. `bg-zinc-950` base.
- **Stack:** Next.js 16 (static export) + Tailwind CSS 4 + custom components
- **Icons:** lucide-react
- **Charts:** SVG ScoreRing (custom)
- **No UI library** — all components are custom (no shadcn, no Radix)
- **Class utilities:** `clsx` + `tailwind-merge` via `cn()` helper

## Color System

Uses Tailwind utility classes directly. No CSS custom properties.

### Backgrounds (Zinc Scale)
| Class | Usage |
|-------|-------|
| `bg-zinc-950` | Page background (darkest) |
| `bg-zinc-900` | Cards, panels |
| `bg-zinc-800` | Inputs, secondary buttons |
| `bg-zinc-800/50` | Subtle overlay |
| `bg-zinc-800/30` | Very subtle background |
| `bg-black/60` | Modal backdrop |
| `bg-white/5` | Hover state overlay |

### Text (Zinc Scale)
| Class | Usage |
|-------|-------|
| `text-white` | Primary text, headings |
| `text-zinc-300` | Secondary text |
| `text-zinc-400` | Tertiary text, nav links |
| `text-zinc-500` | Placeholder, disabled |
| `text-zinc-600` | Heavily muted |

### Borders
| Class | Usage |
|-------|-------|
| `border-zinc-800` | Primary borders |
| `border-zinc-800/50` | Subtle borders |
| `border-zinc-700` | Input borders |

### Primary Brand (Blue)
| Class | Usage |
|-------|-------|
| `bg-blue-600` | Primary button |
| `bg-blue-500` | Button hover |
| `bg-blue-500/10` | Badge/alert bg |
| `bg-blue-500/20` | Icon container bg |
| `bg-blue-500/5` | Section bg tint |
| `text-blue-400` | Links, accent text |
| `text-blue-300` | Link hover |
| `border-blue-500` | Accent border |
| `border-blue-500/20` | Subtle accent border |

### Status Colors (Score-Driven)
| Score Range | Text | Background | SVG Stroke |
|-------------|------|-----------|------------|
| >= 90 (Pass) | `text-green-500` | `bg-green-500/10` | `stroke-green-500` |
| >= 70 (OK) | `text-yellow-500` | `bg-yellow-500/10` | `stroke-yellow-500` |
| >= 50 (Warn) | `text-orange-500` | `bg-orange-500/10` | `stroke-orange-500` |
| < 50 (Fail) | `text-red-500` | `bg-red-500/10` | `stroke-red-500` |

## Typography

**Font:** Inter exclusively (weights 400-900, Google Fonts)

| Level | Size | Weight | Extra | Usage |
|-------|------|--------|-------|-------|
| Hero | `text-4xl sm:text-5xl lg:text-6xl` | 800-900 | `tracking-tight leading-tight` | Landing hero |
| H2 | `text-2xl` | 700 | `tracking-tight` | Section headings |
| H3 | `text-xl` | 600 | — | Card/dialog titles |
| Body lg | `text-lg` | 400 | `leading-relaxed` | Body large |
| Body | `text-base` / `text-sm` | 400-500 | — | Standard body |
| Caption | `text-xs` | 500 | — | Small text, captions |
| Label | `text-xs` | 500-600 | `uppercase tracking-wide` | Category labels |

## Layout

| Element | Value |
|---------|-------|
| Site container | `max-w-6xl mx-auto` |
| Audit results width | `max-w-4xl` |
| Pricing section | `max-w-5xl` |
| Form/content width | `max-w-2xl` |
| Modal width | `max-w-md` (448px) |
| Navbar height | `h-14` (56px) |
| Navbar | `sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800` |

### Responsive Breakpoints
| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Text scaling, grid 1→2 cols |
| `md` | 768px | Grid 1→3 cols, layout shifts |
| `lg` | 1024px | Full desktop, text-6xl hero |

### Grid Patterns
- 4-col stats: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- 3-col pricing: `grid grid-cols-1 md:grid-cols-3 gap-6`
- Flex stack: `flex flex-col gap-8`

## Border Radii

| Token | Usage |
|-------|-------|
| `rounded-full` | Badges, pills, score rings |
| `rounded-2xl` | Large cards, modals |
| `rounded-xl` | Standard cards, buttons |
| `rounded-lg` | Inputs, smaller cards |
| `rounded-md` | Small elements |

## Components

### Buttons
- **Primary:** `bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors`
- **Secondary:** `bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors`
- **Text:** `text-zinc-400 hover:text-white transition-colors`
- **Disabled:** `disabled:bg-zinc-700 disabled:text-zinc-500 disabled:opacity-50`
- **Focus:** `focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`

### Cards
- Standard: `rounded-2xl border border-zinc-800 bg-zinc-900`
- Highlighted: `border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10`
- Subtle: `rounded-lg border border-zinc-800 bg-zinc-800/30`
- Padding: `p-6` to `p-8`

### Inputs
- `w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white`
- `placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors`
- OTP digit: `w-11 h-13 text-center text-xl font-bold bg-zinc-800 border border-zinc-700 rounded-lg`

### Badges
- `inline-flex items-center gap-2 px-4 py-1.5 rounded-full`
- `bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium`
- Issue count: `px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full`

### Score Ring (Custom SVG)
- Size: 120px default (scalable)
- Stroke width: 8px
- Background ring: `text-zinc-800`
- Progress: color from `scoreRingColor(score)` function
- Text: score number centered, `font-bold`
- Animation: `duration-1000` fill transition
- Rotation: `-90deg` (progress starts from top)

### Modals
- Overlay: `fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center`
- Content: `bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full relative`
- Close: `absolute top-4 right-4 text-zinc-500 hover:text-white`

### Navbar
- `border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50`
- Height: `h-14`
- Links: `text-sm text-zinc-400 hover:text-white transition-colors`
- Mobile: hamburger menu below `sm`, desktop nav at `sm`+

## Animations

- **Transitions:** `transition-colors` on all interactive elements (150ms default)
- **Loading spinner:** `animate-spin` (Loader2 icon)
- **Skeleton loading:** `animate-pulse`
- **Score ring fill:** `duration-1000` stroke animation
- **No Framer Motion** — Tailwind transitions only

### Hover States
- Primary button: `hover:bg-blue-500`
- Secondary button: `hover:bg-zinc-700`
- Cards: `hover:bg-white/5`
- Links: `hover:text-white` or `hover:text-blue-300`

### Disabled States
- `disabled:bg-zinc-700 disabled:text-zinc-500`
- `disabled:opacity-50`

## Score Color Functions
```
scoreColor(score):
  >= 90 → text-green-500
  >= 70 → text-yellow-500
  >= 50 → text-orange-500
  < 50  → text-red-500

scoreRingColor(score):
  >= 90 → stroke-green-500
  >= 70 → stroke-yellow-500
  >= 50 → stroke-orange-500
  < 50  → stroke-red-500
```

## Audit Categories
| Key | Label |
|-----|-------|
| `meta` | Meta Tags |
| `social` | Social Sharing |
| `indexability` | Indexability |
| `performance` | Performance |
| `accessibility` | Accessibility |
| `security` | Security |
| `structure` | Site Structure |

## Mandatory Rules

### ALWAYS
- Use Tailwind utility classes directly (no CSS custom properties)
- Dark mode only — `bg-zinc-950` page background, `bg-zinc-900` cards
- Use `text-white` for primary text, zinc scale for hierarchy
- Use blue-600/500 for primary actions and brand accent
- Use score-driven status colors (green/yellow/orange/red based on thresholds)
- Use `rounded-2xl` for cards, `rounded-xl`/`rounded-lg` for buttons/inputs
- Use `transition-colors` on all interactive elements
- Use Inter font exclusively
- Use `tracking-tight` on hero/section headings
- Use lucide-react for all icons
- Use `cn()` helper (clsx + tailwind-merge) for class composition
- Show `animate-spin` (Loader2) for loading states

### NEVER
- Add a light mode — LaunchReady is dark-only
- Use CSS custom properties for colors — use Tailwind classes directly
- Use shadcn/ui or Radix — all components are custom
- Use Framer Motion — use Tailwind transitions
- Use colors outside the zinc + blue + status palette
- Hardcode score colors — always use `scoreColor()`/`scoreRingColor()` functions
- Use shadows except on highlighted cards (`shadow-lg shadow-blue-500/10`)
- Use warm colors — LaunchReady is cool and technical

# BusPronto Design System (Apple Brand Preset)

<!-- ricoui:design-system apple-brand -->

This document establishes the official design system for **BusPronto**, based on the **RICOUI Apple Brand specification** and Apple Human Interface Guidelines (HIG). All user interfaces, components, and styling updates must adhere to the rules defined below.

---

## 1. Design Philosophy & Principles

1. **Clarity & Deference**: Content is king. The interface recedes into the background so that schedules, countdown timers, and bus routes stand out with maximum legibility.
2. **Depth & Materials (Frosted Glass / Vibrancy)**: Use semi-transparent layered surfaces with blur and saturation to create visual hierarchy and depth without clutter.
3. **Fluid Micro-interactions**: Smooth transitions with Apple-standard cubic-bezier motion curves (`0.25, 1, 0.5, 1`) and subtle press scale feedback (`scale(0.985)`).
4. **Mobile-First Ergonomics**: Easy one-thumb reachability, clean rounded corners (squircles), and pill-shaped navigation.

---

## 2. Color Palette & Tokens

### Backgrounds & Surfaces (Dark OLED)
| Token | Value | Description |
|---|---|---|
| `--bg-color` | `#000000` | Pure pitch black background (battery-efficient, high contrast) |
| `--surface-color` | `#1c1c1e` | iOS System Background Secondary (Cards & List items) |
| `--surface-elevated` | `#2c2c2e` | iOS System Background Tertiary (Hover, Active, Modals) |
| `--surface-border` | `rgba(255, 255, 255, 0.08)` | Specular boundary border |
| `--surface-border-subtle` | `rgba(255, 255, 255, 0.05)` | Inner dividers and subtle separators |

### Text Hierarchy
| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#f5f5f7` | Apple Off-White for headers and main labels |
| `--text-secondary` | `#86868b` | Neutral Gray for subtitles, captions, and secondary info |
| `--text-tertiary` | `#6e6e73` | Darker Gray for disabled states and metadata timestamps |

### Apple System Accents
| Token | Value | Usage |
|---|---|---|
| `--accent-primary` | `#0a84ff` | Apple System Blue (Primary actions, links, active tab) |
| `--accent-primary-hover` | `#0071e3` | Active / Hover blue state |
| `--accent-secondary` | `#5e5ce6` | Apple Indigo (Highlights, badges) |
| `--success` | `#30d158` | Apple System Green (On-time, active routes, success) |
| `--error` | `#ff453a` | Apple System Red (Missed buses, critical alerts, errors) |
| `--warning` | `#ff9f0a` | Apple System Orange (Delays, cautionary notices) |

### Ad Category Themes
| Category | Gradient Start | Gradient End |
|---|---|---|
| Restaurant / Food | `#ff6b6b` | `#ff8e53` |
| Entrepreneur / Store | `#6366f1` | `#a855f7` |
| Local Business | `#30d158` | `#0a84ff` |
| Default | `#64748b` | `#475569` |

---

## 3. Typography

- **Font Family**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`
- **Font Smoothing**: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`
- **Tracking (Letter Spacing)**:
  - Titles / Display: `-0.02em`
  - Body / Subtitles: `-0.01em`
  - All-caps labels / Badges: `+0.04em`

---

## 4. Materials & Elevation

### Standard Frosted Glass (`.glass-card`)
```css
.glass-card {
  background: rgba(28, 28, 30, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--surface-border);
  border-radius: 1.25rem; /* 20px */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
}
```

### Floating Capsule (`.glassPill`)
```css
.glassPill {
  background: rgba(28, 28, 30, 0.82);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 36px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
}
```

---

## 5. Corner Radii & Geometry

- **Small (Badges, Chips, Tags)**: `0.5rem` (8px)
- **Medium (Inputs, Buttons, Cards)**: `0.75rem` - `1rem` (12px - 16px)
- **Large (Containers, Dialogs, Main Cards)**: `1.25rem` - `1.5rem` (20px - 24px)
- **Capsule / Pill (Nav, Toggle buttons, Floating badges)**: `9999px`

---

## 6. Motion & Transitions

- **Standard Apple Ease**: `cubic-bezier(0.25, 1, 0.5, 1)`
- **Spring Transition**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Interactive Feedback (Buttons & Links)**:
  - On Hover: `transform: translateY(-1px)`
  - On Active / Tap: `transform: scale(0.985)`

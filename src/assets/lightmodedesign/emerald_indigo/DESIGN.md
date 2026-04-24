---
name: Emerald & Indigo
colors:
  surface: '#f8faf6'
  surface-dim: '#d8dbd7'
  surface-bright: '#f8faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f1'
  surface-container: '#eceeeb'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e1e3e0'
  on-surface: '#191c1b'
  on-surface-variant: '#404944'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#eff1ee'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#5654a8'
  on-secondary: '#ffffff'
  secondary-container: '#a7a5ff'
  on-secondary-container: '#393689'
  tertiary: '#4f1f19'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b342d'
  on-tertiary-container: '#ea9e93'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#100563'
  on-secondary-fixed-variant: '#3e3c8f'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#380d08'
  on-tertiary-fixed-variant: '#6e372f'
  background: '#f8faf6'
  on-background: '#191c1b'
  surface-variant: '#e1e3e0'
typography:
  display:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  margin: 20px
  gutter: 16px
---

## Brand & Style
The brand personality is rooted in "Modern Luxury"—a shift away from utilitarian corporate aesthetics toward an editorial, high-end experience. It targets high-performing professionals who value clarity and sophistication. The UI evokes a sense of calm authority and quiet confidence.

The design style combines **Minimalism** with subtle **Glassmorphism**. It relies on high-quality typography, a restrained color palette, and expansive whitespace to create a sense of premium space. Surfaces feel light and airy, utilizing soft gradients and translucent layers rather than heavy structural lines to define hierarchy.

## Colors
This design system utilizes a sophisticated bi-chromatic foundation. The primary palette revolves around **Deep Emerald** and **Rich Indigo**, creating a professional yet distinctive alternative to standard blue CRMs. 

**Light Mode:** Uses a warm off-white (`#FDFCFB`) for base surfaces to avoid clinical coldness. Soft Sage (`#D1FAE5`) is used for subtle backgrounds and success states.
**Dark Mode:** Transitions to a deep Navy-Slate (`#0F172A`) base, maintaining high contrast with muted Violet accents and Emerald highlights.
**Gradients:** Use linear gradients from Primary to Secondary colors at low opacity (10-15%) for container backgrounds to add depth without weight.

## Typography
**Manrope** is used exclusively to maintain a modern, balanced, and highly legible interface. The typographic hierarchy is designed with generous leading (line-height) to promote readability and a "breathing" layout. 

Headlines utilize tighter letter-spacing and heavier weights to command attention, while labels for metadata use increased letter-spacing in all-caps or medium weights to ensure clarity at small scales. Color-wise, use the Primary Deep Emerald for headlines to reinforce brand identity.

## Layout & Spacing
The system employs a **fluid grid** model optimized for mobile viewpoints. A 4-column grid is the standard for compact views, expanding as needed for tablet orientations. 

The spacing rhythm is based on a **4px baseline**, but favors the larger increments (`lg` and `xl`) to maintain the "Modern Luxury" feel. Vertical rhythm is intentionally loose; sections should be separated by at least `xxl` spacing to prevent the CRM data from feeling cluttered. Content margins are set to a generous `20px` to keep elements away from the device edges.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and **Backdrop Blurs** rather than traditional drop shadows. 

1.  **Base Layer:** Warm off-white or deep slate.
2.  **Surface Layer:** Slight tonal shift (e.g., 2% darker or lighter) with a 1px soft-opacity stroke.
3.  **Overlay Layer:** Semi-transparent glassmorphism (15% opacity primary color with 20px background blur) for navigation bars and modal sheets.

Shadows, if used, are restricted to "Ambient Shadows": extremely diffused (30px+ blur), low opacity (less than 5%), and tinted with the Primary color (`#064E3B`) to avoid a "dirty" gray appearance.

## Shapes
The shape language is consistently **Rounded**. This softens the professional tone, making the CRM feel approachable and modern. 

-   **Standard Elements:** (Inputs, Buttons) use a `0.5rem` radius.
-   **Large Containers:** (Cards, Modals) use a `1rem` or `1.5rem` radius to emphasize the "soft" aesthetic.
-   **Interactive Indicators:** Icons or small badges may use pill-shapes (fully rounded) to contrast against the more structured card shapes.

## Components
-   **Buttons:** Primary buttons use a solid Deep Emerald fill with white text. Secondary buttons use a Soft Sage background with Emerald text. No borders.
-   **Cards:** Use a "No-Border" approach. Cards are defined by a subtle shift in surface color or an extremely soft ambient shadow. Internal padding should be `lg` (24px).
-   **Input Fields:** Ghost-style inputs with a bottom-only 1px stroke in a muted Indigo or a subtle solid fill (`#F1F5F9` in light mode). On focus, the stroke or fill should transition smoothly to the Deep Emerald.
-   **Chips/Tags:** Pill-shaped with a light Indigo or Sage tint. Text is semi-bold and slightly tracked out.
-   **Lists:** High-density data is avoided. List items have generous vertical padding (`md`) and use subtle dividers (10% opacity) that do not touch the screen edges.
-   **Navigation:** A bottom bar with glassmorphic background blur, utilizing thin Indigo icons that fill with Emerald when active.
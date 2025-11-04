# Nature-Inspired Theme Documentation

## Overview

This project uses a comprehensive nature-inspired color palette featuring ocean blues and forest greens, designed to evoke natural landscapes while maintaining excellent readability and WCAG AA/AAA compliance.

## Theme System

The theme is implemented using **Tailwind CSS v4's `@theme` directive** with CSS variables for light and dark mode support.

### Configuration Location

All theme configuration is in `/frontend/src/index.css`

## Color Palette

### Primary Colors

#### Ocean Blue (Primary)
Represents water, trust, and stability.

- `ocean-50` through `ocean-950` (11 shades)
- Used for: Primary actions, links, focus states, interactive elements

#### Forest Green (Secondary)
Represents growth, nature, and community.

- `forest-50` through `forest-950` (11 shades)
- Used for: Secondary actions, trust elements, success states

### Accent Colors

#### Sky Blue
Lighter, airier blue for backgrounds and subtle accents.

- `sky-50` through `sky-900` (10 shades)
- Used for: Hero sections, backgrounds, accent elements

#### Leaf Green
Vibrant green for energetic elements.

- `leaf-50` through `leaf-900` (10 shades)
- Used for: Success states, trust scores, active states

#### Sage Green
Muted, calming green.

- `sage-50` through `sage-900` (10 shades)
- Used for: Subtle backgrounds, secondary elements

### Semantic Colors

#### Success
- `success-50` through `success-900`
- Used for: Success messages, positive feedback, completed states

#### Warning
- `warning-50` through `warning-900`
- Used for: Warnings, caution states, pending actions

#### Danger
- `danger-50` through `danger-900`
- Used for: Errors, destructive actions, critical alerts

### Neutral Colors

#### Stone (Warm Gray)
Warm, natural neutral that complements the blues and greens.

- `stone-50` through `stone-950` (11 shades)
- Used for: Text, backgrounds, borders, surfaces

## Semantic CSS Variables

These variables automatically switch values based on light/dark mode:

### Colors

```css
--color-primary          /* Main brand color */
--color-primary-hover    /* Hover state for primary */
--color-primary-light    /* Light tint of primary */

--color-secondary        /* Secondary brand color */
--color-secondary-hover  /* Hover state for secondary */
--color-secondary-light  /* Light tint of secondary */

--color-accent          /* Accent color */
--color-accent-hover    /* Hover state for accent */
```

### Backgrounds

```css
--color-bg-primary      /* Main page background */
--color-bg-secondary    /* Secondary background (cards, sections) */
--color-bg-tertiary     /* Tertiary background (nested elements) */
```

### Text

```css
--color-text-primary    /* Primary text (headings, important text) */
--color-text-secondary  /* Secondary text (body text) */
--color-text-tertiary   /* Tertiary text (muted, helper text) */
--color-text-inverse    /* Inverse text (text on dark backgrounds) */
```

### Borders

```css
--color-border-primary   /* Primary borders */
--color-border-secondary /* Secondary borders (more subtle) */
```

### Surfaces

```css
--color-surface          /* Surface background (cards, modals) */
--color-surface-elevated /* Elevated surfaces (hover, active) */
```

## Usage Examples

### Using Tailwind Color Classes

```tsx
// Primary button
<button className="bg-ocean-600 hover:bg-ocean-700 text-white">
  Click me
</button>

// Success badge
<span className="bg-success-100 text-success-800">
  Completed
</span>

// Card with border
<div className="bg-stone-50 border border-stone-200">
  Card content
</div>
```

### Using Semantic Variables

```tsx
// These automatically adapt to light/dark mode
<div className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
  Content
</div>
```

## Dark Mode

### Enabling Dark Mode

Dark mode is controlled by adding the `dark` class to the `<html>` element:

```tsx
document.documentElement.classList.add('dark');    // Enable dark mode
document.documentElement.classList.remove('dark'); // Disable dark mode
```

### Theme Switcher Component

Use the `ThemeSwitcher` component to allow users to toggle themes:

```tsx
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

<ThemeSwitcher />
```

Features:
- Persists preference to localStorage
- Smooth transitions between modes
- Accessible with keyboard navigation
- Beautiful sun/moon icons

### Dark Mode Classes

Tailwind v4 supports the `dark:` variant:

```tsx
<div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
  This adapts to dark mode
</div>
```

## Component Color Guidelines

### Buttons

- **Primary actions**: `ocean-600` background
- **Secondary actions**: `stone-50` background with `stone-300` border
- **Danger actions**: `danger-600` background
- **Focus states**: `ocean-500` ring

### Forms

- **Borders**: `stone-300`
- **Focus ring**: `ocean-500`
- **Error text**: `danger-600`
- **Labels**: `stone-700`

### Badges

- **Primary**: `ocean-100` background, `ocean-800` text
- **Success**: `success-100` background, `success-800` text
- **Warning**: `warning-100` background, `warning-800` text
- **Danger**: `danger-100` background, `danger-800` text

### Cards

- **Background**: `stone-50` (light mode), `stone-800` (dark mode)
- **Border**: `stone-200` (light mode), `stone-700` (dark mode)
- **Shadow**: Use default shadow utilities

### Trust Elements

Trust-related components use **forest/leaf greens** to emphasize the organic, community-based nature:

```tsx
// Trust score badge
<span className="bg-success-100 text-success-800">
  Trusted
</span>

// Trust radio buttons
<input type="radio" className="text-forest-600 focus:ring-forest-500" />
```

## Design Tokens

### Spacing

```css
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 3rem      /* 48px */
--spacing-3xl: 4rem      /* 64px */
```

### Max-Width (Container Scale)

```css
--max-width-xs: 20rem    /* 320px */
--max-width-sm: 24rem    /* 384px */
--max-width-md: 28rem    /* 448px */
--max-width-lg: 32rem    /* 512px */
--max-width-xl: 36rem    /* 576px */
--max-width-2xl: 42rem   /* 672px */
--max-width-3xl: 48rem   /* 768px */
--max-width-4xl: 56rem   /* 896px */
--max-width-5xl: 64rem   /* 1024px */
--max-width-6xl: 72rem   /* 1152px */
--max-width-7xl: 80rem   /* 1280px */
```

### Border Radius

```css
--radius-sm: 0.25rem
--radius-md: 0.375rem
--radius-lg: 0.5rem
--radius-xl: 0.75rem
--radius-2xl: 1rem
--radius-full: 9999px
```

### Shadows

```css
--shadow-sm: subtle shadow
--shadow-md: medium shadow
--shadow-lg: large shadow
--shadow-xl: extra large shadow
```

Shadows automatically adjust for dark mode (stronger in dark mode).

### Typography

```css
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
--font-size-2xl: 1.5rem
--font-size-3xl: 1.875rem
--font-size-4xl: 2.25rem
--font-size-5xl: 3rem
--font-size-6xl: 3.75rem
```

## Accessibility

### Contrast Ratios

All color combinations are designed to meet **WCAG AA standards** (4.5:1 for normal text, 3:1 for large text).

Key pairings:
- `ocean-600` on white: ✅ AAA compliant (7.8:1)
- `forest-600` on white: ✅ AAA compliant (8.2:1)
- `stone-900` on white: ✅ AAA compliant (16.5:1)

### Testing Accessibility

Use browser DevTools or tools like:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Colors](https://accessiblecolors.com/)

### Focus States

All interactive elements have clear focus indicators using `ocean-500` ring:

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-ocean-500">
  Accessible button
</button>
```

## Best Practices

### Do's ✅

- Use semantic color names (`ocean`, `forest`, `success`) over specific shades
- Use dark mode variants for all colored elements
- Maintain consistent focus states with `ocean-500`
- Use `stone` neutrals for text and borders
- Test in both light and dark modes

### Don'ts ❌

- Don't use raw hex colors (use theme colors)
- Don't skip dark mode variants
- Don't use inconsistent focus colors
- Don't use gray (use `stone` instead)
- Don't hardcode colors in components

## Color Psychology

### Ocean Blue
- **Feeling**: Trust, stability, professionalism
- **Use for**: Primary actions, navigation, important CTAs

### Forest Green
- **Feeling**: Growth, harmony, community
- **Use for**: Trust, success, secondary actions

### Sage Green
- **Feeling**: Calm, balance, wisdom
- **Use for**: Backgrounds, subtle accents

### Sky Blue
- **Feeling**: Freedom, openness, clarity
- **Use for**: Hero sections, inspiration, space

## Migration Guide

### From Old to New Colors

```tsx
// Old
bg-blue-600    → bg-ocean-600
bg-green-100   → bg-success-100 or bg-forest-100
bg-red-600     → bg-danger-600
bg-yellow-100  → bg-warning-100
bg-gray-900    → bg-stone-900

// Old
text-blue-800  → text-ocean-800
text-gray-700  → text-stone-700
text-red-600   → text-danger-600

// Old
border-gray-300 → border-stone-300
```

## Future Enhancements

Possible additions to the theme system:

1. **Auto theme detection**: Detect system preference with `prefers-color-scheme`
2. **Custom theme builder**: Allow users to customize colors
3. **High contrast mode**: Enhanced accessibility mode
4. **Color blind modes**: Palette adjustments for color blindness
5. **Print styles**: Optimized colors for printing

## Support

For questions or issues with the theme system:
1. Check this documentation
2. Review `/frontend/src/index.css` for theme configuration
3. Inspect components in `/frontend/src/components/common/` for examples

---

**Theme Version**: 1.0.0
**Last Updated**: 2025-11-02
**Tailwind Version**: 4.1.13

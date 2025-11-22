# Design Tokens

Design tokens are the visual design atoms of the design system. They are named entities that store visual design attributes. These tokens replace hard-coded values and ensure consistency across the application.

## Color Tokens

All colors use HSL (Hue, Saturation, Lightness) format with semantic naming. The system supports both light and dark modes.

### Semantic Color Variables

#### Background Colors
```css
--background: 0 0% 0%         /* Pure black base (#000000) */
--card: 0 0% 0%              /* Card backgrounds (#000000) */
--popover: 0 0% 0%           /* Popover backgrounds (#000000) */
```

#### Foreground (Text) Colors
```css
--foreground: 0 0% 100%      /* Primary text - white (#FFFFFF) */
--card-foreground: 0 0% 100% /* Card text - white (#FFFFFF) */
--muted-foreground: 0 0% 60% /* Secondary text - 60% opacity */
```

#### Border Colors
```css
--border: 0 0% 15%           /* Standard borders - 15% white */
--card-border: 0 0% 15%      /* Card borders - 15% white */
--input: 0 0% 15%            /* Input borders - 15% white */
```

#### Interactive Colors
```css
--primary: 0 0% 100%                    /* Primary CTAs - white */
--primary-foreground: 0 0% 0%           /* Text on primary - black */
--secondary: 0 0% 10%                   /* Secondary elements */
--secondary-foreground: 0 0% 100%       /* Text on secondary - white */
--accent: 0 0% 10%                      /* Accent elements */
--accent-foreground: 0 0% 100%          /* Text on accent - white */
--muted: 0 0% 10%                       /* Muted backgrounds */
```

#### Utility Colors
```css
--destructive: 0 0% 100%               /* Destructive actions - white */
--destructive-foreground: 0 0% 0%      /* Text on destructive - black */
--ring: 0 0% 100%                      /* Focus ring - white */
```

#### Elevation Colors
```css
--elevate-1: rgba(255,255,255, .04)   /* Light overlay on hover */
--elevate-2: rgba(255,255,255, .09)   /* Medium overlay on active */
```

#### Chart Colors
```css
--chart-1: 0 0% 80%
--chart-2: 0 0% 70%
--chart-3: 0 0% 60%
--chart-4: 0 0% 50%
--chart-5: 0 0% 40%
```

### Using Color Tokens in Tailwind

```tsx
// Background
<div className="bg-background">         /* Black background */
<div className="bg-card">               /* Card background */
<div className="bg-muted">              /* Subtle background */

// Text
<p className="text-foreground">         /* Primary text - white */
<p className="text-muted-foreground">   /* Secondary text - 60% opacity */

// Borders
<div className="border border-border">  /* Standard border */
<div className="border-foreground/20">  /* 20% opacity border */

// Interactive
<button className="bg-primary text-primary-foreground">  /* White bg, black text */
```

## Typography Scale

The design system uses **Playfair Display** serif font throughout for an elegant, editorial feel.

### Font Families
```css
--font-sans: 'Playfair Display', Georgia, serif
--font-serif: 'Playfair Display', Georgia, serif
--font-mono: 'Playfair Display', Georgia, serif
```

### Font Sizes
```css
text-xs     0.75rem    12px
text-sm     0.875rem   14px
text-base   1rem       16px    /* Minimum for body text */
text-lg     1.125rem   18px
text-xl     1.25rem    20px
text-2xl    1.5rem     24px
text-3xl    1.875rem   30px
text-4xl    2.25rem    36px
text-5xl    3rem       48px
text-6xl    3.75rem    60px
text-7xl    4.5rem     72px
text-8xl    6rem       96px
```

### Font Weights
```css
font-normal     400
font-medium     500
font-semibold   600
font-bold       700
```

### Line Heights
```css
leading-none      1
leading-tight     1.25
leading-snug      1.375
leading-normal    1.5
leading-relaxed   1.625
leading-loose     2
```

### Letter Spacing
```css
tracking-tighter   -0.05em
tracking-tight     -0.025em
tracking-normal    0em
tracking-wide      0.025em
tracking-wider     0.05em
tracking-widest    0.1em
```

### Typography Usage Examples
```tsx
// Display heading (hero)
<h1 className="text-5xl md:text-7xl font-bold leading-tight">

// Section heading
<h2 className="text-3xl md:text-4xl font-bold">

// Card title
<h3 className="text-xl font-semibold">

// Body text
<p className="text-base leading-relaxed">

// Caption/label
<span className="text-xs font-bold uppercase tracking-widest">
```

## Spacing Scale

Based on Tailwind's 4px base unit system.

### Spacing Values
```css
0     0px
1     0.25rem    4px
2     0.5rem     8px
3     0.75rem    12px
4     1rem       16px
5     1.25rem    20px
6     1.5rem     24px
8     2rem       32px
10    2.5rem     40px
12    3rem       48px
16    4rem       64px
20    5rem       80px
24    6rem       96px
32    8rem       128px
40    10rem      160px
48    12rem      192px
64    16rem      256px
80    20rem      320px
96    24rem      384px
```

### Common Spacing Patterns
```tsx
// Section padding
py-12        /* Mobile: 48px vertical */
py-16        /* Tablet: 64px vertical */
py-24        /* Desktop: 96px vertical */

// Container padding
px-6         /* Horizontal: 24px */

// Card padding
p-6          /* 24px all sides */
p-8          /* 32px all sides */
p-12         /* 48px all sides */

// Element spacing
gap-4        /* 16px gap in flex/grid */
gap-6        /* 24px gap in flex/grid */
gap-8        /* 32px gap in flex/grid */

// Vertical stacking
space-y-4    /* 16px between children */
space-y-6    /* 24px between children */
space-y-8    /* 32px between children */
space-y-12   /* 48px between children */
space-y-24   /* 96px between sections */
```

## Border Radius

Custom radius values for the design system.

### Border Radius Scale
```css
rounded-sm      0.1875rem    3px
rounded-md      0.375rem     6px
rounded-lg      0.5625rem    9px
rounded-xl      0.75rem      12px
rounded-2xl     1rem         16px
rounded-3xl     1.5rem       24px
rounded-full    9999px       Pill shape
```

### Usage Examples
```tsx
// Buttons
<Button className="rounded-lg">      /* 9px corners */
<Button className="rounded-xl">      /* 12px corners */

// Cards
<Card className="rounded-xl">        /* 12px corners */
<div className="rounded-2xl">        /* 16px corners */

// Pill-style elements
<div className="rounded-full">       /* Fully rounded */
```

## Shadows

The design system currently uses a **flat design approach** with minimal shadows.

### Shadow Values (Currently Disabled)
```css
--shadow-2xs: 0px 2px 0px 0px hsl(0 0% 0% / 0.00)
--shadow-xs:  0px 2px 0px 0px hsl(0 0% 0% / 0.00)
--shadow-sm:  0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00)
--shadow:     0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00)
--shadow-md:  0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 2px 4px -1px hsl(0 0% 0% / 0.00)
--shadow-lg:  0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 4px 6px -1px hsl(0 0% 0% / 0.00)
--shadow-xl:  0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 8px 10px -1px hsl(0 0% 0% / 0.00)
--shadow-2xl: 0px 2px 0px 0px hsl(0 0% 0% / 0.00)
```

Note: Depth is achieved through the elevation system (overlays) rather than drop shadows.

## Breakpoints

Mobile-first responsive breakpoints.

### Breakpoint Scale
```css
xs      0px         /* Mobile (default) */
sm      640px       /* Large mobile */
md      768px       /* Tablet */
lg      1024px      /* Desktop */
xl      1280px      /* Large desktop */
2xl     1536px      /* Extra large desktop */
```

### Usage in Tailwind
```tsx
// Single column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive text sizing
<h1 className="text-4xl md:text-6xl lg:text-7xl">

// Responsive spacing
<section className="py-12 md:py-16 lg:py-24">
```

## Z-Index Scale

Standardized layering system for stacking contexts.

### Z-Index Layers
```css
base         0       /* Default layer */
dropdown     50      /* Dropdown menus */
sticky       100     /* Sticky elements */
overlay      150     /* Modal overlays */
modal        200     /* Modal dialogs */
popover      250     /* Popovers and tooltips */
toast        300     /* Toast notifications */
```

### Usage Examples
```tsx
// Modal overlay
<div className="z-[150]">

// Modal dialog
<div className="z-[200]">

// Toast notification
<div className="z-[300]">
```

## CSS Variables Reference

All design tokens are defined as CSS variables in `client/src/index.css`:

```css
:root {
  /* Light mode variables */
}

.dark {
  /* Dark mode variables - currently active */
}
```

To use in custom CSS:
```css
.custom-element {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}
```

To use with Tailwind opacity modifiers:
```tsx
<div className="bg-foreground/20">  /* 20% opacity */
<div className="text-muted-foreground/80">  /* 80% opacity */
```

## Token Usage Best Practices

1. **Always use semantic tokens** instead of hard-coded colors
2. **Use Tailwind utilities** for consistency across the codebase
3. **Reference spacing scale** for all margins, padding, and gaps
4. **Follow typography scale** for all text sizing
5. **Use responsive modifiers** (md:, lg:) for adaptive layouts
6. **Maintain token consistency** when creating new components
7. **Test in both light and dark modes** (currently dark mode only)

## Quick Reference

```tsx
// Common color patterns
bg-background          /* Black */
bg-card                /* Card surface */
bg-muted               /* Subtle background */
text-foreground        /* White */
text-muted-foreground  /* 60% white */
border-border          /* 15% white */

// Common spacing
p-6, p-8, p-12        /* Padding */
gap-4, gap-6, gap-8   /* Flex/grid gaps */
space-y-4, space-y-8  /* Vertical spacing */

// Common typography
text-base leading-relaxed           /* Body */
text-xl font-semibold              /* Card title */
text-3xl font-bold                 /* Section heading */
text-xs font-bold uppercase tracking-widest  /* Label */
```


# Typography System

Comprehensive typography guidelines for the UX Skills Assessment application, using Playfair Display serif throughout for an elegant, editorial aesthetic.

## Typography Philosophy

- **All Serif**: Playfair Display used for all text (headings, body, UI)
- **Editorial Feel**: Inspired by high-end publishing and premium magazines
- **Hierarchy**: Size, weight, and letter-spacing create visual structure
- **Readability**: Generous line heights, 16px minimum for body text
- **Responsiveness**: Type scales up from mobile to desktop

---

## Font Families

### Primary Font: Playfair Display

```css
--font-sans: 'Playfair Display', Georgia, serif
--font-serif: 'Playfair Display', Georgia, serif
--font-mono: 'Playfair Display', Georgia, serif
```

**Usage**: All three CSS variables point to the same font family for consistency.

**Fallback Chain**: 
1. Playfair Display (Google Fonts)
2. Georgia (system serif)
3. Generic serif

### Applying Fonts

```tsx
// Default on body
<body className="font-serif">

// Explicit serif (same result)
<h1 className="font-serif">

// Sans/mono aliases (still serif)
<p className="font-sans">    {/* Actually Playfair Display */}
<code className="font-mono"> {/* Actually Playfair Display */}
```

---

## Type Scale

Complete scale from xs to 9xl with pixel conversions.

| Class | rem | px | Usage |
|-------|-----|----|----|
| `text-xs` | 0.75rem | 12px | Tiny labels, metadata |
| `text-sm` | 0.875rem | 14px | Small text, captions |
| `text-base` | 1rem | 16px | **Body text minimum** |
| `text-lg` | 1.125rem | 18px | Lead paragraphs |
| `text-xl` | 1.25rem | 20px | Large body, card titles |
| `text-2xl` | 1.5rem | 24px | Section subheadings |
| `text-3xl` | 1.875rem | 30px | Card headings |
| `text-4xl` | 2.25rem | 36px | Page headings |
| `text-5xl` | 3rem | 48px | Hero text (mobile) |
| `text-6xl` | 3.75rem | 60px | Hero text (tablet) |
| `text-7xl` | 4.5rem | 72px | Hero text (desktop) |
| `text-8xl` | 6rem | 96px | Score display |
| `text-9xl` | 8rem | 128px | Score display (desktop) |

### Responsive Type Scale

```tsx
// Mobile → Tablet → Desktop
<h1 className="text-4xl md:text-6xl lg:text-7xl">
<h2 className="text-2xl md:text-3xl lg:text-4xl">
<p className="text-base md:text-lg lg:text-xl">
```

---

## Text Styles

Predefined text styles for common use cases.

### Display (Hero Headlines)

Extra large text for hero sections and major announcements.

```tsx
<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
  Find Your UX Career Stage
</h1>
```

**Properties**:
- Size: 48-72px (5xl-7xl)
- Weight: font-bold (700)
- Line Height: leading-tight (1.25)
- Use: Landing hero, results stage display

### Heading 1 (Page Titles)

Main page headings.

```tsx
<h1 className="text-3xl md:text-4xl font-bold">
  Page Title
</h1>
```

**Properties**:
- Size: 30-36px (3xl-4xl)
- Weight: font-bold (700)
- Use: Page titles, major sections

### Heading 2 (Section Titles)

Section and subsection headings.

```tsx
<h2 className="text-2xl md:text-3xl font-bold">
  Section Title
</h2>
```

**Properties**:
- Size: 24-30px (2xl-3xl)
- Weight: font-bold (700)
- Use: Section headings, content area titles

### Heading 3 (Card Titles)

Card and component headings.

```tsx
<h3 className="text-xl font-semibold">
  Card Title
</h3>
```

**Properties**:
- Size: 20px (xl)
- Weight: font-semibold (600)
- Use: Category cards, week cards, component titles

### Body Large (Lead Paragraphs)

Prominent body text for introductions and lead paragraphs.

```tsx
<p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
  Supporting description text that introduces the main content.
</p>
```

**Properties**:
- Size: 18-20px (lg-xl)
- Line Height: leading-relaxed (1.625)
- Color: text-muted-foreground
- Use: Hero descriptions, section introductions

### Body (Standard Reading Text)

Default body text for all readable content.

```tsx
<p className="text-base leading-relaxed">
  Standard paragraph text for reading.
</p>
```

**Properties**:
- Size: 16px (text-base) **minimum for readability**
- Line Height: leading-relaxed (1.625)
- Use: Quiz questions, descriptions, article content

### Body Small (Supporting Text)

Smaller text for metadata and supporting information.

```tsx
<p className="text-sm leading-normal text-muted-foreground">
  Supporting information or metadata
</p>
```

**Properties**:
- Size: 14px (sm)
- Line Height: leading-normal (1.5)
- Color: text-muted-foreground
- Use: Timestamps, bylines, supplementary info

### Caption (Labels & Metadata)

Smallest text size for labels and fine print.

```tsx
<p className="text-xs text-muted-foreground">
  Caption text or metadata
</p>
```

**Properties**:
- Size: 12px (xs)
- Color: text-muted-foreground
- Use: Image captions, fine print, small metadata

### Uppercase Label (Status & Tags)

Bold uppercase text for emphasis and categorization.

```tsx
<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
  Status Label
</p>
```

**Properties**:
- Size: 12px (xs)
- Weight: font-bold (700)
- Transform: uppercase
- Tracking: tracking-widest (0.1em)
- Use: Status badges, category labels, tags

---

## Font Weights

Available weights in Playfair Display.

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text (sparingly used) |
| `font-medium` | 500 | Subtle emphasis |
| `font-semibold` | 600 | Card titles, subheadings |
| `font-bold` | 700 | **Primary choice** for headings |

**Default**: Most text uses font-bold (700) or font-semibold (600)

### Weight Examples

```tsx
// Headings - always bold
<h1 className="font-bold">

// Card titles - semibold
<h3 className="font-semibold">

// Body text - medium or normal
<p className="font-medium">

// Emphasis within body
<strong className="font-bold">
```

---

## Line Heights

Vertical rhythm through consistent line heights.

| Class | Value | Usage |
|-------|-------|-------|
| `leading-none` | 1 | Large display numbers |
| `leading-tight` | 1.25 | Headlines, display text |
| `leading-snug` | 1.375 | Short paragraphs |
| `leading-normal` | 1.5 | Default |
| `leading-relaxed` | 1.625 | **Body text** (readable) |
| `leading-loose` | 2 | Very spacious (rare) |

### Line Height Selection

```tsx
// Display text - tight
<h1 className="text-7xl leading-tight">

// Body text - relaxed (most common)
<p className="text-base leading-relaxed">

// Small text - normal
<p className="text-sm leading-normal">

// Numbers/scores - none
<span className="text-9xl leading-none">
```

---

## Letter Spacing

Horizontal rhythm and emphasis through character spacing.

| Class | Value | Usage |
|-------|-------|-------|
| `tracking-tighter` | -0.05em | Large display text |
| `tracking-tight` | -0.025em | Headlines |
| `tracking-normal` | 0em | **Default** - most text |
| `tracking-wide` | 0.025em | Subtle emphasis |
| `tracking-wider` | 0.05em | Moderate emphasis |
| `tracking-widest` | 0.1em | **Uppercase labels** |

### Tracking Examples

```tsx
// Scores - tighter
<span className="text-9xl tracking-tighter">72</span>

// Headlines - normal or tight
<h1 className="text-7xl tracking-tight">

// Body - normal (default)
<p className="text-base">

// Uppercase labels - widest
<p className="text-xs uppercase tracking-widest">
```

---

## Typography Patterns

Common combinations for specific contexts.

### Landing Page Hero

```tsx
<div className="text-center space-y-4">
  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
    Find Your UX Career Stage
  </h1>
  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
    Take a comprehensive skills assessment to discover where you stand.
  </p>
</div>
```

### Quiz Question

```tsx
<div className="space-y-4">
  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
    UX Research
  </p>
  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
    How do you approach user testing in your current role?
  </h2>
</div>
```

### Results Page Score

```tsx
<div className="flex items-baseline gap-2">
  <span className="text-8xl md:text-9xl font-bold tracking-tighter">
    72
  </span>
  <span className="text-xl md:text-2xl text-muted-foreground font-medium">
    / 100
  </span>
</div>
```

### Category Card

```tsx
<div className="space-y-4">
  <div className="flex justify-between items-start">
    <h3 className="text-xl font-semibold tracking-wide">
      UX Research
    </h3>
    <span className="font-mono font-bold text-lg text-foreground/80">
      85%
    </span>
  </div>
  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
    Strong
  </p>
</div>
```

### Section Header

```tsx
<div className="text-center space-y-3">
  <h2 className="text-3xl md:text-4xl font-bold">
    Skill Analysis
  </h2>
  <p className="text-muted-foreground font-medium">
    Your performance across key UX competencies
  </p>
</div>
```

### Week Card

```tsx
<div className="space-y-4">
  <h3 className="text-xl font-bold">
    Week 1
  </h3>
  <ul className="space-y-4">
    <li className="text-sm text-muted-foreground font-medium leading-relaxed">
      Practice card sorting with real users
    </li>
  </ul>
</div>
```

---

## Responsive Typography

Mobile-first approach to responsive text sizing.

### Hero Text

```tsx
// 48px → 60px → 72px
<h1 className="text-5xl md:text-6xl lg:text-7xl">

// 30px → 36px → 48px
<h1 className="text-3xl md:text-4xl lg:text-5xl">
```

### Body Text

```tsx
// 16px → 18px → 20px
<p className="text-base md:text-lg lg:text-xl">

// 14px → 16px
<p className="text-sm md:text-base">
```

### Headings

```tsx
// Section headings
<h2 className="text-2xl md:text-3xl lg:text-4xl">

// Card headings
<h3 className="text-lg md:text-xl">
```

---

## Accessibility

### Minimum Sizes

- **Body text**: 16px minimum (text-base)
- **Small text**: 14px minimum (text-sm) with high contrast
- **Captions**: 12px (text-xs) acceptable for metadata only

### Contrast Requirements

With white text on black background:
- ✓ text-foreground: 21:1 (AAA)
- ✓ text-muted-foreground: 7:1 (AA for 14pt+)

### Line Length

Optimal reading width: 45-75 characters per line.

```tsx
// Enforce readable line length
<p className="max-w-3xl mx-auto text-base leading-relaxed">
  {/* 768px max-width ensures comfortable reading */}
</p>
```

### Font Loading

Ensure fonts load properly with fallbacks:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## Best Practices

1. **Use text-base minimum** for body text (16px)
2. **Apply leading-relaxed** to readable paragraphs
3. **Bold or semibold** for all headings
4. **Uppercase + tracking-widest** for labels
5. **Scale responsively** from mobile to desktop
6. **Limit line length** to max-w-3xl for body text
7. **High contrast** for all reading text
8. **Consistent hierarchy** - don't skip heading levels
9. **Readable spacing** - use space-y for vertical rhythm
10. **Test at scale** - check readability at actual sizes

---

## Anti-Patterns

❌ **Don't**: Use text smaller than 12px
```tsx
<p className="text-[10px]">  {/* Too small */}
```

❌ **Don't**: Use tight line-height on body text
```tsx
<p className="text-base leading-tight">  {/* Hard to read */}
```

❌ **Don't**: Skip responsive scaling
```tsx
<h1 className="text-7xl">  {/* Too large on mobile */}
```

❌ **Don't**: Use light weights on small text
```tsx
<p className="text-xs font-normal">  {/* Too thin */}
```

❌ **Don't**: Overuse uppercase
```tsx
<p className="uppercase">Long paragraph text in all caps</p>  {/* Harder to read */}
```

✅ **Do**: Follow the established patterns
✅ **Do**: Test readability on actual devices
✅ **Do**: Use semantic HTML heading levels
✅ **Do**: Scale text sizes responsively
✅ **Do**: Maintain high contrast ratios

---

## Typography Checklist

When implementing text:

- [ ] Size is at least text-base (16px) for body text
- [ ] Line height is leading-relaxed for readable content
- [ ] Color meets contrast requirements (AA minimum)
- [ ] Text scales responsively on smaller screens
- [ ] Heading hierarchy is semantic (h1 → h2 → h3)
- [ ] Line length doesn't exceed 75 characters
- [ ] Font weight is bold/semibold for headings
- [ ] Letter spacing appropriate for size and case
- [ ] Whitespace (margins/padding) creates rhythm
- [ ] Text is readable on target devices

---

## Quick Reference

```tsx
// Display hero
text-5xl md:text-7xl font-bold leading-tight

// Page heading
text-3xl md:text-4xl font-bold

// Section heading  
text-2xl md:text-3xl font-bold

// Card title
text-xl font-semibold

// Lead paragraph
text-lg md:text-xl leading-relaxed text-muted-foreground

// Body text
text-base leading-relaxed

// Small text
text-sm leading-normal text-muted-foreground

// Caption/label
text-xs text-muted-foreground

// Uppercase label
text-xs font-bold uppercase tracking-widest text-muted-foreground

// Score display
text-8xl md:text-9xl font-bold tracking-tighter
```

---

## Resources

- [Playfair Display on Google Fonts](https://fonts.google.com/specimen/Playfair+Display)
- [Typography Best Practices](https://www.smashingmagazine.com/2020/07/typography-web-design/)
- [Responsive Typography](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- [WCAG Text Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)


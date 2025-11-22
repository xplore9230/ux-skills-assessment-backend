# Color Usage Guidelines

Comprehensive guidelines for using colors semantically and consistently across the UX Skills Assessment application.

## Color Philosophy

The design system uses a **dark mode monochromatic** approach with:
- Black backgrounds for depth and premium feel
- White text for maximum contrast and readability
- Grayscale surfaces for hierarchy
- Minimal accent colors (currently pure black/white)
- WCAG AA compliant contrast ratios

---

## Semantic Color Tokens

Colors are defined semantically, not literally. Always use semantic tokens instead of hard-coded values.

### Background Layers

```tsx
// Base page background - deepest layer
<div className="bg-background">  {/* #000000 - Pure black */}

// Card surfaces - elevated layer
<div className="bg-card">  {/* #000000 - Same as background */}

// Muted regions - subtle differentiation
<div className="bg-muted">  {/* hsl(0 0% 10%) - 10% white */}

// Secondary elements
<div className="bg-secondary">  {/* hsl(0 0% 10%) - 10% white */}
```

**Hierarchy**: background → card → muted/secondary
**Usage**: Layer backgrounds to create visual depth

### Text Colors

```tsx
// Primary text - highest contrast
<p className="text-foreground">  {/* #FFFFFF - Pure white */}

// Secondary text - reduced emphasis
<p className="text-muted-foreground">  {/* hsl(0 0% 60%) - 60% opacity */}

// Card text
<p className="text-card-foreground">  {/* #FFFFFF - Pure white */}
```

**Contrast Ratios**:
- foreground on background: 21:1 (AAA)
- muted-foreground on background: 7:1 (AA large text)

### Border Colors

```tsx
// Standard borders
<div className="border-border">  {/* hsl(0 0% 15%) - 15% white */}

// Card borders
<div className="border-card-border">  {/* hsl(0 0% 15%) - 15% white */}

// Input borders
<input className="border-input">  {/* hsl(0 0% 15%) - 15% white */}

// Custom opacity borders
<div className="border-foreground/20">  {/* 20% white */}
<div className="border-foreground/40">  {/* 40% white */}
```

**Usage**: Borders separate content without strong visual weight

### Interactive Colors

```tsx
// Primary actions (inverted - white bg, black text)
<Button variant="default" className="bg-primary text-primary-foreground">
  {/* White background, black text */}
</Button>

// Secondary actions (dark bg, white text)
<Button variant="secondary" className="bg-secondary text-secondary-foreground">
  {/* 10% white background, white text */}
</Button>

// Accent elements
<div className="bg-accent text-accent-foreground">
  {/* 10% white background, white text */}
</div>
```

---

## Color Application Patterns

### Page Structure

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-12">
    {/* White text on black background */}
    <h1 className="text-foreground">Page Title</h1>
    <p className="text-muted-foreground">Supporting text</p>
  </div>
</div>
```

### Card Components

```tsx
<Card className="bg-card border-card-border">
  <CardHeader>
    <CardTitle className="text-card-foreground">
      Title
    </CardTitle>
    <CardDescription className="text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Category Cards

```tsx
<div className="p-6 rounded-xl bg-muted/20 hover:bg-muted/30 border-border">
  <h3 className="text-xl font-semibold text-foreground">
    Category Name
  </h3>
  <p className="text-xs uppercase text-muted-foreground">
    Status Label
  </p>
  {/* Progress bar with foreground fill */}
  <div className="h-0.5 w-full bg-muted/40">
    <div className="h-full bg-foreground" style={{ width: '75%' }} />
  </div>
</div>
```

### Answer Options (Quiz)

```tsx
// Unselected state
<div className="bg-card border-muted-foreground hover:border-foreground">
  <div className="border-muted-foreground" />  {/* Radio button */}
  <span className="text-foreground">Option text</span>
</div>

// Selected state
<div className="bg-primary">  {/* White background */}
  <div className="border-primary bg-primary">  {/* White radio button */}
    <div className="bg-background" />  {/* Black center dot */}
  </div>
  <span className="text-primary-foreground">Option text</span>  {/* Black text */}
</div>
```

---

## Opacity Modifiers

Use Tailwind's opacity syntax for color variations.

### Background Opacity

```tsx
<div className="bg-muted/10">     {/* 10% opacity */}
<div className="bg-muted/20">     {/* 20% opacity */}
<div className="bg-muted/30">     {/* 30% opacity */}
<div className="bg-muted/50">     {/* 50% opacity */}
```

**Use for**: Subtle background variations, hover states

### Border Opacity

```tsx
<div className="border-foreground/20">  {/* 20% white border */}
<div className="border-foreground/40">  {/* 40% white border */}
<div className="border-foreground/60">  {/* 60% white border */}
```

**Use for**: Subtle borders, dividers, decorative elements

### Text Opacity

```tsx
<p className="text-foreground/80">     {/* 80% white text */}
<p className="text-foreground/60">     {/* 60% white text */}
<p className="text-muted-foreground">  {/* Already at 60% */}
```

**Use for**: De-emphasized text, captions, metadata

---

## Status & Semantic Colors

Currently, the system uses grayscale for all states. Future enhancements could add semantic colors.

### Current Implementation

```tsx
// All states use grayscale
<div className="bg-card text-foreground">
  Strong: Full white text
</div>

<div className="bg-card text-muted-foreground">
  Decent: Muted white text
</div>

<div className="bg-card text-muted-foreground">
  Needs Work: Muted white text
</div>
```

### Category Status Labels

```tsx
// "strong" | "decent" | "needs-work"
<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
  {status.replace("-", " ")}
</p>
```

**Current**: All statuses share the same muted-foreground color
**Future**: Could use green (strong), yellow (decent), red (needs-work)

### Destructive Actions

```tsx
<Button variant="destructive">
  Delete Account
</Button>
```

Currently renders as white/black (inverted). Could be red in future.

---

## Hover & Interaction States

### Card Hover

```tsx
<div className="bg-muted/20 hover:bg-muted/30 transition-colors">
  {/* Subtle background brightening on hover */}
</div>
```

### Border Hover

```tsx
<div className="border-border hover:border-foreground/30 transition-colors">
  {/* Border becomes more visible on hover */}
</div>
```

### Text Hover

```tsx
<a className="text-muted-foreground hover:text-foreground transition-colors">
  Link Text
</a>
```

### Button Hover

Handled automatically by the elevation system:
```tsx
<Button>
  {/* Automatic hover brightening via elevation */}
</Button>
```

---

## Focus States

Use ring utilities for keyboard focus:

```tsx
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
  Accessible Button
</button>

<input className="focus-visible:ring-2 focus-visible:ring-ring">
```

**Ring Color**: `--ring: 0 0% 100%` (white)
**Width**: 2px
**Offset**: 2px (for buttons with ring-offset-2)

---

## Gradients

Subtle gradients for visual interest:

```tsx
// Horizontal fade (Week cards)
<div className="bg-gradient-to-r from-muted/5 to-transparent">
  {/* Subtle left-to-right fade */}
</div>

// Radial gradient (future use)
<div className="bg-gradient-radial from-muted/10 to-transparent">
  {/* Subtle radial glow */}
</div>
```

**Principle**: Keep gradients subtle (5-10% opacity max)

---

## Contrast Requirements

All text must meet WCAG AA standards.

### Current Ratios

| Foreground | Background | Ratio | Grade | Use Case |
|------------|------------|-------|-------|----------|
| #FFFFFF | #000000 | 21:1 | AAA | Primary text |
| 60% white | #000000 | 7:1 | AA | Secondary text (14pt+) |
| 40% white | #000000 | 4.6:1 | AA | Large text only (18pt+) |
| 15% white | #000000 | 1.4:1 | Fail | Borders only (not text) |

### Testing Contrast

```bash
# Use browser DevTools or online tools
# Minimum requirements:
- Normal text (< 18pt): 4.5:1 (AA) or 7:1 (AAA)
- Large text (≥ 18pt): 3:1 (AA) or 4.5:1 (AAA)
- UI components: 3:1 (AA)
```

---

## Anti-Patterns

❌ **Don't**: Hard-code color values
```tsx
<div className="bg-[#000000]">  {/* Bad */}
```

✅ **Do**: Use semantic tokens
```tsx
<div className="bg-background">  {/* Good */}
```

---

❌ **Don't**: Use arbitrary opacity values
```tsx
<div className="bg-white/3.5">  {/* Bad - not standard */}
```

✅ **Do**: Use standard opacity scale (5, 10, 20, 30, 40, 50, 60, 70, 80, 90)
```tsx
<div className="bg-muted/10">  {/* Good */}
```

---

❌ **Don't**: Mix semantic purposes
```tsx
<p className="text-destructive">Success message</p>  {/* Bad */}
```

✅ **Do**: Use appropriate semantic tokens
```tsx
<p className="text-foreground">Success message</p>  {/* Good */}
```

---

❌ **Don't**: Use low-contrast text
```tsx
<p className="text-muted-foreground text-xs">  {/* Bad - 60% white at 12px */}
```

✅ **Do**: Use appropriate contrast for text size
```tsx
<p className="text-foreground text-xs">  {/* Good - full contrast */}
<p className="text-muted-foreground text-lg">  {/* Good - large enough */}
```

---

## Color Combinations

### Recommended Pairings

```tsx
// High contrast text
bg-background + text-foreground      ✓ 21:1
bg-card + text-card-foreground      ✓ 21:1

// Medium contrast (large text only)
bg-background + text-muted-foreground  ✓ 7:1 (18pt+)
bg-card + text-muted-foreground        ✓ 7:1 (18pt+)

// Borders
bg-background + border-border         ✓ Decorative
bg-card + border-card-border          ✓ Decorative

// Interactive
bg-primary + text-primary-foreground  ✓ 21:1 (inverted)
```

### Avoid These Pairings

```tsx
// Too low contrast for text
bg-muted + text-muted-foreground      ✗ ~3:1
bg-secondary + border-border          ✗ Too subtle

// Semantic mismatches
bg-destructive + text-foreground      ? Confusing
```

---

## Theming Considerations

Currently, only dark mode is implemented, but the system is prepared for light mode.

### Light Mode (Future)

```css
:root {
  --background: 0 0% 100%;      /* White */
  --foreground: 0 0% 0%;        /* Black */
  --muted: 0 0% 95%;            /* Light gray */
  --border: 0 0% 85%;           /* Gray border */
}
```

### Adding Light Mode

1. Define light mode tokens in `:root`
2. Remove `html { @apply dark; }` from index.css
3. Add theme toggle component
4. Test all color combinations
5. Verify contrast ratios

---

## Color Utilities Quick Reference

```tsx
// Backgrounds
bg-background        Pure black
bg-card              Card surface (black)
bg-muted             Subtle gray (10% white)
bg-secondary         Secondary surface (10% white)
bg-primary           Inverted - white bg

// Text
text-foreground            Pure white
text-muted-foreground      Muted white (60%)
text-card-foreground       Card text (white)
text-primary-foreground    Inverted - black text

// Borders
border-border          Standard (15% white)
border-card-border     Card border (15% white)
border-foreground/20   Custom opacity

// Opacity modifiers
/10, /20, /30, /40, /50, /60, /70, /80, /90

// Hover states
hover:bg-muted/30          Brighten background
hover:border-foreground    Brighten border
hover:text-foreground      Brighten text
```

---

## Best Practices

1. **Use semantic tokens** for all colors
2. **Test contrast** for all text (AA minimum)
3. **Use opacity modifiers** for variations
4. **Keep backgrounds dark** for consistency
5. **Use foreground** for high-contrast elements
6. **Use muted-foreground** for secondary text
7. **Apply hover states** via transition-colors
8. **Focus rings** should always be visible
9. **Borders** should be subtle (15-20% white)
10. **Test in context** - colors appear different on different backgrounds

---

## Tools & Resources

- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Review](https://color.review/) - Accessible color combinations
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Contrast ratio in inspector
- [Accessible Colors](https://accessible-colors.com/) - Find accessible alternatives

---

## Examples by Context

### Landing Page

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-7xl font-bold text-foreground">
    Find Your UX Career Stage
  </h1>
  <p className="text-xl text-muted-foreground">
    Take a comprehensive skills assessment
  </p>
  <Button className="bg-foreground text-background">
    Take the UX Quiz
  </Button>
</div>
```

### Quiz Card

```tsx
<Card className="bg-card border-card-border">
  <p className="text-sm font-semibold uppercase text-muted-foreground">
    UX Research
  </p>
  <h2 className="text-3xl font-bold text-foreground">
    How do you approach user testing?
  </h2>
</Card>
```

### Results Page

```tsx
<div className="bg-background">
  {/* Hero */}
  <h1 className="text-8xl font-bold text-foreground">
    Emerging Senior
  </h1>
  <p className="text-xl text-muted-foreground">
    You're developing strategic thinking...
  </p>
  
  {/* Category cards */}
  <div className="bg-muted/20 border-border">
    <h3 className="text-xl text-foreground">UX Research</h3>
    <div className="bg-foreground h-0.5" style={{ width: '85%' }} />
    <p className="text-xs text-muted-foreground uppercase">Strong</p>
  </div>
</div>
```


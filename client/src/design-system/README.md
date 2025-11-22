# UX Skills Assessment Design System

Complete design system documentation for the UX Skills Assessment application. A premium, editorial-focused design system inspired by high-end publishing platforms.

## Overview

This design system ensures consistency, scalability, and maintainability across the application through standardized tokens, components, patterns, and guidelines.

### Design Principles

1. **Premium & Editorial**: Inspired by high-end publishing, calm confidence
2. **Consistent**: Reusable patterns and components
3. **Accessible**: WCAG AA compliant, keyboard navigable
4. **Responsive**: Mobile-first, works on all devices
5. **Performance**: Optimized animations and assets
6. **Maintainable**: Single source of truth for design decisions

---

## Quick Start

### Essential Files

Read these first to understand the system:

1. **[Design Tokens](./tokens.md)** - Colors, typography, spacing scales
2. **[Components](./components.md)** - All UI components with examples
3. **[Layouts](./layouts.md)** - Page structure and composition patterns

### Key Concepts

- **All Serif Typography**: Playfair Display throughout
- **Dark Mode Only**: Black backgrounds, white text
- **Flat Design**: No drop shadows, elevation through overlays
- **Mobile First**: Design for mobile, enhance for desktop
- **Calm Animations**: Subtle, purposeful motion

---

## Documentation Index

### Foundation

**[Design Tokens](./tokens.md)**
- Color system (semantic tokens, HSL values)
- Typography scale (xs to 9xl)
- Spacing scale (4px base unit)
- Border radius, breakpoints, z-index

**[Color Usage](./color-usage.md)**
- Semantic color application
- Contrast requirements (WCAG AA)
- Background layers and hierarchy
- Opacity modifiers

**[Typography](./typography.md)**
- Font families (Playfair Display)
- Type scale and responsive sizing
- Text styles (display, headings, body)
- Line heights and letter spacing

### Components & Patterns

**[Component Library](./components.md)**
- Primitive components (Button, Card, Badge, Input)
- Custom components (AnswerOption, CategoryCard, WeekCard, etc.)
- Props documentation and usage examples
- Accessibility notes

**[Layout & Composition](./layouts.md)**
- Container system
- Grid systems (1→2→3/4 columns)
- Vertical spacing patterns
- Page-specific layouts

**[Icon System](./icons.md)**
- Lucide React icon library
- Icon sizing (w-4 h-4 default)
- Placement patterns (with text, standalone)
- Accessibility for icon buttons

### Interaction & Motion

**[Animation & Motion](./motion.md)**
- Motion tokens (duration, easing)
- Animation patterns (page transitions, card reveals)
- Hover states and interactions
- Performance best practices

**[Elevation System](./elevation.md)**
- Overlay-based depth (no shadows)
- Hover/active elevation utilities
- Toggle states
- Button integration

### UI States & Forms

**[Loading & States](./states.md)**
- Loading spinners and progress
- Empty states
- Error messages
- Success feedback

**[Form Patterns](./forms.md)**
- Quiz form structure
- Input fields and labels
- Validation patterns
- Error handling

### Accessibility & Responsive

**[Accessibility](./accessibility.md)**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- ARIA patterns
- Testing checklist

**[Responsive Design](./responsive.md)**
- Breakpoint system (mobile, tablet, desktop)
- Typography scaling
- Grid responsiveness
- Touch-friendly design

---

## Common Patterns

### Page Structure

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-12">
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page content */}
    </div>
  </div>
</div>
```

### Hero Section

```tsx
<div className="text-center space-y-6">
  <h1 className="text-5xl md:text-7xl font-bold leading-tight">
    Hero Headline
  </h1>
  <p className="text-xl text-muted-foreground leading-relaxed">
    Supporting description
  </p>
  <Button size="lg" className="rounded-xl">
    Call to Action
  </Button>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} className="p-6 hover-elevate">
      <h3 className="text-xl font-semibold">{item.title}</h3>
      <p className="text-muted-foreground">{item.description}</p>
    </Card>
  ))}
</div>
```

### Form Field

```tsx
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input 
    id="field" 
    type="text"
    placeholder="Placeholder"
  />
</div>
```

### Loading State

```tsx
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <Loader className="w-6 h-6 animate-spin mr-3" />
    <span className="animate-pulse">Loading...</span>
  </div>
) : (
  <Content data={data} />
)}
```

---

## Token Quick Reference

### Colors

```tsx
// Backgrounds
bg-background        // Pure black
bg-card             // Card surface
bg-muted            // Subtle gray (10% white)

// Text
text-foreground            // Pure white
text-muted-foreground      // Muted (60% white)

// Borders
border-border              // 15% white
border-foreground/20       // 20% opacity

// Interactive
bg-primary text-primary-foreground  // White bg, black text
```

### Typography

```tsx
// Sizes
text-xs    12px    Labels
text-sm    14px    Small text
text-base  16px    Body (minimum)
text-xl    20px    Card titles
text-3xl   30px    Section headings
text-7xl   72px    Hero text

// Weights
font-semibold    600    Card titles
font-bold        700    Headings
```

### Spacing

```tsx
// Padding/Margin
p-6     24px    Card padding
py-12   48px    Section padding (mobile)
py-24   96px    Section padding (desktop)

// Gaps
gap-4   16px    Element spacing
gap-6   24px    Card grid
gap-8   32px    Section spacing
```

### Breakpoints

```tsx
md:    768px     Tablet
lg:    1024px    Desktop

// Usage
text-base md:text-lg lg:text-xl
py-12 md:py-16 lg:py-24
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## Component Quick Reference

### Button

```tsx
// Variants
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With icon
<Button>
  Text
  <ArrowRight className="w-4 h-4 ml-2" />
</Button>
```

### Card

```tsx
<Card className="p-6">
  <h3 className="text-xl font-semibold mb-2">Title</h3>
  <p className="text-muted-foreground">Content</p>
</Card>
```

### Input

```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" type="text" />
</div>
```

### Loading

```tsx
<Loader className="w-6 h-6 animate-spin" />
```

---

## Animation Quick Reference

```tsx
// Page entry
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Card reveal
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}

// Stagger
transition={{ duration: 0.4, delay: index * 0.1 }}

// Progress bar
initial={{ width: 0 }}
animate={{ width: `${percent}%` }}
transition={{ duration: 1, ease: "circOut" }}

// Hover
<button className="group">
  <Icon className="group-hover:translate-x-1 transition-transform" />
</button>
```

---

## File Structure

```
client/src/design-system/
├── README.md              # This file - overview and quick reference
├── tokens.md              # Design tokens (colors, typography, spacing)
├── components.md          # Component library documentation
├── layouts.md             # Layout patterns and composition
├── motion.md              # Animation and motion system
├── elevation.md           # Elevation system (overlays)
├── color-usage.md         # Color application guidelines
├── typography.md          # Typography system and scales
├── accessibility.md       # Accessibility standards (WCAG AA)
├── icons.md               # Icon system (Lucide React)
├── states.md              # Loading, empty, error states
├── forms.md               # Form patterns and validation
└── responsive.md          # Responsive design strategy
```

---

## Development Workflow

### 1. Check Existing Patterns

Before creating something new:
1. Search this design system documentation
2. Check if a component already exists
3. Use existing tokens and patterns

### 2. Use Design Tokens

```tsx
// ✓ Good - uses tokens
<div className="bg-card text-foreground p-6">

// ✗ Bad - hard-coded values
<div style={{ background: '#000', color: '#fff', padding: '24px' }}>
```

### 3. Follow Responsive Patterns

```tsx
// ✓ Good - mobile first
<h1 className="text-4xl md:text-6xl lg:text-7xl">

// ✗ Bad - fixed size
<h1 className="text-7xl">
```

### 4. Ensure Accessibility

```tsx
// ✓ Good - accessible
<button aria-label="Close">
  <X className="w-4 h-4" />
</button>

// ✗ Bad - no label
<button>
  <X className="w-4 h-4" />
</button>
```

### 5. Test Responsively

- Test at 375px (mobile)
- Test at 768px (tablet)
- Test at 1024px (desktop)
- Ensure touch targets are 44×44px minimum

---

## Contributing to the Design System

### Adding a New Component

1. Design the component following existing patterns
2. Document it in [components.md](./components.md)
3. Include props, usage examples, and accessibility notes
4. Add to this README's quick reference if commonly used

### Adding a New Token

1. Add the token to the appropriate section in [tokens.md](./tokens.md)
2. Update CSS variables in `client/src/index.css`
3. Update Tailwind config if needed
4. Document usage examples

### Updating Patterns

1. Update the relevant documentation file
2. Update any affected quick references
3. Ensure examples are consistent across documentation

---

## Design System Checklist

When implementing a feature, ensure:

- [ ] Uses semantic color tokens (not hard-coded colors)
- [ ] Typography follows the type scale
- [ ] Spacing uses the spacing scale (4, 6, 8, 12, 16, 24, etc.)
- [ ] Responsive (mobile → tablet → desktop)
- [ ] Accessible (keyboard nav, ARIA, contrast)
- [ ] Animations are subtle and purposeful
- [ ] Touch targets are 44×44px minimum on mobile
- [ ] Loading/error states handled appropriately
- [ ] Follows existing component patterns
- [ ] Tested at multiple breakpoints

---

## Resources

### External Documentation

- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable component library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide Icons](https://lucide.dev/) - Icon library
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards

### Internal Files

- `client/src/index.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration
- `client/src/components/ui/` - Primitive UI components
- `client/src/components/` - Custom components

---

## Getting Help

### Finding Information

1. **Search this documentation** - Use Cmd/Ctrl+F to search
2. **Check examples** - Look at existing components
3. **Read tokens first** - Understanding tokens helps everything else
4. **Start with layouts** - Structure before details

### Common Questions

**Q: What color should I use for X?**
A: See [color-usage.md](./color-usage.md) for semantic color patterns

**Q: How do I make this responsive?**
A: See [responsive.md](./responsive.md) for breakpoint patterns

**Q: What text size should I use?**
A: See [typography.md](./typography.md) for the type scale

**Q: How do I animate this?**
A: See [motion.md](./motion.md) for animation patterns

**Q: Is this accessible?**
A: Check [accessibility.md](./accessibility.md) for requirements

---

## Version History

**v1.0** (November 2024)
- Initial design system documentation
- 13 comprehensive documentation files
- Complete token system
- Component library documentation
- Accessibility guidelines
- Responsive patterns

---

## Feedback

This design system is a living document. If you:
- Find inconsistencies
- Need new patterns documented
- Have suggestions for improvements

Please update the relevant documentation files and keep this system current.

---

## Summary

The UX Skills Assessment Design System provides:

✓ **Consistent visual language** across all pages
✓ **Reusable components** and patterns
✓ **Accessible by default** (WCAG AA)
✓ **Responsive and mobile-friendly**
✓ **Well-documented** with examples
✓ **Premium aesthetic** with calm confidence

Use this system as your single source of truth for all design and development decisions.


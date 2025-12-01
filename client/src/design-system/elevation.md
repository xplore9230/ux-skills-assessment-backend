# Elevation System

Custom elevation system using overlay-based depth instead of drop shadows, creating a flat yet interactive premium design aesthetic.

## Overview

The elevation system uses CSS custom properties and utility classes to create depth through brightness overlays rather than traditional drop shadows. This maintains the premium, editorial feel while providing clear interactive feedback.

## Design Philosophy

- **Flat Design**: No drop shadows for a clean, modern look
- **Overlay-Based**: Depth through brightness adjustments
- **Contextual**: Different elevations for different interaction states
- **Automatic**: Built into button components by default
- **Customizable**: Can be disabled or modified per component

---

## Elevation Variables

Defined in `client/src/index.css`.

### Light Mode (Currently Unused)
```css
--elevate-1: rgba(0, 0, 0, .03)    /* Subtle darkening */
--elevate-2: rgba(0, 0, 0, .08)    /* Medium darkening */
```

### Dark Mode (Active)
```css
--elevate-1: rgba(255, 255, 255, .04)  /* Subtle brightening */
--elevate-2: rgba(255, 255, 255, .09)  /* Medium brightening */
```

**Principle**: In dark mode, elevation is achieved by adding white overlays. Higher elevations = brighter surfaces.

---

## Elevation Utilities

Custom CSS utility classes defined in `client/src/index.css`.

### Hover Elevation

Adds brightness overlay on hover state.

```tsx
<div className="hover-elevate">
  {/* Brightens on hover */}
</div>
```

**Overlay**: `--elevate-1` (4% white in dark mode)
**Trigger**: `:hover` pseudo-class
**Use for**: Subtle hover feedback

```tsx
<div className="hover-elevate-2">
  {/* More pronounced hover effect */}
</div>
```

**Overlay**: `--elevate-2` (9% white in dark mode)
**Trigger**: `:hover` pseudo-class
**Use for**: Primary interactive elements

### Active Elevation

Adds brightness overlay on active state (while pressing).

```tsx
<div className="active-elevate">
  {/* Brightens when clicked */}
</div>
```

**Overlay**: `--elevate-1` (4% white)
**Trigger**: `:active` pseudo-class
**Use for**: Subtle press feedback

```tsx
<div className="active-elevate-2">
  {/* More pronounced press effect */}
</div>
```

**Overlay**: `--elevate-2` (9% white)
**Trigger**: `:active` pseudo-class
**Use for**: Primary buttons, important actions

### Toggle Elevation

Background elevation for toggled/selected states.

```tsx
<div className="toggle-elevate">
  {/* No elevation by default */}
</div>

<div className="toggle-elevate toggle-elevated">
  {/* Elevated when toggled */}
</div>
```

**Overlay**: `--elevate-2` (9% white)
**Trigger**: `.toggle-elevated` class
**Use for**: Selected items, active tabs, toggled states

**Data-attribute version**:
```tsx
<div 
  className="toggle-elevate data-[state=on]:toggle-elevated"
  data-state={isActive ? "on" : "off"}
>
  {/* Automatically elevated when state="on" */}
</div>
```

---

## Implementation Details

### Overlay Technique

Elevation uses CSS pseudo-elements (::before and ::after) to create overlay layers:

```css
/* Toggle elevation - background layer */
.toggle-elevate::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0px;
  border-radius: inherit;
  z-index: -1;  /* Behind content */
}

.toggle-elevate.toggle-elevated::before {
  background-color: var(--elevate-2);
}

/* Hover/active elevation - foreground layer */
.hover-elevate::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0px;
  border-radius: inherit;
  z-index: 999;  /* In front of content */
}

.hover-elevate:hover::after {
  background-color: var(--elevate-1);
}
```

### Border Adjustment

When elements have borders, inset is adjusted to cover the border:

```css
.border.hover-elevate::after {
  inset: -1px;  /* Covers the 1px border */
}
```

This ensures the overlay covers the entire visual area including borders.

---

## Usage in Components

### Button Component

Buttons automatically include elevation:

```tsx
// From button.tsx
const buttonVariants = cva(
  "... hover-elevate active-elevate-2",
  // Variants...
)
```

**Default behavior**:
- Hover: subtle brightening (elevate-1)
- Active: stronger brightening (elevate-2)

**Disabling elevation**:
```tsx
<Button className="no-default-hover-elevate no-default-active-elevate">
  Custom Button
</Button>
```

### Badge Component

```tsx
// From badge.tsx
const badgeVariants = cva(
  "... hover-elevate",
  // Variants...
)
```

**Behavior**: Subtle hover brightening

### Custom Components

Apply elevation to any component:

```tsx
<div className="p-4 rounded-lg bg-card hover-elevate cursor-pointer">
  {/* Hoverable card */}
</div>

<button className="px-4 py-2 bg-primary hover-elevate-2 active-elevate-2">
  Custom Button
</button>
```

---

## Elevation Patterns

### Interactive Cards

```tsx
<motion.div className="p-6 rounded-xl bg-card border hover-elevate transition-colors">
  <h3>Card Title</h3>
  <p>Card content</p>
</motion.div>
```

**Effect**: Card brightens subtly on hover
**Use for**: Clickable cards, navigation items

### Primary Buttons

```tsx
<button className="px-8 py-4 bg-foreground text-background hover-elevate-2 active-elevate-2 rounded-xl">
  Primary Action
</button>
```

**Effect**: Noticeable brightening on hover and press
**Use for**: CTAs, primary actions

### Selected Items

```tsx
<div 
  className={`
    p-3 rounded-lg border cursor-pointer
    toggle-elevate hover-elevate
    ${isSelected ? 'toggle-elevated' : ''}
  `}
  onClick={handleSelect}
>
  {/* Item content */}
</div>
```

**Effect**: Background elevation when selected, hover feedback always
**Use for**: Selectable items, tabs, options

### Answer Options

```tsx
// Not using elevation system - custom implementation
<div 
  className={`
    p-4 rounded-lg transition-colors hover:bg-muted/50
    ${isSelected ? 'bg-primary' : 'bg-card'}
  `}
>
  {/* Custom hover without elevation system */}
</div>
```

**Note**: Some components use custom hover effects instead of the elevation system.

---

## Stacking & Layering

### Z-Index Hierarchy

```css
toggle-elevate::before   z-index: -1   (behind content)
Element content          z-index: 0    (default layer)
hover/active::after      z-index: 999  (above content)
```

### Overlapping Elevations

When combining toggle and hover:

```tsx
<div className="toggle-elevate toggle-elevated hover-elevate">
  {/* Background brightening (toggle) + foreground brightening (hover) */}
</div>
```

**Result**: Both overlays stack, creating compound brightening effect.

---

## Escape Hatches

### Disable Default Elevation

```tsx
// Disable hover elevation
<Button className="no-default-hover-elevate">
  Custom Hover
</Button>

// Disable active elevation
<Button className="no-default-active-elevate">
  Custom Active
</Button>

// Disable both
<Button className="no-default-hover-elevate no-default-active-elevate">
  No Elevation
</Button>
```

### Custom Elevation Values

Override elevation in specific contexts:

```css
.custom-element.hover-elevate:hover::after {
  background-color: rgba(255, 255, 255, 0.1);
}
```

---

## Combining with Transitions

For smooth elevation changes:

```tsx
<div className="hover-elevate transition-all duration-200">
  {/* Smooth transition into elevated state */}
</div>
```

**Note**: The elevation overlay itself doesn't need transition - it applies instantly. The `transition-all` affects other properties like transform or color.

---

## Accessibility Considerations

### Focus States

Elevation is NOT used for focus states. Use ring utilities:

```tsx
<button className="hover-elevate focus-visible:ring-2 focus-visible:ring-ring">
  Accessible Button
</button>
```

**Reason**: Focus rings need to be highly visible for keyboard users, more so than subtle brightness changes.

### High Contrast Mode

Elevation overlays may not be visible in high contrast mode. Always pair with:
- Clear borders
- Color changes
- Focus rings
- ARIA states

---

## Browser Compatibility

### Requirements

- CSS custom properties (--variables)
- Pseudo-elements (::before, ::after)
- Position absolute/relative
- Modern opacity handling

**Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

### Fallbacks

The system includes fallbacks for older browsers:

```css
/* Fallback - uses base color */
--elevate-1: rgba(255, 255, 255, .04);

/* Actual implementation (no fallback needed in modern browsers) */
```

---

## Performance

### GPU Acceleration

Elevation uses opacity and position, which are GPU-accelerated:

```css
/* Efficient - uses composition */
.hover-elevate::after {
  opacity: 0;
}

.hover-elevate:hover::after {
  opacity: 1;
  background-color: var(--elevate-1);
}
```

### Best Practices

✅ **Do**: Use elevation for interactive feedback
✅ **Do**: Combine with transform for hover effects
✅ **Do**: Keep elevation subtle and consistent

❌ **Don't**: Overuse high elevation (elevate-2)
❌ **Don't**: Rely solely on elevation for state indication
❌ **Don't**: Use elevation on non-interactive elements

---

## Examples

### Hoverable Card Grid

```tsx
<div className="grid grid-cols-3 gap-6">
  {items.map(item => (
    <div 
      key={item.id}
      className="p-6 rounded-xl bg-card border hover-elevate cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <h3 className="font-bold">{item.title}</h3>
      <p className="text-muted-foreground">{item.description}</p>
    </div>
  ))}
</div>
```

### Tab Navigation

```tsx
{tabs.map(tab => (
  <button
    key={tab.id}
    className={`
      px-4 py-2 rounded-lg border
      toggle-elevate hover-elevate
      ${activeTab === tab.id ? 'toggle-elevated' : ''}
    `}
    onClick={() => setActiveTab(tab.id)}
  >
    {tab.label}
  </button>
))}
```

### Primary CTA

```tsx
<button className="px-8 py-4 bg-foreground text-background rounded-xl font-bold hover-elevate-2 active-elevate-2 transition-transform active:scale-95">
  Take the UX Quiz
</button>
```

---

## Quick Reference

```tsx
// Subtle hover
<div className="hover-elevate">

// Strong hover
<div className="hover-elevate-2">

// Press feedback
<div className="active-elevate-2">

// Toggled state
<div className="toggle-elevate toggle-elevated">

// Disable defaults
<Button className="no-default-hover-elevate">

// Focus (not elevation)
<button className="focus-visible:ring-2 focus-visible:ring-ring">
```

## Comparison: Elevation vs Shadows

| Aspect | Elevation System | Drop Shadows |
|--------|------------------|--------------|
| Visual style | Flat, premium | Dimensional, material |
| Performance | GPU-accelerated | Can be expensive |
| Subtlety | Very subtle | More pronounced |
| Dark mode | Natural (brightening) | Requires adjustment |
| Use case | Editorial, minimalist | Realistic, skeuomorphic |

---

## Design Decision

**Why no shadows?**

1. **Premium aesthetic**: Matches editorial, high-end publishing design
2. **Performance**: Overlays are cheaper than shadow rendering
3. **Consistency**: Works seamlessly in dark mode
4. **Subtlety**: Maintains calm, confident feel
5. **Simplicity**: Fewer visual variables to manage

**Result**: A refined, professional interface that feels modern and intentional.




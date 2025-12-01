# Animation & Motion System

Motion design guidelines for creating calm, purposeful animations that enhance the premium feel of the UX Skills Assessment application.

## Design Principles

The motion system follows these core principles:

1. **Calm & Refined**: No flashy or playful animations
2. **Purposeful**: Every animation serves a function (feedback, hierarchy, context)
3. **Subtle**: Animations should feel natural, not distracting
4. **Consistent**: Use standardized durations, easings, and patterns
5. **Performance**: Animate only transform and opacity for 60fps performance

---

## Motion Tokens

Standardized animation values used throughout the application.

### Duration Scale

```typescript
const duration = {
  fast: 200,      // 0.2s - Micro-interactions, hover states
  normal: 300,    // 0.3s - Default transitions, option selections
  medium: 400,    // 0.4s - Card reveals, component entrances
  comfortable: 500, // 0.5s - Progress bar, smooth transitions
  slow: 600,      // 0.6s - Page transitions, hero animations
  slower: 800,    // 0.8s - Large content reveals
  progress: 1000  // 1s - Progress animations, counters
}
```

### Easing Functions

```typescript
const easing = {
  linear: [0, 0, 1, 1],          // Constant speed
  easeOut: [0, 0, 0.2, 1],       // Default - starts fast, ends slow
  easeIn: [0.4, 0, 1, 1],        // Starts slow, ends fast
  easeInOut: [0.4, 0, 0.2, 1],   // Slow start and end
  circOut: [0, 0.55, 0.45, 1],   // Progress bars, smooth deceleration
  backOut: [0.34, 1.56, 0.64, 1] // Slight bounce (use sparingly)
}
```

**Primary Easing**: Use `easeOut` for most transitions
**Progress**: Use `circOut` for progress bars and fills
**Default**: Framer Motion's default is suitable for most cases

---

## Animation Patterns

Common animation patterns with code examples.

### Page Transitions

Entry animations for page-level content.

```tsx
// Hero section fade-up
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  {/* Hero content */}
</motion.div>

// Delayed secondary content
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
  {/* Secondary content */}
</motion.div>
```

**Duration**: 0.6-0.8s
**Movement**: 30px vertical translation
**Easing**: easeOut
**Use for**: Landing page hero, results page sections

### Card Reveals

Subtle entrance animations for cards and content blocks.

```tsx
// Single card
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  <Card />
</motion.div>

// Scroll-triggered reveal
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  <Section />
</motion.div>
```

**Duration**: 0.4-0.5s
**Movement**: 10-20px vertical translation
**Easing**: Default easeOut
**Use for**: Category cards, week cards, content sections

### Staggered Animations

Sequential reveals for lists and grids.

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.4, 
      delay: index * 0.1  // Stagger by 100ms
    }}
  >
    <Component {...item} />
  </motion.div>
))}
```

**Delay Increment**: 0.1s (100ms) between items
**Max Items**: Cap at 5-6 items to avoid long waits
**Use for**: Category cards grid, resource lists, week cards

### Slide Transitions

Horizontal slide for quiz question navigation.

```tsx
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={questionId}
    custom={direction}
    initial={{ opacity: 0, x: direction * 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction * -50 }}
    transition={{ duration: 0.3 }}
  >
    <QuestionCard />
  </motion.div>
</AnimatePresence>
```

**Direction**: 1 for next, -1 for previous
**Movement**: 50px horizontal translation
**Duration**: 0.3s
**Mode**: wait (exit completes before enter starts)
**Use for**: Quiz question transitions

### Progress Animations

Animated fills and counters.

```tsx
// Progress bar fill
<motion.div
  className="h-full bg-foreground"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.5, ease: "easeOut" }}
/>

// Score counter (category card)
<motion.div
  className="h-full bg-foreground"
  initial={{ width: 0 }}
  animate={{ width: `${score}%` }}
  transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
/>
```

**Duration**: 0.5-1s depending on context
**Easing**: circOut for smooth deceleration
**Delay**: 0.2s to allow card to settle first
**Use for**: Progress bars, score fills, loading indicators

### Hover States

Subtle interactions for buttons and interactive elements.

```tsx
// Handled by elevation system (automatic)
<Button className="hover-elevate">
  {/* Brightness overlay on hover */}
</Button>

// Custom hover animation
<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  <Card />
</motion.div>

// Icon hover animation
<Button className="group">
  Continue
  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
</Button>
```

**Duration**: 0.2s (fast)
**Scale**: 1.02 maximum (very subtle)
**Use for**: Cards, buttons, interactive elements

### Loading States

Spinning loaders for async content.

```tsx
// Spinner
<div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />

// With text
<div className="flex items-center justify-center py-12">
  <Loader className="w-6 h-6 animate-spin mr-3" />
  <span className="animate-pulse">Loading resources...</span>
</div>
```

**Animation**: Built-in Tailwind `animate-spin`
**Text**: Optional `animate-pulse` for loading text
**Size**: w-6 h-6 for inline, w-8 h-8 for standalone
**Use for**: Async data loading, AI generation states

---

## Component-Specific Animations

### AnswerOption

```tsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

**Purpose**: Fade-up reveal when question changes
**Duration**: 0.3s (normal)
**Movement**: 10px vertical

### CategoryCard

```tsx
// Card entrance
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}

// Progress bar fill
initial={{ width: 0 }}
animate={{ width: `${score}%` }}
transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
```

**Purpose**: Card reveals with delayed progress animation
**Stagger**: Use index * 0.1 for multiple cards

### WeekCard

```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay }}
```

**Purpose**: Reveal week-by-week plan
**Delay**: 0.2 + index * 0.1 for staggered reveal

### ScoreOdometer

```tsx
// Container animation
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, ease: "easeOut" }}

// Counter logic (60fps)
useEffect(() => {
  const increment = score / (duration * 60);
  // Update every frame at 60fps
}, [score, duration]);
```

**Purpose**: Animated score counter
**Duration**: 0.3-0.5s (configurable)
**Frame Rate**: 60fps for smooth counting

### DeepDiveSection

```tsx
// Section entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.6 }}

// Topic cards
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay: 0.7 + topicIndex * 0.1 }}

// Resources
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.3, delay: 0.8 + resIdx * 0.1 }}
```

**Purpose**: Complex staggered reveals for nested content
**Delays**: Carefully orchestrated for reading flow

---

## AnimatePresence Patterns

For entering and exiting elements.

### Mode: "wait"

Exit completes before enter starts (quiz questions).

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentId}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Content */}
  </motion.div>
</AnimatePresence>
```

### Mode: "sync" (default)

Enter and exit happen simultaneously.

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Conditional content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Scroll Animations

Reveal content as user scrolls.

### Basic Scroll Trigger

```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

**viewport.once**: Animate only once (don't re-trigger on scroll up)
**Use for**: Sections below the fold on results page

### Scroll with Movement

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

**amount**: Percentage of element visible before triggering (0-1)

---

## Performance Best Practices

### Animate Transform & Opacity Only

```tsx
// Good - GPU accelerated
<motion.div
  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
/>

// Avoid - causes layout recalculation
<motion.div
  animate={{ width: "100%", height: "auto", padding: 20 }}
/>
```

### Use will-change Sparingly

```css
/* Only for elements that will definitely animate */
.will-animate {
  will-change: transform, opacity;
}
```

### Reduce Motion Preference

Respect user's motion preferences:

```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
/>
```

Or globally configure Framer Motion:

```tsx
import { MotionConfig } from "framer-motion";

<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

---

## Animation Checklist

When adding animations, ensure:

- [ ] Duration is appropriate (200ms-1s)
- [ ] Easing matches the context (easeOut default)
- [ ] Only transform and opacity are animated
- [ ] Stagger delays don't exceed 0.5s total
- [ ] Scroll animations use `viewport={{ once: true }}`
- [ ] Exit animations are defined in AnimatePresence
- [ ] Motion feels calm and premium, not bouncy
- [ ] Animation serves a purpose (not decorative only)
- [ ] Performance is 60fps on target devices

---

## Common Patterns Reference

```tsx
// Page hero entrance
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Card reveal
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}

// Staggered list
transition={{ duration: 0.4, delay: index * 0.1 }}

// Progress bar
initial={{ width: 0 }}
animate={{ width: `${percent}%` }}
transition={{ duration: 1, ease: "circOut" }}

// Slide transition
initial={{ opacity: 0, x: direction * 50 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: direction * -50 }}
transition={{ duration: 0.3 }}

// Scroll reveal
initial={{ opacity: 0 }}
whileInView={{ opacity: 1 }}
viewport={{ once: true }}

// Hover scale
whileHover={{ scale: 1.02 }}
transition={{ duration: 0.2 }}
```

---

## Anti-Patterns to Avoid

❌ **Don't**: Use long durations (>1s) for UI transitions
✅ **Do**: Keep transitions snappy (0.3-0.6s)

❌ **Don't**: Animate width, height, or padding
✅ **Do**: Animate transform (x, y, scale) and opacity

❌ **Don't**: Use bouncy or spring animations
✅ **Do**: Use smooth easeOut transitions

❌ **Don't**: Stagger more than 6 items
✅ **Do**: Limit stagger or reduce delay increment

❌ **Don't**: Animate everything on every interaction
✅ **Do**: Be selective - animate for purpose

❌ **Don't**: Use complex 3D transforms
✅ **Do**: Stick to 2D transforms (x, y, scale)

❌ **Don't**: Ignore prefers-reduced-motion
✅ **Do**: Respect accessibility preferences

---

## Testing Animations

### Visual Testing

```bash
# Run dev server
npm run dev

# Test checklist:
- Animation timing feels natural
- No janky or stuttering motion
- Stagger timing is comfortable
- No excessive movement
- Works on mobile devices
```

### Performance Testing

```javascript
// Chrome DevTools Performance tab
// Record interaction and check:
- 60fps maintained during animations
- No layout thrashing
- GPU acceleration active (green in Layers)
```

### Accessibility Testing

```javascript
// Test with reduced motion preference
// macOS: System Preferences > Accessibility > Display > Reduce motion
// Windows: Settings > Ease of Access > Display > Show animations

// Animations should:
- Still provide visual feedback
- Use shorter durations or no movement
- Maintain usability without motion
```

---

## Quick Reference

| Pattern | Duration | Easing | Movement |
|---------|----------|--------|----------|
| Page entry | 0.6s | easeOut | y: 30px |
| Card reveal | 0.4s | easeOut | y: 10px |
| Option select | 0.3s | default | y: 10px |
| Progress bar | 1s | circOut | width |
| Slide transition | 0.3s | default | x: 50px |
| Hover | 0.2s | default | scale: 1.02 |
| Stagger delay | 0.1s | - | - |
| Scroll reveal | 0.5s | default | y: 30px |

---

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Animation Performance Guide](https://web.dev/animations/)
- [Material Motion Guidelines](https://material.io/design/motion/)
- [Reduced Motion Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)


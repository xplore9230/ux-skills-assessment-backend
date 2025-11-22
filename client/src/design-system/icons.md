# Icon System

Guidelines for using icons consistently across the UX Skills Assessment application using Lucide React.

## Icon Library: Lucide React

The application uses [Lucide React](https://lucide.dev/) for all icons.

### Why Lucide?

- **Consistent style**: Clean, minimalist line icons
- **Tree-shakeable**: Only import icons you use
- **Customizable**: Easy to size, color, and style
- **Accessible**: Built with accessibility in mind
- **Well-maintained**: Active development and community
- **Large selection**: 1000+ icons available

### Installation

```bash
npm install lucide-react
```

---

## Icon Usage

### Importing Icons

```tsx
// Import only the icons you need
import { ArrowRight, Download, ExternalLink } from "lucide-react";

// Use in component
<ArrowRight className="w-4 h-4" />
```

### Basic Example

```tsx
import { Check } from "lucide-react";

function SuccessMessage() {
  return (
    <div className="flex items-center gap-2">
      <Check className="w-5 h-5 text-green-500" />
      <p>Success!</p>
    </div>
  );
}
```

---

## Icon Sizing

Standard sizes for different contexts.

### Size Scale

| Size | Class | Pixels | Usage |
|------|-------|--------|-------|
| Extra Small | `w-3 h-3` | 12px | Inline with text-xs |
| Small | `w-4 h-4` | 16px | **Default** - inline with text |
| Medium | `w-5 h-5` | 20px | Standalone icons, buttons |
| Large | `w-6 h-6` | 24px | Prominent actions |
| Extra Large | `w-8 h-8` | 32px | Large touch targets |

### Usage Examples

```tsx
// Small - inline with text (default)
<button className="flex items-center gap-2">
  Continue
  <ArrowRight className="w-4 h-4" />
</button>

// Medium - standalone
<Button size="icon">
  <Download className="w-5 h-5" />
</Button>

// Large - prominent actions
<div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary">
  <Check className="w-8 h-8" />
</div>
```

### Responsive Sizing

```tsx
// Scale with screen size
<Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
```

---

## Icon Colors

Icons inherit text color by default.

### Color Inheritance

```tsx
// Inherits text color (default)
<div className="text-foreground">
  <Icon className="w-4 h-4" />  {/* White */}
</div>

<div className="text-muted-foreground">
  <Icon className="w-4 h-4" />  {/* Muted white */}
</div>

// Explicit color
<Icon className="w-4 h-4 text-foreground" />
<Icon className="w-4 h-4 text-muted-foreground" />
```

### Custom Colors

```tsx
// Semantic colors
<Check className="w-5 h-5 text-green-500" />
<X className="w-5 h-5 text-red-500" />
<AlertTriangle className="w-5 h-5 text-yellow-500" />

// Opacity modifiers
<Icon className="w-4 h-4 text-foreground/50" />
<Icon className="w-4 h-4 text-foreground/80" />
```

---

## Icon Placement

### With Text (Buttons, Links)

```tsx
// Icon after text (right)
<button className="flex items-center gap-2">
  Continue
  <ArrowRight className="w-4 h-4" />
</button>

// Icon before text (left)
<button className="flex items-center gap-2">
  <Download className="w-4 h-4" />
  Save Report
</button>

// Spacing
gap-1    4px  - Tight
gap-2    8px  - **Default**
gap-3    12px - Loose
```

### Icon-Only Buttons

```tsx
// With accessible label
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>

// Using Button component
<Button size="icon" aria-label="Download">
  <Download className="w-4 h-4" />
</Button>
```

### In Lists

```tsx
// Bullet point alternative
<ul className="space-y-2">
  <li className="flex items-start gap-2">
    <Check className="w-4 h-4 mt-1 flex-shrink-0" />
    <span>List item text that may wrap</span>
  </li>
</ul>

// Week card bullets
<li className="flex items-start gap-3">
  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60" />
  <span>Task description</span>
</li>
```

---

## Current Icons

Icons used in the application.

### Navigation Icons

```tsx
import { 
  ArrowRight,      // Forward navigation, CTAs
  ChevronLeft,     // Previous/back
  ChevronRight,    // Next/forward
  ChevronDown,     // Expand dropdown
  ChevronUp,       // Collapse dropdown
} from "lucide-react";

// Usage
<Button variant="ghost">
  <ChevronLeft className="w-4 h-4" />
  Previous
</Button>
```

### Action Icons

```tsx
import {
  Download,        // Download/save actions
  ExternalLink,    // External links
  Sparkles,        // Premium/special features
  Loader,          // Loading states
} from "lucide-react";

// Usage
<Button>
  <Download className="w-4 h-4 mr-2" />
  Save Report
</Button>

<a href="https://..." target="_blank" className="inline-flex items-center gap-1">
  View Resource
  <ExternalLink className="w-3 h-3" />
</a>
```

### Status Icons

```tsx
import {
  Check,           // Success, completed
  X,               // Close, error, remove
  AlertTriangle,   // Warning
  Info,            // Information
} from "lucide-react";

// Usage
<div className="flex items-center gap-2 text-green-500">
  <Check className="w-5 h-5" />
  <span>Quiz completed successfully</span>
</div>
```

### Loading Icon

```tsx
import { Loader } from "lucide-react";

<div className="flex items-center gap-3">
  <Loader className="w-6 h-6 animate-spin" />
  <span>Loading resources...</span>
</div>
```

---

## Icon Animations

### Hover Animations

```tsx
// Translate on hover
<button className="group inline-flex items-center gap-2">
  Continue
  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</button>

// Scale on hover
<button className="group">
  <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
</button>

// Opacity change
<a className="group inline-flex items-center gap-1">
  Learn more
  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
</a>
```

### Loading Spinner

```tsx
// Spinning loader
<Loader className="w-6 h-6 animate-spin" />

// CSS (already in Tailwind)
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Entrance Animations

```tsx
import { motion } from "framer-motion";
import { Check } from "lucide-react";

<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 200 }}
>
  <Check className="w-8 h-8 text-green-500" />
</motion.div>
```

---

## Accessibility

### Icon-Only Buttons

Always provide accessible labels:

```tsx
// ✓ Good - has aria-label
<button aria-label="Close">
  <X className="w-4 h-4" />
</button>

// ✓ Good - has screen reader text
<button>
  <X className="w-4 h-4" />
  <span className="sr-only">Close</span>
</button>

// ✗ Bad - no label
<button>
  <X className="w-4 h-4" />
</button>
```

### Decorative Icons

Hide from screen readers if redundant:

```tsx
// Icon + text (icon is decorative)
<button>
  <Download className="w-4 h-4" aria-hidden="true" />
  Download Report
</button>

// Icon conveys meaning (don't hide)
<button aria-label="Download report">
  <Download className="w-4 h-4" />
</button>
```

### Status Icons

Ensure status is communicated textually:

```tsx
// ✓ Good - status in text
<div role="status">
  <Check className="w-5 h-5" aria-hidden="true" />
  <span>Success: Quiz completed</span>
</div>

// ✗ Bad - icon only
<div>
  <Check className="w-5 h-5" />
</div>
```

---

## Common Patterns

### CTA Button with Icon

```tsx
<Button size="lg" className="group">
  Take the UX Quiz
  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
</Button>
```

### External Link

```tsx
<a 
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1 hover:underline"
>
  View Resource
  <ExternalLink className="w-3 h-3" />
</a>
```

### Download Button

```tsx
<Button variant="outline" size="lg">
  <Download className="w-4 h-4 mr-2" />
  Save Report
</Button>
```

### Loading State

```tsx
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <Loader className="w-8 h-8 animate-spin mr-3" />
    <span className="animate-pulse">Loading...</span>
  </div>
) : (
  <Content />
)}
```

### Navigation Buttons

```tsx
<div className="flex items-center justify-between">
  <Button variant="ghost">
    <ChevronLeft className="w-4 h-4 mr-2" />
    {currentIndex === 0 ? "Back to Home" : "Previous"}
  </Button>
  
  <Button>
    {isLastQuestion ? "View Results" : "Next"}
    <ChevronRight className="w-4 h-4 ml-2" />
  </Button>
</div>
```

### Success/Error Messages

```tsx
// Success
<div className="flex items-center gap-2 text-foreground">
  <Check className="w-5 h-5 text-green-500" />
  <span>Assessment completed successfully</span>
</div>

// Error
<div className="flex items-center gap-2 text-foreground">
  <X className="w-5 h-5 text-red-500" />
  <span>Failed to save results</span>
</div>
```

### Feature List

```tsx
<ul className="space-y-3">
  <li className="flex items-start gap-3">
    <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
    <span>Your current career stage from Explorer to Strategic Lead</span>
  </li>
  <li className="flex items-start gap-3">
    <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
    <span>Detailed breakdown across 5 key skill areas</span>
  </li>
</ul>
```

---

## Best Practices

1. **Consistent sizing**: Use w-4 h-4 for inline icons
2. **Color inheritance**: Let icons inherit text color
3. **Proper spacing**: Use gap-2 between icon and text
4. **Accessibility**: Always label icon-only buttons
5. **Performance**: Import only icons you need
6. **Hover states**: Add subtle animations for interactivity
7. **Loading states**: Use Loader with animate-spin
8. **External links**: Always include ExternalLink icon
9. **Alignment**: Use flex items-center for vertical centering
10. **Flex-shrink-0**: Prevent icons from shrinking in flex layouts

---

## Anti-Patterns

❌ **Don't**: Use different icon libraries
```tsx
import { Icon } from "some-other-library"  // Bad
```

❌ **Don't**: Use inconsistent sizes
```tsx
<Icon className="w-3 h-5" />  // Bad - not square
```

❌ **Don't**: Forget accessibility
```tsx
<button>
  <Icon />  // Bad - no label
</button>
```

❌ **Don't**: Use icons without purpose
```tsx
// Bad - icon doesn't add meaning
<p><Icon /> This is a paragraph</p>
```

✅ **Do**: Be consistent and purposeful
✅ **Do**: Use semantic icon choices
✅ **Do**: Provide accessible alternatives
✅ **Do**: Keep icons simple and clear

---

## Icon Reference

### Available Icons

Browse all icons: [lucide.dev](https://lucide.dev/)

### Currently Used

| Icon | Usage | Example |
|------|-------|---------|
| `ArrowRight` | Forward navigation, CTAs | "Take Quiz →" |
| `ChevronLeft` | Previous navigation | "← Previous" |
| `ChevronRight` | Next navigation | "Next →" |
| `Download` | Download/save actions | "Download Report" |
| `ExternalLink` | External links | "View Resource ↗" |
| `Sparkles` | Premium features | "Unlock Report ✨" |
| `Loader` | Loading states | Spinning loader |
| `Check` | Success, checkmarks | "✓ Complete" |
| `X` | Close, remove | "✕ Close" |

### Adding New Icons

```tsx
// 1. Import the icon
import { NewIcon } from "lucide-react";

// 2. Use with standard sizing
<NewIcon className="w-4 h-4" />

// 3. Document usage in this file
```

---

## Performance

### Tree Shaking

Lucide React is tree-shakeable - only icons you import are included:

```tsx
// ✓ Good - only imports what's needed
import { ArrowRight, Download } from "lucide-react";

// ✗ Bad - imports entire library
import * as Icons from "lucide-react";
```

### Bundle Size

Each icon is ~1-2KB. Only import what you need.

```tsx
// Import statement
import { ArrowRight } from "lucide-react";  // ~1KB

// Total for 10 icons: ~10-20KB
```

---

## Quick Reference

```tsx
// Standard icon inline with text
<button className="flex items-center gap-2">
  Text
  <Icon className="w-4 h-4" />
</button>

// Icon-only button
<button aria-label="Close">
  <X className="w-4 h-4" />
</button>

// Loading spinner
<Loader className="w-6 h-6 animate-spin" />

// External link
<a href="..." target="_blank" className="inline-flex items-center gap-1">
  Link
  <ExternalLink className="w-3 h-3" />
</a>

// Hover animation
<button className="group">
  Text
  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</button>
```

---

## Resources

- [Lucide Icon Library](https://lucide.dev/)
- [Lucide React Docs](https://lucide.dev/guide/packages/lucide-react)
- [Icon Accessibility](https://www.sarasoueidan.com/blog/accessible-icon-buttons/)
- [Icon Button Best Practices](https://www.a11yproject.com/posts/icon-button-alternatives/)


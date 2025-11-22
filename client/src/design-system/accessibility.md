# Accessibility Standards

Comprehensive accessibility guidelines ensuring the UX Skills Assessment is usable by everyone, including people with disabilities.

## Accessibility Philosophy

- **Inclusive by Default**: Accessibility is not optional
- **WCAG AA Compliance**: Minimum standard for all features
- **Keyboard First**: All functionality accessible without a mouse
- **Screen Reader Friendly**: Proper semantic markup and ARIA
- **Universal Design**: Benefits all users, not just those with disabilities

---

## WCAG 2.1 Level AA Requirements

The application targets WCAG 2.1 Level AA compliance.

### Four Principles (POUR)

1. **Perceivable**: Information presented in ways users can perceive
2. **Operable**: Interface operable through various inputs
3. **Understandable**: Information and operation is understandable
4. **Robust**: Content is robust enough for various technologies

---

## Color Contrast

All text meets WCAG AA minimum contrast ratios.

### Contrast Requirements

| Content | Size | Minimum Ratio | Current |
|---------|------|---------------|---------|
| Normal text | < 18pt | 4.5:1 | ✓ 21:1 |
| Large text | ≥ 18pt | 3:1 | ✓ 21:1 |
| UI components | Any | 3:1 | ✓ 21:1 |
| Decorative | Any | No requirement | - |

### Current Ratios

```tsx
// Primary text on background
text-foreground on bg-background
#FFFFFF on #000000 = 21:1 (AAA) ✓

// Secondary text on background
text-muted-foreground on bg-background
60% white on #000000 = 7:1 (AA for 14pt+) ✓

// Borders (decorative - no minimum)
border-border on bg-background
15% white on #000000 = 1.4:1 (decorative only)
```

### Testing Contrast

```bash
# Use browser DevTools
1. Inspect element
2. View computed styles
3. Check contrast ratio in color picker

# Or use online tools:
- https://webaim.org/resources/contrastchecker/
- https://contrast-ratio.com/
```

### Ensuring Compliance

```tsx
// ✓ Good - high contrast primary text
<p className="text-foreground text-base">
  Primary readable content
</p>

// ✓ Good - high enough contrast for large text
<h1 className="text-7xl text-muted-foreground">
  Large heading (18pt+)
</h1>

// ✗ Bad - muted text too small
<p className="text-xs text-muted-foreground">
  {/* Only 7:1 ratio, needs 14pt minimum */}
</p>

// ✓ Fixed - use full contrast for small text
<p className="text-xs text-foreground">
  Small text with full contrast
</p>
```

---

## Keyboard Navigation

All interactive elements must be keyboard accessible.

### Focus Management

```tsx
// Visible focus rings
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Accessible Button
</button>

// Input focus
<input className="focus-visible:ring-2 focus-visible:ring-ring" />

// Custom interactive elements
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  className="focus-visible:ring-2 focus-visible:ring-ring"
>
  Interactive div
</div>
```

### Tab Order

```tsx
// Natural tab order (DOM order)
<nav>
  <a href="/">Home</a>         {/* Tab 1 */}
  <a href="/quiz">Quiz</a>     {/* Tab 2 */}
  <a href="/results">Results</a> {/* Tab 3 */}
</nav>

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">
  {/* Page content */}
</main>

// Remove from tab order when needed
<div tabIndex={-1}> {/* Not keyboard accessible */}
```

### Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Move focus forward | Global |
| `Shift + Tab` | Move focus backward | Global |
| `Enter` | Activate button/link | Buttons, links |
| `Space` | Activate button/checkbox | Buttons, checkboxes |
| `Escape` | Close modal/dialog | Modals |
| `Arrow keys` | Navigate options | Select, radio groups |

### Implementation

```tsx
// Quiz navigation
const QuizPage = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  return (/* Quiz UI */);
};
```

---

## Semantic HTML

Use proper HTML elements for their intended purpose.

### Heading Hierarchy

```tsx
// ✓ Correct - logical hierarchy
<h1>Page Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>

// ✗ Wrong - skips h2
<h1>Page Title</h1>
  <h3>Section</h3>  {/* Don't skip levels */}
```

### Landmarks

```tsx
<body>
  <header>
    <nav aria-label="Primary navigation">
      {/* Navigation */}
    </nav>
  </header>
  
  <main>
    {/* Main content */}
    <section aria-labelledby="results-heading">
      <h2 id="results-heading">Your Results</h2>
    </section>
  </main>
  
  <footer>
    {/* Footer */}
  </footer>
</body>
```

### Lists

```tsx
// Use proper list markup
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

// Ordered lists
<ol>
  <li>Step 1</li>
  <li>Step 2</li>
</ol>

// Description lists
<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>
```

---

## ARIA Attributes

Use ARIA to enhance semantics when HTML alone isn't sufficient.

### ARIA Labels

```tsx
// Label for screen readers (no visible label)
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>

// Label reference (visible label)
<div aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
  {/* Content */}
</div>

// Describe with additional context
<button aria-describedby="help-text">
  Submit
</button>
<p id="help-text" className="text-sm">
  This will send your results
</p>
```

### ARIA Roles

```tsx
// When semantic HTML isn't available
<div role="button" tabIndex={0} onClick={handleClick}>
  Custom Button
</div>

// Status/alert regions
<div role="status" aria-live="polite">
  {loadingMessage}
</div>

<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// Navigation
<div role="navigation" aria-label="Pagination">
  {/* Pagination controls */}
</div>
```

### ARIA States

```tsx
// Expanded/collapsed
<button 
  aria-expanded={isOpen}
  aria-controls="content-panel"
>
  Toggle
</button>
<div id="content-panel" hidden={!isOpen}>
  {/* Collapsible content */}
</div>

// Selected state
<div
  role="option"
  aria-selected={isSelected}
  tabIndex={0}
>
  Option text
</div>

// Disabled state
<button disabled aria-disabled="true">
  Disabled Button
</button>
```

### ARIA Live Regions

```tsx
// Polite announcements (wait for pause)
<div role="status" aria-live="polite" aria-atomic="true">
  {progressMessage}
</div>

// Assertive announcements (interrupt)
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// Loading states
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? "Loading..." : "Content loaded"}
</div>
```

---

## Form Accessibility

Ensure forms are accessible to all users.

### Labels

```tsx
// ✓ Explicit label
<label htmlFor="email">Email Address</label>
<input id="email" type="email" name="email" />

// ✓ Implicit label (label wraps input)
<label>
  Email Address
  <input type="email" name="email" />
</label>

// ✗ Missing label
<input type="email" placeholder="Email" />  {/* Bad */}
```

### Required Fields

```tsx
<label htmlFor="name">
  Name
  <span aria-label="required" className="text-destructive">*</span>
</label>
<input 
  id="name"
  type="text"
  required
  aria-required="true"
/>
```

### Error Messages

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <p id="email-error" role="alert" className="text-destructive text-sm">
    Please enter a valid email address
  </p>
)}
```

### Fieldsets

```tsx
<fieldset>
  <legend>Contact Preferences</legend>
  
  <label>
    <input type="radio" name="contact" value="email" />
    Email
  </label>
  
  <label>
    <input type="radio" name="contact" value="phone" />
    Phone
  </label>
</fieldset>
```

---

## Touch Targets

Minimum 44×44px touch targets for mobile accessibility.

### Button Sizing

```tsx
// ✓ Large enough touch target
<Button size="lg" className="min-h-11 px-8">
  {/* 44px+ height */}
</Button>

// ✓ Icon button with adequate size
<Button size="icon" className="w-11 h-11">
  <Icon className="w-5 h-5" />
</Button>

// ✗ Too small
<button className="p-1">  {/* < 44px */}
  <Icon className="w-3 h-3" />
</button>
```

### Spacing Between Targets

```tsx
// ✓ Adequate spacing
<div className="flex gap-4">
  <Button>Option 1</Button>
  <Button>Option 2</Button>
</div>

// ✗ Too close together
<div className="flex gap-1">
  <button>1</button>
  <button>2</button>
</div>
```

---

## Screen Readers

Optimize for screen reader users.

### Screen Reader Only Text

```tsx
// Visually hidden but announced
<span className="sr-only">
  Additional context for screen readers
</span>

// Hide from screen readers
<div aria-hidden="true">
  Decorative content
</div>
```

### Descriptive Text

```tsx
// ✓ Descriptive link text
<a href="/results">View your assessment results</a>

// ✗ Generic link text
<a href="/results">Click here</a>

// ✓ Button with clear action
<button>Save report</button>

// ✗ Ambiguous button
<button>Submit</button>
```

### Image Alt Text

```tsx
// ✓ Descriptive alt text
<img 
  src="chart.png" 
  alt="Bar chart showing UX Research score of 85%, UX Design score of 72%"
/>

// ✓ Decorative image (empty alt)
<img src="decoration.png" alt="" aria-hidden="true" />

// ✗ Missing alt
<img src="chart.png" />
```

---

## Motion & Animation

Respect user preferences for reduced motion.

### Prefers Reduced Motion

```tsx
// CSS approach
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// JavaScript approach
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: prefersReducedMotion ? 0 : 0.6 
  }}
/>

// Framer Motion global config
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

### Animation Guidelines

- Keep animations subtle and purposeful
- Provide option to disable animations
- Don't rely on animation for critical information
- Avoid flashing content (seizure risk)

---

## Testing Checklist

### Manual Testing

- [ ] **Keyboard only**: Navigate entire app without mouse
- [ ] **Tab order**: Logical flow through interactive elements
- [ ] **Focus visible**: Clear focus indicators on all elements
- [ ] **Screen reader**: Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] **Zoom**: Test at 200% zoom without horizontal scroll
- [ ] **Color contrast**: All text meets minimum ratios
- [ ] **Touch targets**: All buttons at least 44×44px
- [ ] **Forms**: Labels associated, errors announced
- [ ] **Modals**: Focus trapped, Escape closes
- [ ] **Images**: Meaningful alt text or aria-hidden

### Automated Testing

```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# Run during development
import { axe } from '@axe-core/react';

if (process.env.NODE_ENV !== 'production') {
  axe(React, ReactDOM, 1000);
}

# Or use Lighthouse in Chrome DevTools
# Or use WAVE browser extension
```

### Screen Reader Testing

**macOS VoiceOver**:
```bash
Cmd + F5                  # Enable/disable
Ctrl + Option + Arrow     # Navigate
Ctrl + Option + Space     # Activate
```

**Windows NVDA**:
```bash
Ctrl + Alt + N            # Start NVDA
Arrow keys                # Navigate
Enter                     # Activate
```

---

## Common Patterns

### Modal Dialog

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent 
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">
        Confirm Action
      </DialogTitle>
      <DialogDescription id="dialog-description">
        Are you sure you want to proceed?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Quiz Answer Selection

```tsx
<div role="radiogroup" aria-labelledby="question-text">
  <h2 id="question-text">
    How do you approach user testing?
  </h2>
  
  {options.map((option, index) => (
    <div
      key={option.value}
      role="radio"
      aria-checked={selectedValue === option.value}
      tabIndex={selectedValue === option.value ? 0 : -1}
      onClick={() => handleSelect(option.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSelect(option.value);
        }
      }}
    >
      {option.label}
    </div>
  ))}
</div>
```

### Progress Indicator

```tsx
<div 
  role="progressbar" 
  aria-valuenow={currentQuestion}
  aria-valuemin={1}
  aria-valuemax={totalQuestions}
  aria-label="Quiz progress"
>
  <p className="sr-only">
    Question {currentQuestion} of {totalQuestions}
  </p>
  <div className="h-2 bg-muted">
    <div 
      className="h-full bg-foreground"
      style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
    />
  </div>
</div>
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/) - Accessibility resources and testing
- [A11y Project](https://www.a11yproject.com/) - Community-driven accessibility
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - ARIA patterns
- [Inclusive Components](https://inclusive-components.design/) - Accessible component patterns
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for testing

---

## Priority Actions

### High Priority (Launch Blockers)
1. ✓ Color contrast meets AA for all text
2. ✓ Keyboard navigation works throughout
3. ✓ Focus indicators visible on all interactive elements
4. ✓ Semantic HTML structure (headings, landmarks)
5. ✓ Form labels associated with inputs
6. ✓ Touch targets meet 44×44px minimum

### Medium Priority (Post-Launch)
1. Screen reader optimization and testing
2. ARIA live regions for dynamic content
3. Skip navigation links
4. Reduced motion preferences
5. Error handling and recovery
6. Help documentation

### Ongoing
1. Regular accessibility audits
2. User testing with assistive technology users
3. Stay current with WCAG updates
4. Team training on accessibility
5. Integrate accessibility into design process

---

## Best Practices Summary

1. **Use semantic HTML** - Let HTML do the heavy lifting
2. **Test with keyboard** - Don't rely on mouse/touch
3. **High contrast** - Ensure text is readable
4. **Label everything** - Screen readers need context
5. **Focus management** - Clear, visible focus indicators
6. **Touch-friendly** - Large enough targets
7. **Error handling** - Clear, helpful error messages
8. **Test with users** - Real feedback from people with disabilities
9. **Automate testing** - Catch issues early
10. **Keep learning** - Accessibility is an ongoing practice


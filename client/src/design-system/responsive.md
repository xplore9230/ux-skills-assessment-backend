# Responsive Design Strategy

Comprehensive guidelines for creating responsive, mobile-first layouts that work beautifully across all device sizes.

## Responsive Philosophy

- **Mobile First**: Design for mobile, enhance for desktop
- **Content Priority**: Most important content accessible on all screens
- **Touch-Friendly**: 44px minimum touch targets on mobile
- **Performance**: Optimize images and assets for device size
- **Progressive Enhancement**: Core functionality works everywhere

---

## Breakpoints

Tailwind CSS breakpoint system used throughout the application.

### Breakpoint Scale

| Prefix | Min Width | Description | Target Devices |
|--------|-----------|-------------|----------------|
| *(none)* | 0px | Base (mobile) | All phones |
| `sm:` | 640px | Large mobile | Large phones, small tablets |
| `md:` | 768px | Tablet | Tablets (portrait) |
| `lg:` | 1024px | Desktop | Small laptops, tablets (landscape) |
| `xl:` | 1280px | Large desktop | Laptops, desktops |
| `2xl:` | 1536px | Extra large | Large monitors |

### Most Common Breakpoints

The application primarily uses:
- **Base (0px)**: Mobile phones
- **md: (768px)**: Tablets and up
- **lg: (1024px)**: Desktop and up

---

## Layout Patterns

### Container System

```tsx
// Base container - mobile first
<div className="container mx-auto px-6">
  {/* Fluid width with 24px horizontal padding */}
</div>

// With responsive vertical padding
<div className="container mx-auto px-6 py-12 md:py-16 lg:py-24">
  {/* Scales from 48px → 64px → 96px */}
</div>
```

### Content Width Constraints

```tsx
// Narrow content (landing)
<div className="max-w-2xl mx-auto">  {/* 672px max */}

// Reading width (quiz)
<div className="max-w-3xl mx-auto">  {/* 768px max */}

// Wide content (results)
<div className="max-w-5xl mx-auto">  {/* 1024px max */}
```

---

## Grid Systems

### Single → Multi-Column

```tsx
// 1 column → 2 columns → 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// 1 column → 2 columns → 4 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  <WeekCard />
  <WeekCard />
  <WeekCard />
  <WeekCard />
</div>
```

### Responsive Gap

```tsx
// Smaller gaps on mobile, larger on desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
  {/* 16px → 24px → 32px */}
</div>
```

### Equal Heights

```tsx
// Cards same height in grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
  <CategoryCard />
  <CategoryCard />
  <CategoryCard />
</div>
```

---

## Typography Scaling

### Hero Text

```tsx
// 48px → 60px → 72px
<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
  Find Your UX Career Stage
</h1>

// 30px → 36px → 48px
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
  Section Heading
</h1>
```

### Body Text

```tsx
// 16px → 18px → 20px (lead paragraphs)
<p className="text-base md:text-lg lg:text-xl">
  Lead paragraph text
</p>

// 14px → 16px (supporting text)
<p className="text-sm md:text-base">
  Supporting text
</p>

// 12px → 14px (small text)
<p className="text-xs md:text-sm">
  Small text or metadata
</p>
```

### Headings

```tsx
// Page headings
<h1 className="text-3xl md:text-4xl font-bold">

// Section headings
<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Card headings (often fixed size)
<h3 className="text-xl font-semibold">
```

---

## Spacing Scaling

### Vertical Padding

```tsx
// Page sections
<section className="py-12 md:py-16 lg:py-24">
  {/* 48px → 64px → 96px */}
</section>

// Content blocks
<div className="py-8 md:py-12">
  {/* 32px → 48px */}
</div>
```

### Horizontal Padding

```tsx
// Page container
<div className="px-4 md:px-6 lg:px-8">
  {/* 16px → 24px → 32px */}
</div>

// Cards
<Card className="p-4 md:p-6 lg:p-8">
  {/* 16px → 24px → 32px */}
</Card>

// Quiz card (extra padding on desktop)
<Card className="p-3 md:p-6 lg:p-12">
  {/* 12px → 24px → 48px */}
</Card>
```

### Element Spacing

```tsx
// Between sections
<div className="space-y-12 md:space-y-16 lg:space-y-24">
  {/* 48px → 64px → 96px */}
</div>

// Between elements
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* 16px → 24px → 32px */}
</div>

// Grid gaps
<div className="gap-4 md:gap-6 lg:gap-8">
  {/* 16px → 24px → 32px */}
</div>
```

---

## Component Responsiveness

### Buttons

```tsx
// Responsive button sizes
<Button size="default" className="text-sm md:text-base">
  {/* Slightly larger text on desktop */}
</Button>

// Full width on mobile, auto on desktop
<Button className="w-full md:w-auto">
  Take Quiz
</Button>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <Button variant="outline">Cancel</Button>
  <Button>Confirm</Button>
</div>
```

### Navigation

```tsx
// Hamburger menu on mobile, full nav on desktop
<nav>
  {/* Mobile menu button */}
  <button className="md:hidden">
    <Menu className="w-6 h-6" />
  </button>
  
  {/* Desktop navigation */}
  <div className="hidden md:flex gap-6">
    <a href="/quiz">Quiz</a>
    <a href="/results">Results</a>
  </div>
</nav>
```

### Cards

```tsx
// Responsive card padding
<Card className="p-4 md:p-6 lg:p-8">
  {/* 16px → 24px → 32px */}
</Card>

// Stacked on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <CategoryCard />
  <CategoryCard />
  <CategoryCard />
</div>
```

### Images

```tsx
// Full width on mobile, constrained on desktop
<img 
  src={image}
  className="w-full max-w-2xl mx-auto"
  alt="Description"
/>

// Responsive image sizing
<img
  srcSet="
    image-400w.jpg 400w,
    image-800w.jpg 800w,
    image-1200w.jpg 1200w
  "
  sizes="
    (max-width: 768px) 100vw,
    (max-width: 1024px) 50vw,
    800px
  "
  src="image-800w.jpg"
  alt="Description"
/>
```

---

## Hide/Show Elements

### Show/Hide by Breakpoint

```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop-only content
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  Mobile-only content
</div>

// Show only on tablet
<div className="hidden md:block lg:hidden">
  Tablet-only content
</div>
```

### Responsive Text

```tsx
// Different text for different screens
<p>
  <span className="inline md:hidden">Mobile text</span>
  <span className="hidden md:inline">Desktop text</span>
</p>

// Truncate on mobile, full on desktop
<p className="truncate md:overflow-visible">
  Long text that truncates on mobile
</p>
```

---

## Touch-Friendly Design

### Touch Targets

Minimum 44×44px for interactive elements on mobile.

```tsx
// Large enough touch targets
<Button size="lg" className="min-h-11 px-8">
  {/* 44px+ height */}
  Tap Me
</Button>

// Adequate spacing between targets
<div className="flex flex-col sm:flex-row gap-4">
  <Button>Option 1</Button>
  <Button>Option 2</Button>
</div>
```

### Hover States

Desktop-only hover effects:

```tsx
// Hover only on devices that support it
<div className="transition-colors hover:bg-muted/30">
  {/* Hover state */}
</div>

// Alternative: Use @media (hover: hover) in CSS
@media (hover: hover) {
  .card:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
```

---

## Page-Specific Patterns

### Landing Page

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-12">
    {/* Illustration */}
    <div className="flex justify-center mb-6">
      <img 
        src={illustration}
        className="w-full max-w-2xl"
        alt="UX assessment"
      />
    </div>
    
    {/* Content */}
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
        Find Your UX Career Stage
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground text-center">
        Take a comprehensive skills assessment
      </p>
    </div>
  </div>
</div>
```

### Quiz Page

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-12">
    <div className="max-w-3xl mx-auto space-y-8">
      <ProgressBar current={4} total={15} />
      
      {/* More padding on larger screens */}
      <Card className="p-3 md:p-6 lg:p-12 space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">
          {question.text}
        </h2>
        
        <div className="space-y-2 md:space-y-3 lg:space-y-4">
          {options.map(option => <AnswerOption {...option} />)}
        </div>
      </Card>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost">Previous</Button>
        <Button>Next</Button>
      </div>
    </div>
  </div>
</div>
```

### Results Page

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-20 max-w-5xl space-y-24">
    
    {/* Hero - centered on all screens */}
    <div className="flex flex-col items-center text-center space-y-8">
      <ScoreOdometer score={72} maxScore={100} />
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold">
        {stage}
      </h1>
    </div>
    
    {/* Category cards - 1 → 2 → 3 columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map(cat => <CategoryCard {...cat} />)}
    </div>
    
    {/* Week cards - 1 → 2 → 4 columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {weeks.map(week => <WeekCard {...week} />)}
    </div>
    
    {/* Footer actions - stack on mobile, row on desktop */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <Button variant="outline" size="lg">Save Report</Button>
      <Button size="lg">Retake Assessment</Button>
    </div>
    
  </div>
</div>
```

---

## Performance Optimization

### Responsive Images

```tsx
// Use picture element for art direction
<picture>
  <source
    media="(min-width: 1024px)"
    srcSet="hero-desktop.jpg"
  />
  <source
    media="(min-width: 768px)"
    srcSet="hero-tablet.jpg"
  />
  <img
    src="hero-mobile.jpg"
    alt="Hero image"
    className="w-full"
  />
</picture>

// Or use srcSet for resolution switching
<img
  srcSet="
    image-400w.jpg 400w,
    image-800w.jpg 800w,
    image-1200w.jpg 1200w
  "
  sizes="
    (max-width: 768px) 100vw,
    800px
  "
  src="image-800w.jpg"
  alt="Description"
/>
```

### Lazy Loading

```tsx
// Native lazy loading
<img
  src="large-image.jpg"
  loading="lazy"
  alt="Description"
/>

// With Intersection Observer (more control)
import { useEffect, useRef, useState } from 'react';

function LazyImage({ src, alt }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : ''}
      alt={alt}
      className={isLoaded ? '' : 'bg-muted animate-pulse'}
    />
  );
}
```

---

## Testing Responsive Design

### Browser DevTools

```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device or set custom dimensions
4. Test at common breakpoints: 375px, 768px, 1024px, 1440px
```

### Real Devices

Priority testing devices:
- **Mobile**: iPhone 14 (390×844), Samsung Galaxy S21 (360×800)
- **Tablet**: iPad (768×1024), iPad Pro (1024×1366)
- **Desktop**: 1280×720, 1920×1080

### Responsive Checklist

- [ ] Test at all breakpoints (375px, 768px, 1024px, 1440px)
- [ ] Touch targets min 44×44px on mobile
- [ ] Text readable without zoom (16px minimum)
- [ ] No horizontal scrolling
- [ ] Images load appropriate sizes
- [ ] Navigation works on all screens
- [ ] Buttons accessible and sized properly
- [ ] Grids collapse appropriately
- [ ] Typography scales naturally
- [ ] Spacing feels consistent

---

## Common Responsive Patterns

### Stacked → Side-by-Side

```tsx
<div className="flex flex-col md:flex-row gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Centered → Full Width

```tsx
<div className="text-center md:text-left">
  {/* Centered on mobile, left-aligned on desktop */}
</div>
```

### Single Column → Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card />)}
</div>
```

### Full Width → Constrained

```tsx
<div className="w-full lg:max-w-4xl lg:mx-auto">
  {/* Full width on mobile, constrained on large screens */}
</div>
```

---

## Best Practices

1. **Mobile first**: Design and code for mobile, enhance for desktop
2. **Test early**: Check responsive behavior during development
3. **Touch targets**: 44px minimum on mobile devices
4. **Readable text**: 16px minimum for body text
5. **No horizontal scroll**: Content should never require horizontal scrolling
6. **Appropriate images**: Serve correctly sized images for each device
7. **Progressive enhancement**: Core functionality works everywhere
8. **Consistent spacing**: Scale spacing proportionally across breakpoints
9. **Flexible grids**: Use grid/flexbox, avoid fixed widths
10. **Performance**: Optimize for mobile connections

---

## Quick Reference

```tsx
// Responsive text
text-base md:text-lg lg:text-xl

// Responsive spacing
py-12 md:py-16 lg:py-24
gap-4 md:gap-6 lg:gap-8

// Responsive grid
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

// Show/hide
hidden md:block          // Show on desktop
block md:hidden          // Show on mobile

// Flex direction
flex flex-col md:flex-row

// Full width → auto
w-full md:w-auto
```

---

## Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)
- [Mobile-First Design](https://www.nngroup.com/articles/mobile-first-design/)
- [Touch Target Sizes](https://www.smashingmagazine.com/2021/07/accessible-tap-target-sizes/)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)


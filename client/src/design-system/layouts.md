# Layout & Composition Patterns

Reusable layout patterns and composition guidelines for consistent page structure across the application.

## Table of Contents

1. [Container System](#container-system)
2. [Vertical Spacing](#vertical-spacing)
3. [Grid Systems](#grid-systems)
4. [Content Centering](#content-centering)
5. [Page Layouts](#page-layouts)
6. [Responsive Patterns](#responsive-patterns)

---

## Container System

The application uses a consistent container system for all pages.

### Base Container

```tsx
<div className="container mx-auto px-6">
  {/* Content */}
</div>
```

- **Width**: Fluid with automatic margins
- **Horizontal Padding**: 24px (`px-6`) on all screen sizes
- **Centering**: `mx-auto` for horizontal centering

### Page-Specific Max Widths

Different pages use different content widths for optimal readability:

```tsx
// Landing Page - Narrower for focused content
<div className="container mx-auto px-6 py-12">
  <div className="max-w-2xl mx-auto">
    {/* Landing content */}
  </div>
</div>

// Quiz Page - Medium width for comfortable reading
<div className="container mx-auto px-6 py-12">
  <div className="max-w-3xl mx-auto">
    {/* Quiz content */}
  </div>
</div>

// Results Page - Wider for multiple columns
<div className="container mx-auto px-6 py-20 max-w-5xl">
  {/* Results content */}
</div>
```

#### Max-Width Reference

| Context | Class | Width | Usage |
|---------|-------|-------|-------|
| Narrow content | `max-w-2xl` | 672px | Landing page, focused content |
| Reading width | `max-w-3xl` | 768px | Quiz questions, article content |
| Content sections | `max-w-4xl` | 896px | Deep dive sections, detailed content |
| Wide layouts | `max-w-5xl` | 1024px | Results page with multiple columns |
| Extra wide | `max-w-6xl` | 1152px | Full-width dashboards |

---

## Vertical Spacing

Consistent vertical rhythm using the spacing scale.

### Page Padding

```tsx
// Mobile-first approach
<div className="py-12">        /* 48px - Mobile */
<div className="py-16">        /* 64px - Tablet */
<div className="py-20">        /* 80px - Results page */
<div className="py-24">        /* 96px - Large sections */

// Responsive
<div className="py-12 md:py-16 lg:py-24">  /* Adaptive vertical spacing */
```

### Section Spacing

Use `space-y-{size}` for consistent gaps between sibling elements:

```tsx
// Small spacing (16px)
<div className="space-y-4">
  <Element1 />
  <Element2 />
</div>

// Medium spacing (24px)
<div className="space-y-6">
  <Element1 />
  <Element2 />
</div>

// Large spacing (32px)
<div className="space-y-8">
  <Section1 />
  <Section2 />
</div>

// Section breaks (48px)
<div className="space-y-12">
  <Section1 />
  <Section2 />
</div>

// Major sections (96px)
<div className="space-y-24">
  <HeroSection />
  <ContentSection />
  <FooterSection />
</div>
```

### Spacing Scale Quick Reference

```
space-y-1    4px    - Very tight (rarely used)
space-y-2    8px    - Tight related items
space-y-3    12px   - Related form fields
space-y-4    16px   - Default component spacing
space-y-6    24px   - Card internal spacing
space-y-8    32px   - Section internal spacing
space-y-12   48px   - Between subsections
space-y-16   64px   - Between sections
space-y-24   96px   - Between major sections
```

---

## Grid Systems

Responsive grid layouts for different content types.

### Category Cards (3-Column)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
  {categories.map(category => (
    <CategoryCard key={category.name} {...category} />
  ))}
</div>
```

- **Mobile**: 1 column (stacked)
- **Tablet**: 2 columns (768px+)
- **Desktop**: 3 columns (1024px+)
- **Gap**: 24px between items
- **Equal Heights**: `auto-rows-fr` for consistent card heights

### Week Cards (4-Column)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {weeks.map(week => (
    <WeekCard key={week.week} {...week} />
  ))}
</div>
```

- **Mobile**: 1 column (stacked)
- **Tablet**: 2 columns (768px+)
- **Desktop**: 4 columns (1024px+)
- **Gap**: 32px between items

### Resources (2-Column)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {resources.map((resource, index) => (
    <ResourceCard key={index} {...resource} />
  ))}
</div>
```

- **Mobile**: 1 column (stacked)
- **Tablet+**: 2 columns (768px+)
- **Gap**: 16px between items

### Flexible Grid Pattern

```tsx
// Auto-fit with minimum width
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  {items.map(item => <Card />)}
</div>

// Specific column counts at each breakpoint
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card />)}
</div>
```

---

## Content Centering

Techniques for centering content horizontally and vertically.

### Horizontal Centering

```tsx
// Center with max-width
<div className="max-w-3xl mx-auto">
  {/* Centered content */}
</div>

// Center items in flex container
<div className="flex justify-center">
  <Button />
</div>

// Center text
<div className="text-center">
  <h1>Centered Heading</h1>
  <p>Centered paragraph</p>
</div>
```

### Vertical Centering

```tsx
// Flex vertical center
<div className="flex items-center min-h-screen">
  {/* Vertically centered content */}
</div>

// Flex vertical and horizontal center
<div className="flex items-center justify-center min-h-screen">
  {/* Fully centered content */}
</div>
```

### Hero Section Pattern

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-12">
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      <h1 className="text-7xl font-bold">Hero Headline</h1>
      <p className="text-xl text-muted-foreground">Supporting description</p>
      <div className="flex justify-center pt-2">
        <Button size="lg">Call to Action</Button>
      </div>
    </div>
  </div>
</div>
```

---

## Page Layouts

Complete layout patterns for each page type.

### Landing Page Layout

Two-section centered layout with hero content and illustration.

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-12">
    {/* Illustration */}
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center mb-6"
    >
      <img src={illustration} className="w-full max-w-2xl" />
    </motion.div>

    {/* Content */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="space-y-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold">
          Find Your UX Career Stage
        </h1>
        <p className="text-xl text-muted-foreground">
          Take a comprehensive skills assessment...
        </p>
      </div>
      
      <div className="flex justify-center pt-2">
        <Button size="lg" className="rounded-xl">
          Take the UX Quiz
        </Button>
      </div>
      
      <div className="space-y-3 text-center pt-4">
        {/* Feature list */}
      </div>
    </motion.div>
  </div>
</div>
```

**Key Features:**
- Centered vertical layout
- Max-width 2xl (672px) for content
- Illustration above content
- Clear visual hierarchy
- Staggered animations

### Quiz Page Layout

Centered card with progress indicator.

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-12">
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress indicator */}
      <ProgressBar current={currentIndex + 1} total={questions.length} />

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div key={questionId}>
          <Card className="p-6 md:p-12 space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase">
                {question.category}
              </p>
              <h2 className="text-3xl font-bold">
                {question.text}
              </h2>
            </div>

            <div className="space-y-4">
              {question.options.map(option => (
                <AnswerOption {...option} />
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost">Previous</Button>
        <Button>Next</Button>
      </div>
    </div>
  </div>
</div>
```

**Key Features:**
- Max-width 3xl (768px) for readability
- Progress bar at top
- Card-based question display
- Navigation at bottom
- Animated transitions between questions

### Results Page Layout

Multi-section vertical layout with various content types.

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-6 py-20 max-w-5xl space-y-24">
    
    {/* Hero Section */}
    <motion.div className="flex flex-col items-center text-center space-y-8">
      <ScoreOdometer score={totalScore} maxScore={maxScore} />
      <div className="space-y-6">
        <Badge variant="outline">Assessment Complete</Badge>
        <h1 className="text-7xl font-bold">{stage}</h1>
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl">
        {summary}
      </p>
    </motion.div>

    {/* Stage Analysis */}
    <motion.div className="max-w-3xl mx-auto text-center border-t border-b py-16">
      <h2 className="text-2xl font-bold italic mb-6">
        What this means for you
      </h2>
      <p className="text-lg leading-relaxed text-muted-foreground/90">
        {stageReadup}
      </p>
    </motion.div>

    {/* Skill Breakdown */}
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold">Skill Analysis</h2>
        <p className="text-muted-foreground">
          Your performance across key UX competencies
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => <CategoryCard {...category} />)}
      </div>
    </div>

    {/* Resources */}
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Curated Resources</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map(resource => <ResourceCard {...resource} />)}
      </div>
    </div>

    {/* Deep Dive */}
    <DeepDiveSection topics={topics} />

    {/* Improvement Plan */}
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold">4-Week Roadmap</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {weeks.map(week => <WeekCard {...week} />)}
      </div>
    </div>

    {/* Footer Actions */}
    <motion.div className="flex items-center justify-center gap-6 pt-12">
      <Button variant="outline" size="lg">Save Report</Button>
      <Button size="lg">Retake Assessment</Button>
    </motion.div>

  </div>
</div>
```

**Key Features:**
- Max-width 5xl (1024px) for wider content
- Large vertical spacing (96px) between sections
- Hero section with centered score
- Multiple grid layouts for different content types
- Clear section headers
- Responsive column counts

---

## Responsive Patterns

Mobile-first responsive design patterns.

### Responsive Text Sizing

```tsx
// Hero headings
<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">

// Section headings
<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Body text
<p className="text-base md:text-lg lg:text-xl">

// Small text
<p className="text-xs md:text-sm">
```

### Responsive Spacing

```tsx
// Vertical padding
<div className="py-12 md:py-16 lg:py-24">

// Horizontal padding
<div className="px-4 md:px-6 lg:px-8">

// Gap in flex/grid
<div className="gap-4 md:gap-6 lg:gap-8">

// Space between elements
<div className="space-y-6 md:space-y-8 lg:space-y-12">
```

### Responsive Layout

```tsx
// Flex direction
<div className="flex flex-col md:flex-row">

// Grid columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hide on mobile
<div className="hidden md:block">

// Show only on mobile
<div className="block md:hidden">
```

### Responsive Card Padding

```tsx
// Quiz card - more padding on desktop
<Card className="p-3 md:p-6 lg:p-12">

// Standard card
<Card className="p-4 md:p-6">
```

### Breakpoint Strategy

```
Mobile First (0px - 767px):
- Single column layouts
- Smaller text sizes (text-base, text-xl)
- Reduced spacing (py-12, space-y-6)
- Simplified navigation
- Touch-optimized targets (44px min)

Tablet (768px - 1023px):
- 2-column grids where appropriate
- Medium text sizes (text-lg, text-2xl)
- Medium spacing (py-16, space-y-8)
- Side-by-side buttons

Desktop (1024px+):
- 3-4 column grids
- Larger text sizes (text-xl, text-4xl)
- Generous spacing (py-24, space-y-12)
- Full navigation
- Hover states
```

---

## Layout Composition Examples

### Section with Header + Grid

```tsx
<div className="space-y-12">
  {/* Section header */}
  <div className="text-center space-y-3">
    <h2 className="text-3xl md:text-4xl font-bold">Section Title</h2>
    <p className="text-muted-foreground font-medium">
      Section description
    </p>
  </div>
  
  {/* Grid content */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => <Card {...item} />)}
  </div>
</div>
```

### Two-Column Split

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  {/* Left column - Text */}
  <div className="space-y-6">
    <h2 className="text-4xl font-bold">Heading</h2>
    <p className="text-lg text-muted-foreground">Description</p>
    <Button size="lg">Call to Action</Button>
  </div>
  
  {/* Right column - Visual */}
  <div>
    <img src={illustration} className="w-full rounded-2xl" />
  </div>
</div>
```

### Centered Content Block

```tsx
<div className="max-w-3xl mx-auto text-center space-y-6 py-16 border-t border-b">
  <h2 className="text-2xl font-bold italic">Section Title</h2>
  <p className="text-lg leading-relaxed text-muted-foreground/90">
    Centered paragraph content with comfortable line length for reading.
  </p>
</div>
```

### Stacked Cards with Spacing

```tsx
<div className="space-y-8">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="p-6">
        {/* Card content */}
      </Card>
    </motion.div>
  ))}
</div>
```

---

## Best Practices

1. **Container First**: Always wrap page content in the container system
2. **Max-Width Strategy**: Use appropriate max-widths for content type
3. **Vertical Rhythm**: Use consistent spacing scale (4, 6, 8, 12, 24)
4. **Mobile First**: Design for mobile, enhance for desktop
5. **Grid Flexibility**: Use responsive grid columns (1 → 2 → 3/4)
6. **Text Centering**: Center hero content, left-align body text
7. **Section Breaks**: Use large spacing (space-y-24) between major sections
8. **Responsive Padding**: Scale padding with screen size
9. **Equal Heights**: Use auto-rows-fr for consistent card heights in grids
10. **Breathing Room**: Prefer generous spacing over cramped layouts

---

## Quick Reference

```tsx
// Page container
<div className="container mx-auto px-6 py-12">

// Content width
<div className="max-w-3xl mx-auto">

// Section spacing
<div className="space-y-12">

// Grid (3 columns)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive text
<h1 className="text-4xl md:text-6xl lg:text-7xl">

// Responsive spacing
<div className="py-12 md:py-16 lg:py-24">
```


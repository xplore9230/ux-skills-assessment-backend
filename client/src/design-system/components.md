# Component Library

Complete reference for all UI components in the UX Skills Assessment design system.

## Table of Contents

1. [Primitive Components](#primitive-components)
   - [Button](#button)
   - [Card](#card)
   - [Badge](#badge)
   - [Input](#input)
2. [Custom Components](#custom-components)
   - [AnswerOption](#answeroption)
   - [CategoryCard](#categorycard)
   - [WeekCard](#weekcard)
   - [ProgressBar](#progressbar)
   - [ScoreOdometer](#scoreodometer)
   - [DeepDiveSection](#deepdivesection)
   - [PremiumLock](#premiumlock)

---

## Primitive Components

Foundational UI components from shadcn/ui, customized for the design system.

### Button

Interactive button component with multiple variants and sizes.

#### Variants

**Default** - Primary call-to-action button
```tsx
<Button>Primary Action</Button>
```
- White background with black text
- Border with elevation system
- Best for: Primary CTAs, submit actions

**Outline** - Secondary action button
```tsx
<Button variant="outline">Secondary Action</Button>
```
- Transparent background with outline
- Shows card background color
- Best for: Secondary actions, cancel buttons

**Ghost** - Minimal button style
```tsx
<Button variant="ghost">Ghost Button</Button>
```
- No visible border or background
- Subtle hover state
- Best for: Tertiary actions, navigation links

**Secondary** - Alternative style button
```tsx
<Button variant="secondary">Secondary Button</Button>
```
- Dark background (10% white)
- White text
- Best for: Alternative primary actions

**Destructive** - Warning/delete actions
```tsx
<Button variant="destructive">Delete</Button>
```
- High contrast for destructive actions
- White background, black text
- Best for: Delete, remove, destructive actions

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icon />
</Button>
```

- **sm**: min-height 32px, text-xs
- **default**: min-height 36px, text-sm
- **lg**: min-height 40px, text-base
- **icon**: 36×36px square for icon-only buttons

#### With Icons

```tsx
import { ArrowRight } from "lucide-react";

<Button>
  Continue
  <ArrowRight className="w-4 h-4 ml-2" />
</Button>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `default \| destructive \| outline \| secondary \| ghost` | `default` | Visual style variant |
| `size` | `default \| sm \| lg \| icon` | `default` | Size variant |
| `asChild` | `boolean` | `false` | Render as child element (Radix Slot) |
| `disabled` | `boolean` | `false` | Disabled state |

#### Accessibility

- Keyboard navigable
- Focus visible with ring
- Minimum 44px touch target (use `size="lg"`)
- Use descriptive text or `aria-label` for icon-only buttons

#### Usage Examples

```tsx
// Primary CTA with icon
<Button size="lg" className="rounded-xl group">
  Take the UX Quiz
  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
</Button>

// Navigation button
<Button variant="ghost" onClick={handlePrevious}>
  <ChevronLeft className="w-4 h-4" />
  Previous
</Button>

// Destructive action
<Button variant="destructive" onClick={handleDelete}>
  <Trash className="w-4 h-4 mr-2" />
  Delete Assessment
</Button>
```

---

### Card

Container component for grouped content with consistent styling.

#### Components

The Card system includes multiple sub-components:

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
```

#### Basic Usage

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer actions or metadata
  </CardFooter>
</Card>
```

#### Styling

- **Background**: Black (`bg-card`)
- **Border**: 15% white (`border-card-border`)
- **Border Radius**: 12px (`rounded-xl`)
- **Shadow**: Flat design (no shadows)
- **Padding**: 24px (`p-6`) per section

#### Usage in Quiz

```tsx
<Card className="p-6 md:p-12 space-y-8">
  <div className="space-y-4">
    <p className="text-sm font-semibold uppercase tracking-wide">
      {question.category}
    </p>
    <h2 className="text-3xl font-bold">
      {question.text}
    </h2>
  </div>
  <div className="space-y-4">
    {/* Options */}
  </div>
</Card>
```

#### Props

All card components accept standard HTML div props plus:

| Component | Common Classes |
|-----------|----------------|
| `Card` | `rounded-xl border bg-card border-card-border` |
| `CardHeader` | `flex flex-col space-y-1.5 p-6` |
| `CardTitle` | `text-2xl font-semibold` |
| `CardDescription` | `text-sm text-muted-foreground` |
| `CardContent` | `p-6 pt-0` |
| `CardFooter` | `flex items-center p-6 pt-0` |

---

### Badge

Small status indicator or label component.

#### Variants

```tsx
<Badge>Default Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

#### Styling

- **Size**: text-xs, px-2.5, py-0.5
- **Border**: rounded-md
- **Font**: font-semibold
- **Behavior**: No wrap, inline-flex
- **Interaction**: Hover elevation

#### Usage Examples

```tsx
// Status badge
<Badge variant="outline" className="rounded-full">
  Assessment Complete
</Badge>

// Category labels
<Badge variant="outline">Pillar: UX Research</Badge>
<Badge variant="outline">Level: Intermediate</Badge>

// Tags
<Badge variant="secondary" className="text-xs">
  User Testing
</Badge>
```

#### Best Practices

- Use for status indicators, category labels, and tags
- Keep text short (1-3 words)
- Pair with semantic colors when needed
- Add rounded-full for pill-style badges

---

### Input

Text input field component.

#### Basic Usage

```tsx
<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
```

#### Styling

- **Border**: 15% white border
- **Background**: Transparent
- **Border Radius**: rounded-md
- **Height**: h-9 (36px)
- **Padding**: px-3 py-1
- **Font**: text-sm
- **Focus**: Ring on focus-visible

#### With Label

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com" 
  />
</div>
```

#### States

```tsx
// Disabled
<Input disabled placeholder="Disabled input" />

// With error (custom styling)
<Input 
  className="border-destructive" 
  placeholder="Invalid input" 
/>
```

#### Accessibility

- Always pair with Label component
- Use proper input types (email, password, tel, etc.)
- Include placeholder for additional context
- Use aria-describedby for error messages

---

## Custom Components

Application-specific components built for the UX Skills Assessment.

### AnswerOption

Radio-style selection component for quiz questions.

#### Props

```typescript
interface AnswerOptionProps {
  value: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}
```

#### Usage

```tsx
<AnswerOption
  value={1}
  label="I conduct basic usability tests with direct guidance"
  isSelected={selectedAnswer === 1}
  onClick={() => handleAnswer(1)}
/>
```

#### Visual Design

- **Layout**: Flex row with radio button + label
- **Radio Button**: 
  - Unselected: 20px circle with border
  - Selected: Filled with inner dot
- **Spacing**: gap-3 between radio and text
- **Padding**: p-4 for touch targets
- **Hover**: bg-muted/50 background
- **Animation**: Fade in from bottom (y: 10)

#### States

```tsx
// Unselected
border-muted-foreground hover:border-foreground

// Selected  
border-primary bg-primary
```

#### Code Example

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex gap-4 items-start cursor-pointer p-4 rounded-lg hover:bg-muted/50"
  onClick={onClick}
>
  <div className={`
    w-6 h-6 rounded-full border-2 flex items-center justify-center
    ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}
  `}>
    {isSelected && <div className="w-2.5 h-2.5 bg-background rounded-full" />}
  </div>
  <span className="text-base leading-relaxed">{label}</span>
</motion.div>
```

#### Accessibility

- Full keyboard support via parent form
- Cursor pointer on hover
- Adequate touch target size (min 44px)
- data-testid for testing

---

### CategoryCard

Score display card for results page showing category performance.

#### Props

```typescript
interface CategoryCardProps {
  name: string;
  score: number;        // Percentage 0-100
  maxScore: number;     // Always 100
  status: "strong" | "decent" | "needs-work";
}
```

#### Usage

```tsx
<CategoryCard
  name="UX Research"
  score={85}
  maxScore={100}
  status="strong"
/>
```

#### Visual Design

- **Container**: rounded-xl, bg-muted/20
- **Padding**: p-6
- **Hover**: bg-muted/30 transition
- **Layout**: Flex column with space-y-6

#### Components

1. **Header**: Category name + score percentage
2. **Progress Bar**: Animated width based on score
3. **Status Label**: Uppercase text with tracking-widest

#### Animation

```tsx
// Card entrance
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}

// Progress bar
initial={{ width: 0 }}
animate={{ width: `${score}%` }}
transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
```

#### Status Styling

```tsx
status.replace("-", " ")  // "needs-work" → "needs work"
className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
```

#### Responsive Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {categories.map(category => <CategoryCard {...category} />)}
</div>
```

---

### WeekCard

Timeline card component for 4-week improvement plan.

#### Props

```typescript
interface WeekCardProps {
  week: number;
  tasks: string[];
  delay?: number;
}
```

#### Usage

```tsx
<WeekCard
  week={1}
  tasks={[
    "Practice card sorting with real users",
    "Conduct 3 moderated usability tests",
    "Document findings in structured report"
  ]}
  delay={0.2}
/>
```

#### Visual Design

- **Border**: border-l-2 (left accent)
- **Padding**: p-6
- **Gradient**: bg-gradient-to-r from-muted/5 to-transparent
- **Hover**: border-foreground/40 transition

#### Layout Structure

```tsx
<div className="space-y-4">
  <h3 className="text-xl font-bold">Week {week}</h3>
  <ul className="space-y-4">
    {tasks.map(task => (
      <li className="flex items-start gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <span className="text-sm leading-relaxed">{task}</span>
      </li>
    ))}
  </ul>
</div>
```

#### Animation

```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay }}
```

#### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {weeks.map((week, i) => (
    <WeekCard {...week} delay={0.2 + i * 0.1} />
  ))}
</div>
```

---

### ProgressBar

Linear progress indicator for quiz navigation.

#### Props

```typescript
interface ProgressBarProps {
  current: number;    // Current question number (1-based)
  total: number;      // Total questions
}
```

#### Usage

```tsx
<ProgressBar current={4} total={15} />
```

#### Visual Design

- **Text**: "Question X of Y" above bar
- **Bar Height**: h-2 (8px)
- **Bar Background**: bg-muted with border
- **Fill**: bg-foreground (white)
- **Border Radius**: rounded-full

#### Animation

```tsx
<motion.div
  className="h-full bg-foreground"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.5, ease: "easeOut" }}
/>
```

#### Calculation

```tsx
const percentage = (current / total) * 100;
```

#### Full Example

```tsx
<div className="space-y-3">
  <p className="text-sm text-muted-foreground">
    Question {current} of {total}
  </p>
  <div className="h-2 bg-muted rounded-full overflow-hidden border">
    <motion.div
      className="h-full bg-foreground"
      animate={{ width: `${(current/total)*100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
</div>
```

---

### ScoreOdometer

Animated score counter for results page.

#### Props

```typescript
interface ScoreOdometerProps {
  score: number;
  maxScore: number;
  duration?: number;    // Animation duration in seconds
}
```

#### Usage

```tsx
<ScoreOdometer 
  score={72} 
  maxScore={100} 
  duration={0.3} 
/>
```

#### Visual Design

- **Score**: text-8xl md:text-9xl font-bold
- **Max Score**: text-xl md:text-2xl text-muted-foreground
- **Layout**: Flex baseline with gap-2

#### Animation Logic

```typescript
// Counts from 0 to score at 60fps
useEffect(() => {
  let start = 0;
  const increment = score / (duration * 60);
  const interval = setInterval(() => {
    start += increment;
    if (start >= score) {
      setDisplayScore(score);
      clearInterval(interval);
    } else {
      setDisplayScore(Math.floor(start));
    }
  }, 1000 / 60);
  return () => clearInterval(interval);
}, [score, duration]);
```

#### Container Animation

```tsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, ease: "easeOut" }}
```

#### Best Practices

- Use short duration (0.3-0.5s) for immediate feedback
- Display prominently at top of results page
- Pair with stage badge and summary

---

### DeepDiveSection

AI-curated learning resources with topics and materials.

#### Props

```typescript
interface DeepDiveSectionProps {
  topics: DeepDiveTopic[];
  isLoading: boolean;
}

interface DeepDiveTopic {
  name: string;
  pillar: string;
  level: string;
  summary: string;
  practice_points: string[];
  resources: DeepDiveResource[];
}

interface DeepDiveResource {
  title: string;
  type: "article" | "video" | "guide";
  estimated_read_time: string;
  source: string;
  url: string;
  tags: string[];
}
```

#### Usage

```tsx
<DeepDiveSection 
  topics={deepDiveTopics}
  isLoading={isLoadingDeepDive}
/>
```

#### Visual Structure

1. **Header**: Title + description
2. **Topics**: Expandable cards with:
   - Topic name + badges (pillar, level)
   - Summary paragraph
   - Practice points list
   - Resources with metadata
3. **Footer**: AI attribution note

#### Loading State

```tsx
<div className="flex items-center justify-center py-12">
  <Loader className="w-6 h-6 animate-spin mr-3" />
  <span>Finding resources just for you…</span>
</div>
```

#### Resource Card

```tsx
<a
  href={resource.url}
  className="flex items-start justify-between gap-3 p-3 rounded 
             border hover:bg-muted transition-colors group"
>
  <div className="flex-1">
    <p className="font-semibold text-sm group-hover:underline">
      {resource.title}
    </p>
    <p className="text-xs text-muted-foreground">
      {resource.type} · {resource.estimated_read_time} · {resource.source}
    </p>
    <div className="flex gap-1 flex-wrap mt-2">
      {resource.tags.map(tag => <Badge>{tag}</Badge>)}
    </div>
  </div>
  <ExternalLink className="w-4 h-4" />
</a>
```

#### Staggered Animation

```tsx
transition={{ duration: 0.4, delay: 0.7 + topicIndex * 0.1 }}
```

---

### PremiumLock

Feature gating UI for premium content.

#### Props

```typescript
interface PremiumLockProps {
  title: string;
  description: string;
  features: string[];
}
```

#### Usage

```tsx
<PremiumLock
  title="Unlock Full Analysis"
  description="Get detailed insights, personalized learning paths, and career guidance."
  features={[
    "Detailed skill breakdown",
    "Custom learning roadmap",
    "Career trajectory analysis"
  ]}
/>
```

#### Visual Design

- **Container**: rounded-xl, bg-muted/10, border
- **Layout**: Centered content with flex column
- **Spacing**: space-y-6 between sections
- **CTA**: Full-width button with Sparkles icon

#### Features List

```tsx
<ul className="space-y-2">
  {features.map(feature => (
    <li className="flex items-center justify-center gap-2">
      <span className="w-1 h-1 rounded-full bg-foreground/40" />
      <span>{feature}</span>
    </li>
  ))}
</ul>
```

#### CTA Button

```tsx
<Button className="w-full gap-2 bg-foreground text-background">
  Unlock Report
  <Sparkles className="w-3 h-3" />
</Button>
<p className="text-[10px] uppercase tracking-widest mt-3">
  One-time payment • $19
</p>
```

---

## Component Composition Patterns

### Stacking Components

```tsx
// Vertical spacing with space-y
<div className="space-y-6">
  <Component1 />
  <Component2 />
  <Component3 />
</div>

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

### Responsive Design

```tsx
// Text sizing
<h1 className="text-4xl md:text-6xl lg:text-7xl">

// Spacing
<div className="py-12 md:py-16 lg:py-24">

// Layout
<div className="grid grid-cols-1 md:grid-cols-2">
```

### Animation Staggering

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    <Component {...item} />
  </motion.div>
))}
```

---

## Testing

All components include data-testid attributes for reliable testing:

```tsx
data-testid="button-start-quiz"
data-testid="text-question"
data-testid="option-1"
data-testid="text-progress"
data-testid="progress-bar-fill"
```

Use these for E2E and integration tests:

```typescript
const button = screen.getByTestId('button-start-quiz');
await user.click(button);
```

---

## Best Practices

1. **Consistency**: Use existing components before creating new ones
2. **Composition**: Combine small components into larger patterns
3. **Accessibility**: Always include proper ARIA attributes and keyboard support
4. **Animation**: Use subtle, purposeful animations (calm premium feel)
5. **Responsiveness**: Test on mobile, tablet, and desktop breakpoints
6. **Testing**: Include data-testid attributes for critical interactive elements
7. **Performance**: Use memo() for components that receive stable props
8. **Typography**: Follow the typography scale from tokens
9. **Spacing**: Use the spacing scale (4, 6, 8, 12) consistently
10. **Dark Mode**: All components are designed for dark mode (black background)


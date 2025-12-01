# UX Skills Assessment Quiz - Design Guidelines

## Design Approach
Premium, editorial-focused design inspired by high-end publishing platforms. The application prioritizes calm confidence and professional credibility through restrained visual treatment and generous spacing.

## Core Visual Identity

### Color Palette
- **Primary Backgrounds**: #050814 (deepest dark), #0C101C (elevated surfaces)
- **Accent Colors**: #F4B731 (soft gold - primary CTAs), #F97316 (muted orange - highlights), #2DD4BF (teal - alternative accent)
- **Text**: White/off-white for primary content, reduced opacity for secondary text
- **Accents**: Use sparingly - only for key highlights, selected states, and CTAs

### Typography System
**Serif Throughout**: Use Newsreader or Playfair Display for all text to create an elegant, editorial feel:
- **Headings**: Large serif (48-72px) for main headlines, 32-48px for section titles
- **Body Text**: Serif at 16-18px for high legibility
- **UI Elements**: Same serif family at 14-16px for buttons and labels
- **Hierarchy**: Achieved through size, weight variations (400, 500, 600, 700), and letter-spacing

### Layout System
**Spacing Units**: Use Tailwind spacing with emphasis on generous breathing room
- **Common units**: 8, 12, 16, 24, 32, 48 (p-8, p-12, py-16, py-24, py-32, py-48)
- **Section padding**: py-24 to py-32 on desktop, py-12 to py-16 on mobile
- **Card padding**: p-8 to p-12 for content cards
- **Element spacing**: gap-6 to gap-8 for stacked elements

### Component Design

**Buttons**:
- Solid accent background (#F4B731) with white text for primary CTAs
- Ghost style (border with accent color, transparent bg) for secondary actions
- Rounded corners (rounded-lg to rounded-xl)
- Generous padding (px-8 py-4)
- Subtle hover: slight scale (1.02) and brightness increase

**Cards**:
- Background: #0C101C on #050814 base
- Rounded corners: rounded-2xl
- Soft shadows for depth
- Generous internal padding (p-8 to p-12)

**Input Elements** (Quiz Options):
- Full-width pill-style buttons (rounded-full)
- Default: Dark background (#0C101C) with border
- Selected: Solid accent background (#F4B731) with white text
- Smooth transition on state change

**Progress Indicators**:
- Horizontal bar style with accent fill
- Text label showing "Question X of 15"
- Positioned at top of quiz cards

## Page-Specific Layouts

### Landing Page
**Two-column split layout** (responsive to single column on mobile):

**Left Column** (60% width):
- Hero headline: "Find Your UX Career Stage" (large serif, 56-72px)
- Supporting description (20-24px serif, reduced opacity)
- Primary CTA button: "Take the UX Quiz"
- Vertical spacing: gap-8 between elements

**Right Column** (40% width):
- Mock "UX Report Card" preview card
- Contains: Stage label, circular score indicator, capability tags
- Subtle blurred glow behind card using accent color
- Floating/elevated appearance with shadow

### Quiz Screen
**Centered card design** (max-w-3xl):
- Top: Progress indicator ("Question 4 of 15" + progress bar)
- Middle: Question text (serif, 24-28px)
- Below: 5 stacked pill-style answer options (full-width, gap-4)
- Bottom: Sticky navigation bar with "Previous" (ghost) and "Next" (solid accent)

### Results Screen
**Vertical sections with clear hierarchy**:

**Top Section**: 
- Large stage badge (e.g., "Emerging Senior")
- One-line summary beneath

**Middle Section**: 
- 5 category breakdown cards in grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each card shows: Category name, score (X/15), horizontal bar indicator
- Cards use #0C101C background with rounded corners

**Bottom Section**: 
- 4-week improvement plan
- 4 vertical cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Each week card: Title, 2-3 bullet points
- Consistent card styling throughout

## Animations & Interactions
- **Page transitions**: Fade-and-slide (fade in while translating Y)
- **Progress bar**: Smooth width transition (duration-500)
- **Hover states**: Scale 1.02, brightness increase (very subtle)
- **Card reveals**: Staggered fade-in on results screen
- No flashy gradients or playful animations - maintain calm, premium feel

## Images
**Landing page hero**: Use a high-quality image showing UX designers at work or abstract design elements. Place in the right column as background for the mock report card, or as a subtle full-width background with overlay.

**Results screen**: Optional abstract geometric patterns or subtle grid overlays as decorative elements - not required.

## Accessibility
- High contrast text (white on dark backgrounds)
- Clear focus states for keyboard navigation
- Readable font sizes (minimum 16px for body)
- Sufficient spacing for touch targets (minimum 44px height for interactive elements)
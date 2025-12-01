# UX Skills Assessment Quiz

## Overview

A premium, dark-themed web application that assesses UX designers' skills across five key areas and provides personalized career stage identification with improvement recommendations. The app guides users through a 15-question self-assessment quiz, calculates their proficiency levels, and generates a comprehensive report with a 4-week improvement plan.

The application features an editorial-inspired design using serif typography (Playfair Display), generous spacing, and a restrained dark color palette (#050814, #0C101C) with selective accent colors (#F4B731 gold, #F97316 orange, #2DD4BF teal) for key highlights and CTAs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI development
- Vite as the build tool and development server
- TanStack Query for state management
- Framer Motion for animations and transitions
- Tailwind CSS for styling with shadcn/ui component library

**Component Structure:**
The application follows a page-based architecture with three main views:
1. **Landing Page** - Hero section with CTA and preview of report card
2. **Quiz Page** - Sequential question flow with progress tracking
3. **Results Page** - Career stage badge, category breakdowns, and improvement plan

**Key Design Patterns:**
- Component composition using Radix UI primitives for accessibility
- Custom theming through CSS variables defined in index.css
- Responsive design with mobile-first approach
-Animation system using Framer Motion for fade/slide transitions
- State management through React hooks (useState for local state)

**Routing:**
Single-page application with state-based view switching (no React Router). App state managed in App.tsx controls which page component renders.

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Separate entry points for development (index-dev.ts with Vite middleware) and production (index-prod.ts with static file serving)
- In-memory storage implementation (MemStorage class) for user data

**API Structure:**
Routes registered through registerRoutes function in routes.ts, prefixed with /api. Currently minimal backend functionality as quiz logic runs client-side.

**Development vs Production:**
- Development: Vite dev server integrated as Express middleware with HMR
- Production: Built client assets served from dist/public directory

### Data Layer

**Schema Definition:**
Drizzle ORM with PostgreSQL dialect for database schema definition in shared/schema.ts. Currently includes basic user table with id, username, and password fields.

**Storage Interface:**
IStorage interface in storage.ts defines CRUD operations. MemStorage provides in-memory implementation for development. Production would use database-backed implementation.

**Data Flow:**
Quiz questions and scoring logic are client-side:
- Questions defined in client/src/data/questions.ts (5 categories × 3 questions each)
- Scoring algorithm in client/src/lib/scoring.ts calculates career stage and generates improvement plans
- No persistence of quiz results currently implemented

### Styling System

**Tailwind Configuration:**
Custom theme extending default Tailwind with:
- CSS variable-based color system for theme switching
- Custom border radius values
- Font families: Playfair Display (serif for headings/body), Lexend (sans for UI elements)
- Shadcn/ui component aliases (@/components, @/lib, @/hooks)

**Design Token System:**
Color tokens defined as HSL values in CSS variables supporting light/dark modes:
- Background layers (background, card, popover)
- Interactive states (primary, secondary, muted, accent, destructive)
- Borders and shadows with opacity-based variations

**Component Variants:**
Class Variance Authority (CVA) for component variant management, particularly in Button, Badge, and other UI primitives.

### Build & Deployment

**Build Process:**
1. Client build: Vite bundles React app to dist/public
2. Server build: esbuild bundles Express server to dist/index.js
3. Production server serves pre-built client assets

**Development Workflow:**
Hot module replacement via Vite dev server, TypeScript type checking without emit, path aliases for clean imports.

## External Dependencies

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessible UI components (accordion, dialog, dropdown, popover, progress, radio-group, select, slider, switch, tabs, toast, tooltip)
- **shadcn/ui**: Pre-built component library built on Radix UI with Tailwind styling
- **Lucide React**: Icon library for UI elements
- **Embla Carousel**: Carousel/slider functionality

### Animation & Interaction
- **Framer Motion**: Declarative animation library for page transitions and component animations
- **cmdk**: Command menu component

### Form Handling
- **React Hook Form**: Form state management and validation
- **@hookform/resolvers**: Validation resolver integration
- **Zod**: Schema validation library
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### Database & ORM
- **Drizzle ORM**: TypeScript ORM for database operations
- **@neondatabase/serverless**: Neon Database serverless driver for PostgreSQL
- **drizzle-kit**: CLI tool for schema migrations and push operations

### Utility Libraries
- **clsx & tailwind-merge**: Utility for conditional CSS class composition
- **class-variance-authority**: Type-safe component variant management
- **date-fns**: Date manipulation and formatting

### Development Tools
- **TypeScript**: Type safety across client and server
- **Vite**: Fast build tool and dev server with HMR
- **PostCSS & Autoprefixer**: CSS processing
- **@replit plugins**: Replit-specific development enhancements (error modal, cartographer, dev banner)

### State Management
- **TanStack Query (React Query)**: Server state management and data fetching

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express (configured but user authentication not yet implemented)
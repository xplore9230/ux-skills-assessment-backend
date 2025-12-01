# Loading & Empty States

Patterns for providing feedback during asynchronous operations and handling empty or error states.

## State Types

The application handles several UI states:

1. **Loading States**: Data is being fetched or processed
2. **Empty States**: No data available
3. **Error States**: Something went wrong
4. **Success States**: Operation completed successfully
5. **Skeleton States**: Content placeholders while loading

---

## Loading States

### Loading Spinner

Standard circular spinner for general loading.

```tsx
import { Loader } from "lucide-react";

// Basic spinner
<div className="flex justify-center py-12">
  <Loader className="w-8 h-8 animate-spin" />
</div>

// With message
<div className="flex items-center justify-center py-12">
  <Loader className="w-6 h-6 animate-spin mr-3" />
  <span className="animate-pulse">Loading...</span>
</div>

// Inline loading
<Button disabled>
  <Loader className="w-4 h-4 animate-spin mr-2" />
  Processing...
</Button>
```

#### Styling

```tsx
// Size variations
w-4 h-4   16px - Inline/button
w-6 h-6   24px - Default
w-8 h-8   32px - Prominent

// Border width
border-2  Small icons
border-4  Medium/large icons
```

#### Complete Pattern

```tsx
<div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
```

### Loading Messages

Contextual messages during async operations.

```tsx
// AI generation
<div className="text-center py-12 space-y-4">
  <div className="flex justify-center">
    <Loader className="w-8 h-8 animate-spin" />
  </div>
  <p className="text-muted-foreground animate-pulse">
    AI analyzing your career stage...
  </p>
</div>

// Resource loading
<div className="space-y-4">
  <h2 className="text-3xl font-bold">Curated Resources</h2>
  <div className="flex justify-center mt-4">
    <Loader className="w-6 h-6 animate-spin" />
  </div>
</div>

// Job search
<div className="text-center">
  <h2 className="text-2xl font-bold">Finding Relevant Roles...</h2>
  <div className="flex justify-center mt-4">
    <Loader className="w-6 h-6 animate-spin" />
  </div>
</div>
```

### Loading Sections

Preserve layout while loading content.

```tsx
// Results page sections
{isLoadingResources ? (
  <div className="space-y-8 opacity-60">
    <div className="text-center">
      <h2 className="text-3xl font-serif font-bold mb-2">
        Curated Resources
      </h2>
      <div className="flex justify-center mt-4">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    </div>
  </div>
) : (
  <ResourceSection resources={resources} />
)}
```

### Progress Indicators

Show progress through multi-step processes.

```tsx
// Quiz progress
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

// Upload progress
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Uploading...</span>
    <span>{progress}%</span>
  </div>
  <div className="h-2 bg-muted rounded-full overflow-hidden">
    <div 
      className="h-full bg-foreground transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

---

## Empty States

### No Data Available

When a section has no content to display.

```tsx
// No resources
{resources.length === 0 && !isLoading && (
  <div className="text-center py-16 space-y-4">
    <div className="flex justify-center">
      <Search className="w-12 h-12 text-muted-foreground/50" />
    </div>
    <h3 className="text-xl font-semibold">No Resources Found</h3>
    <p className="text-muted-foreground max-w-sm mx-auto">
      We couldn't find any resources for your current stage. 
      Please check back later.
    </p>
  </div>
)}

// No deep dive topics
{topics.length === 0 && !isLoading && (
  <div className="text-center py-12 text-muted-foreground">
    <p>No personalized topics available at this time.</p>
  </div>
)}
```

### Empty State Pattern

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 space-y-6 max-w-md mx-auto">
      {icon && (
        <div className="flex justify-center opacity-50">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage
<EmptyState
  icon={<Search className="w-12 h-12" />}
  title="No Results Found"
  description="Try adjusting your search criteria"
  action={{
    label: "Clear Filters",
    onClick: handleClearFilters
  }}
/>
```

---

## Error States

### Error Messages

Display errors clearly and offer recovery options.

```tsx
// Error with retry
{error && (
  <div className="text-center py-12 space-y-4">
    <div className="flex justify-center">
      <AlertTriangle className="w-12 h-12 text-yellow-500" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">Something Went Wrong</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {error.message || "Failed to load resources. Please try again."}
      </p>
    </div>
    <Button onClick={handleRetry} variant="outline">
      Try Again
    </Button>
  </div>
)}

// Inline error
{resourcesError && (
  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold">Failed to Load Resources</p>
        <p className="text-sm text-muted-foreground">
          {resourcesError.message}
        </p>
      </div>
    </div>
  </div>
)}
```

### Form Validation Errors

```tsx
// Field error
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-sm text-destructive flex items-center gap-1">
      <X className="w-3 h-3" />
      {errors.email.message}
    </p>
  )}
</div>

// Form-level error
{formError && (
  <div role="alert" className="p-4 border border-destructive rounded-lg bg-destructive/5">
    <div className="flex items-center gap-2">
      <X className="w-5 h-5 text-destructive" />
      <p className="font-semibold">Submission Failed</p>
    </div>
    <p className="text-sm text-muted-foreground mt-2">
      {formError.message}
    </p>
  </div>
)}
```

### Error Boundaries

```tsx
// ErrorBoundary component
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Please refresh the page to continue.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Success States

### Success Messages

Confirm successful operations.

```tsx
// Toast notification (future implementation)
<div className="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-3">
  <Check className="w-5 h-5" />
  <p>Assessment completed successfully!</p>
</div>

// Inline success
<div className="p-4 border border-green-500/50 rounded-lg bg-green-500/10">
  <div className="flex items-center gap-3">
    <Check className="w-5 h-5 text-green-500" />
    <p>Your report has been saved</p>
  </div>
</div>

// Success page state
<div className="text-center py-16 space-y-6">
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="flex justify-center"
  >
    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
      <Check className="w-10 h-10 text-green-500" />
    </div>
  </motion.div>
  <div className="space-y-2">
    <h1 className="text-3xl font-bold">Success!</h1>
    <p className="text-muted-foreground">
      Your assessment has been completed.
    </p>
  </div>
  <Button onClick={handleViewResults}>
    View Results
  </Button>
</div>
```

---

## Skeleton Loading

Placeholder content while data loads (future enhancement).

```tsx
// Skeleton card
function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl bg-card border animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-2 bg-muted rounded-full w-full" />
      </div>
    </div>
  );
}

// Skeleton text
function SkeletonText() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-5/6" />
      <div className="h-4 bg-muted rounded w-4/6" />
    </div>
  );
}

// Usage
{isLoading ? (
  <div className="grid grid-cols-3 gap-6">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
) : (
  <CategoryCardsGrid categories={categories} />
)}
```

---

## Conditional Rendering Patterns

### Loading → Content

```tsx
{isLoading ? (
  <LoadingSpinner />
) : (
  <Content data={data} />
)}
```

### Loading → Error → Content

```tsx
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage error={error} onRetry={refetch} />
) : (
  <Content data={data} />
)}
```

### Loading → Empty → Content

```tsx
{isLoading ? (
  <LoadingSpinner />
) : data.length === 0 ? (
  <EmptyState />
) : (
  <Content data={data} />
)}
```

### Complete Pattern

```tsx
function DataSection() {
  const { data, isLoading, error } = useQuery();
  
  if (isLoading) {
    return <LoadingSpinner message="Loading resources..." />;
  }
  
  if (error) {
    return (
      <ErrorMessage 
        error={error}
        onRetry={() => refetch()}
      />
    );
  }
  
  if (!data || data.length === 0) {
    return <EmptyState title="No data available" />;
  }
  
  return <Content data={data} />;
}
```

---

## ARIA Live Regions

Announce state changes to screen readers.

```tsx
// Polite announcements
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {isLoading && "Loading content"}
  {error && `Error: ${error.message}`}
  {success && "Content loaded successfully"}
</div>

// Assertive announcements (errors)
<div
  role="alert"
  aria-live="assertive"
  className="sr-only"
>
  {error && `Error: ${error.message}`}
</div>

// Results page example
<div role="status" aria-live="polite" className="sr-only">
  {isLoadingResources && "Loading curated resources"}
  {isLoadingDeepDive && "Generating personalized study paths"}
  {isLoadingJobs && "Finding relevant job opportunities"}
</div>
```

---

## Best Practices

### Loading States

1. **Show immediately**: Display loading state within 100ms
2. **Provide context**: Explain what's loading
3. **Preserve layout**: Prevent content jumps
4. **Use spinners**: For indeterminate loading
5. **Use progress**: When duration/percentage is known
6. **Animate subtly**: Use animate-pulse for text
7. **Center in context**: Don't always center on page

### Empty States

1. **Be helpful**: Explain why it's empty
2. **Offer actions**: Provide next steps when possible
3. **Use icons**: Visual representation helps understanding
4. **Stay on-brand**: Maintain premium, calm aesthetic
5. **Don't apologize**: Be informative, not apologetic

### Error States

1. **Be specific**: Clear, actionable error messages
2. **Offer recovery**: Retry button or alternative action
3. **Log errors**: Console log for debugging
4. **Friendly tone**: Helpful, not technical jargon
5. **Visual hierarchy**: Icon + title + description + action

### Success States

1. **Confirm action**: Clear success confirmation
2. **Brief display**: Don't require dismissal unless important
3. **Next steps**: Guide user to next action
4. **Positive tone**: Celebrate the success appropriately

---

## Quick Reference

```tsx
// Loading spinner
<Loader className="w-6 h-6 animate-spin" />

// Loading with message
<div className="flex items-center justify-center py-12">
  <Loader className="w-6 h-6 animate-spin mr-3" />
  <span className="animate-pulse">Loading...</span>
</div>

// Progress bar
<div className="h-2 bg-muted rounded-full">
  <div className="h-full bg-foreground" style={{ width: `${progress}%` }} />
</div>

// Empty state
<div className="text-center py-16 space-y-4">
  <Icon className="w-12 h-12 mx-auto opacity-50" />
  <h3 className="text-xl font-semibold">No Data</h3>
  <p className="text-muted-foreground">Description</p>
</div>

// Error state
<div className="flex items-start gap-3 p-4 border border-destructive/50 rounded">
  <AlertTriangle className="w-5 h-5 text-destructive" />
  <div>
    <p className="font-semibold">Error Title</p>
    <p className="text-sm text-muted-foreground">Error description</p>
  </div>
</div>

// Success message
<div className="flex items-center gap-2 text-green-500">
  <Check className="w-5 h-5" />
  <span>Success message</span>
</div>
```

---

## Resources

- [Loading States UX](https://www.nngroup.com/articles/progress-indicators/)
- [Empty States Design](https://www.smashingmagazine.com/2020/08/empty-states-mobile-apps/)
- [Error Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)


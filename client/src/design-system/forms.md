# Form Patterns

Guidelines for creating accessible, user-friendly forms in the UX Skills Assessment application.

## Form Philosophy

- **Clarity**: Clear labels and instructions
- **Accessibility**: Keyboard navigable with screen reader support
- **Validation**: Real-time feedback where appropriate
- **Error Handling**: Helpful, specific error messages
- **Progressive Disclosure**: Show complexity only when needed

---

## Quiz Form Pattern

The primary form in the application is the quiz itself.

### Quiz Structure

```tsx
function QuizPage({ questions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress indicator */}
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      
      {/* Question card */}
      <Card className="p-6 md:p-12 space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {currentQuestion.category}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold">
            {currentQuestion.text}
          </h2>
        </div>
        
        {/* Radio group */}
        <div className="space-y-4" role="radiogroup" aria-labelledby="question-text">
          {currentQuestion.options.map(option => (
            <AnswerOption
              key={option.value}
              value={option.value}
              label={option.label}
              isSelected={answers[currentQuestion.id] === option.value}
              onClick={() => handleAnswer(option.value)}
            />
          ))}
        </div>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={handlePrevious}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!isAnswered}>
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Answer Selection Pattern

```tsx
// AnswerOption component (radio button style)
<div
  role="radio"
  aria-checked={isSelected}
  tabIndex={isSelected ? 0 : -1}
  onClick={onClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
  className={`
    flex gap-4 items-start cursor-pointer p-4 rounded-lg
    transition-colors hover:bg-muted/50
  `}
>
  {/* Visual radio button */}
  <div className={`
    w-6 h-6 rounded-full border-2 flex items-center justify-center
    ${isSelected 
      ? 'border-primary bg-primary' 
      : 'border-muted-foreground hover:border-foreground'
    }
  `}>
    {isSelected && (
      <div className="w-2.5 h-2.5 bg-background rounded-full" />
    )}
  </div>
  
  {/* Label text */}
  <span className="text-base leading-relaxed flex-1">
    {label}
  </span>
</div>
```

---

## Form Components

### Input Field

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Basic input
<div className="space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input 
    id="name" 
    type="text" 
    placeholder="Your name"
  />
</div>

// With helper text
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com"
  />
  <p className="text-xs text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

### Input States

```tsx
// Default state
<Input type="text" placeholder="Enter text" />

// Disabled state
<Input type="text" disabled placeholder="Disabled" />

// With error
<Input 
  type="email"
  aria-invalid={true}
  className="border-destructive"
/>

// With success (custom)
<Input 
  type="email"
  className="border-green-500"
/>
```

### Labels

Always associate labels with inputs:

```tsx
// ✓ Explicit label (preferred)
<Label htmlFor="username">Username</Label>
<Input id="username" type="text" />

// ✓ Implicit label
<Label>
  Username
  <Input type="text" />
</Label>

// ✗ No label (bad)
<Input placeholder="Username" />  {/* Not accessible */}
```

---

## Validation

### Real-Time Validation

```tsx
function EmailInput() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  
  const validateEmail = (value: string) => {
    if (!value) {
      setError("");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email");
    } else {
      setError("");
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? "email-error" : undefined}
        className={error ? "border-destructive" : ""}
      />
      {error && (
        <p id="email-error" role="alert" className="text-sm text-destructive flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
```

### Form-Level Validation

```tsx
function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## Error Messages

### Field-Level Errors

```tsx
// Single field error
{errors.email && (
  <p id="email-error" role="alert" className="text-sm text-destructive flex items-center gap-1">
    <X className="w-3 h-3" />
    {errors.email}
  </p>
)}

// With icon and styling
<div className="flex items-start gap-2 p-3 border border-destructive/50 rounded bg-destructive/10">
  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
  <p className="text-sm text-destructive">{error}</p>
</div>
```

### Form-Level Errors

```tsx
// Error banner
{formError && (
  <div role="alert" className="p-4 border border-destructive rounded-lg bg-destructive/5">
    <div className="flex items-center gap-2 mb-2">
      <X className="w-5 h-5 text-destructive" />
      <p className="font-semibold">Unable to Submit</p>
    </div>
    <p className="text-sm text-muted-foreground">
      {formError.message}
    </p>
  </div>
)}

// Error list
{errors.length > 0 && (
  <div role="alert" className="p-4 border border-destructive rounded-lg bg-destructive/5">
    <p className="font-semibold mb-2">Please fix the following errors:</p>
    <ul className="space-y-1">
      {errors.map((error, i) => (
        <li key={i} className="text-sm flex items-center gap-2">
          <X className="w-3 h-3 text-destructive" />
          {error}
        </li>
      ))}
    </ul>
  </div>
)}
```

---

## Required Fields

### Visual Indicators

```tsx
// Asterisk indicator
<Label htmlFor="name">
  Name
  <span className="text-destructive ml-1" aria-label="required">*</span>
</Label>
<Input id="name" required aria-required="true" />

// (Required) text
<Label htmlFor="email">
  Email <span className="text-muted-foreground text-xs">(required)</span>
</Label>
<Input id="email" type="email" required aria-required="true" />
```

### Fieldset for Related Fields

```tsx
<fieldset className="space-y-4">
  <legend className="text-lg font-semibold mb-4">Contact Information</legend>
  
  <div className="space-y-2">
    <Label htmlFor="name">
      Name <span className="text-destructive">*</span>
    </Label>
    <Input id="name" required aria-required="true" />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="email">
      Email <span className="text-destructive">*</span>
    </Label>
    <Input id="email" type="email" required aria-required="true" />
  </div>
</fieldset>
```

---

## Form Layout

### Vertical Stacking (Default)

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="field1">Field 1</Label>
    <Input id="field1" />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="field2">Field 2</Label>
    <Input id="field2" />
  </div>
  
  <Button type="submit">Submit</Button>
</form>
```

### Horizontal Layout (Side-by-Side)

```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label htmlFor="firstName">First Name</Label>
      <Input id="firstName" />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="lastName">Last Name</Label>
      <Input id="lastName" />
    </div>
  </div>
  
  <Button type="submit">Submit</Button>
</form>
```

---

## Submit Buttons

### Primary Submit

```tsx
<Button type="submit" size="lg" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader className="w-4 h-4 animate-spin mr-2" />
      Submitting...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

### With Cancel

```tsx
<div className="flex items-center justify-between gap-4">
  <Button type="button" variant="outline" onClick={onCancel}>
    Cancel
  </Button>
  <Button type="submit" disabled={isSubmitting || !isValid}>
    {isSubmitting ? "Submitting..." : "Submit"}
  </Button>
</div>
```

### Submit & Save Pattern

```tsx
<div className="flex items-center justify-end gap-4">
  <Button type="button" variant="outline" onClick={handleSaveDraft}>
    Save Draft
  </Button>
  <Button type="submit" disabled={!isValid}>
    Submit
  </Button>
</div>
```

---

## Keyboard Navigation

### Tab Order

```tsx
// Natural tab order (follows DOM order)
<form>
  <Input />  {/* Tab 1 */}
  <Input />  {/* Tab 2 */}
  <Button type="submit">Submit</Button>  {/* Tab 3 */}
</form>

// Custom tab order (avoid if possible)
<Input tabIndex={1} />
<Input tabIndex={3} />
<Input tabIndex={2} />
```

### Enter to Submit

```tsx
// Default behavior - Enter submits form
<form onSubmit={handleSubmit}>
  <Input type="text" />
  <Button type="submit">Submit</Button>
</form>

// Prevent Enter in specific fields
<Input
  type="text"
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }}
/>
```

---

## Accessibility Checklist

- [ ] **Labels**: All inputs have associated labels
- [ ] **Required**: Required fields marked visually and with aria-required
- [ ] **Errors**: Error messages linked with aria-describedby
- [ ] **Invalid**: aria-invalid set when field has error
- [ ] **Focus**: Clear focus indicators on all fields
- [ ] **Tab Order**: Logical tab order through form
- [ ] **Submit**: Form submittable via keyboard (Enter key)
- [ ] **Disabled**: Disabled state communicated to screen readers
- [ ] **Fieldsets**: Related fields grouped with fieldset/legend
- [ ] **Help Text**: Helper text associated with aria-describedby

---

## Form Patterns Examples

### Login Form

```tsx
<form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input 
      id="email"
      type="email"
      autoComplete="email"
      required
      aria-required="true"
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input 
      id="password"
      type="password"
      autoComplete="current-password"
      required
      aria-required="true"
    />
  </div>
  
  <Button type="submit" className="w-full" disabled={isLoading}>
    {isLoading ? "Logging in..." : "Log In"}
  </Button>
</form>
```

### Search Form

```tsx
<form onSubmit={handleSearch} className="flex gap-2">
  <Input
    type="search"
    placeholder="Search..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="flex-1"
    aria-label="Search"
  />
  <Button type="submit" size="icon">
    <Search className="w-4 h-4" />
  </Button>
</form>
```

### Contact Form

```tsx
<form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label htmlFor="firstName">
        First Name <span className="text-destructive">*</span>
      </Label>
      <Input id="firstName" required aria-required="true" />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="lastName">
        Last Name <span className="text-destructive">*</span>
      </Label>
      <Input id="lastName" required aria-required="true" />
    </div>
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="email">
      Email <span className="text-destructive">*</span>
    </Label>
    <Input id="email" type="email" required aria-required="true" />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="message">Message</Label>
    <Textarea id="message" rows={5} />
  </div>
  
  <div className="flex justify-end">
    <Button type="submit">Send Message</Button>
  </div>
</form>
```

---

## Best Practices

1. **Label everything**: Every input needs a label
2. **Validate thoughtfully**: Real-time for format, on-submit for required
3. **Clear errors**: Specific, helpful error messages
4. **Disable submit**: When form is invalid or submitting
5. **Show progress**: Loading states during submission
6. **Keyboard friendly**: Fully navigable via keyboard
7. **Autofocus sparingly**: Only on primary action fields
8. **Autocomplete**: Use appropriate autocomplete attributes
9. **Required fields**: Mark visually and semantically
10. **Success feedback**: Confirm successful submissions

---

## Anti-Patterns

❌ **Don't**: Use placeholder as label
```tsx
<Input placeholder="Email" />  {/* No label */}
```

❌ **Don't**: Validate too aggressively
```tsx
onKeyPress={validate}  {/* Validates on every keystroke */}
```

❌ **Don't**: Use generic error messages
```tsx
"Invalid input"  {/* Not helpful */}
```

❌ **Don't**: Disable submit without explanation
```tsx
<Button disabled>Submit</Button>  {/* Why is it disabled? */}
```

✅ **Do**: Use proper labels and helpful feedback
✅ **Do**: Validate at appropriate times
✅ **Do**: Provide specific error messages
✅ **Do**: Explain why actions are disabled

---

## Quick Reference

```tsx
// Basic form field
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input id="field" type="text" />
</div>

// Required field
<Label htmlFor="field">
  Field <span className="text-destructive">*</span>
</Label>
<Input id="field" required aria-required="true" />

// Field with error
<Input
  id="field"
  aria-invalid={true}
  aria-describedby="field-error"
  className="border-destructive"
/>
<p id="field-error" role="alert" className="text-sm text-destructive">
  Error message
</p>

// Submit button
<Button type="submit" disabled={isSubmitting || !isValid}>
  {isSubmitting ? "Submitting..." : "Submit"}
</Button>
```

---

## Resources

- [WAI-ARIA Forms](https://www.w3.org/WAI/tutorials/forms/)
- [Form Design Best Practices](https://www.smashingmagazine.com/2018/08/best-practices-for-mobile-form-design/)
- [Inclusive Forms](https://www.smashingmagazine.com/2019/11/inclusive-forms/)
- [Form Validation UX](https://www.nngroup.com/articles/errors-forms-design-guidelines/)


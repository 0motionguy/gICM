# Modal Grab

> **ID:** `modal-grab`
> **Tier:** 3
> **Token Cost:** 5000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts modal/dialog UI patterns from screenshots and converts them to accessible Radix UI Dialog components with proper focus management, animations, and keyboard handling.

- Modal dialog to Radix Dialog with proper structure
- Overlay generation with backdrop blur and animations
- Form inside modal with validation and submission
- Accessibility compliance (ARIA, focus trap, keyboard nav)

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** modal, dialog, popup, grab modal, overlay, sheet
- **File Types:** N/A
- **Directories:** components/modals, components/dialogs, components/ui

## 🚀 Core Capabilities

### 1. Modal Dialog to Radix Dialog

Transform modal designs into accessible Radix Dialog components with proper structure.

**Best Practices:**
- Use Radix Dialog primitives for accessibility
- Implement proper focus management (focus trap)
- Add keyboard support (Escape to close)
- Include close button with aria-label
- Prevent body scroll when modal is open
- Use portal for proper z-index stacking

**Common Patterns:**

```typescript
// Base modal component using Radix Dialog
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
        'gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
        'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
            'transition-opacity hover:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);

const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

**Controlled Dialog with State:**

```typescript
// Controlled modal component
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ControlledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ControlledDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: ControlledDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

// Usage
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <ControlledDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Edit Profile"
        description="Make changes to your profile here."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Save</Button>
          </>
        }
      >
        {/* Form content */}
      </ControlledDialog>
    </>
  );
}
```

**Gotchas:**
- Always include DialogTitle for accessibility (even if visually hidden)
- Use DialogDescription for context, it's announced by screen readers
- Handle Escape key properly (Radix handles this automatically)
- Test with keyboard-only navigation

### 2. Overlay Generation

Create backdrop overlays with blur effects and smooth animations.

**Best Practices:**
- Use backdrop-blur for modern blur effect
- Implement click-outside-to-close behavior
- Add smooth fade animations for open/close
- Consider reducing motion for a11y preferences
- Ensure proper z-index layering

**Common Patterns:**

```typescript
// Custom overlay styles and animations
const overlayVariants = {
  default: 'bg-black/80',
  light: 'bg-white/80',
  blur: 'bg-black/50 backdrop-blur-sm',
  heavy: 'bg-black/90 backdrop-blur-md',
};

interface CustomOverlayProps {
  variant?: keyof typeof overlayVariants;
  onClick?: () => void;
}

export function CustomOverlay({ variant = 'blur', onClick }: CustomOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 transition-all duration-200',
        overlayVariants[variant],
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
      )}
      onClick={onClick}
    />
  );
}
```

**Animation with Framer Motion:**

```typescript
// Enhanced overlay with Framer Motion
import { motion, AnimatePresence } from 'framer-motion';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export function AnimatedDialog({ open, onOpenChange, children }: AnimatedDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
```

**Gotchas:**
- Test overlay on mobile devices (may need -webkit-backdrop-filter)
- backdrop-blur can impact performance on low-end devices
- Ensure overlay covers entire viewport including scrolled content
- Handle cases where user has `prefers-reduced-motion`

### 3. Form Inside Modal

Modal dialogs containing forms with proper validation and submission handling.

**Best Practices:**
- Prevent modal close while form is submitting
- Show loading state on submit button
- Handle validation errors inline
- Focus first input when modal opens
- Confirm before closing if form has unsaved changes
- Use proper form submission patterns

**Common Patterns:**

```typescript
// Modal with form and validation
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof formSchema>;

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: Partial<FormData>;
}

export function FormModal({ open, onOpenChange, onSubmit, defaultValues }: FormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the details for the new contact.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="John Doe"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Multi-step Form Modal:**

```typescript
// Multi-step form inside modal
export function MultiStepFormModal({ open, onOpenChange }: MultiStepFormModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>Step {step} of {totalSteps}</DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Step content */}
        {step === 1 && <StepOne />}
        {step === 2 && <StepTwo />}
        {step === 3 && <StepThree />}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          {step < totalSteps ? (
            <Button onClick={nextStep}>Continue</Button>
          ) : (
            <Button type="submit">Complete</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Gotchas:**
- Always reset form state when modal closes
- Handle async submission with proper loading states
- Consider autosave for long forms
- Test form validation with screen readers
- Don't trap users in the modal (always provide exit)

### 4. Accessibility Compliance

Ensure modals meet WCAG accessibility standards.

**Best Practices:**
- Include proper ARIA roles and labels
- Implement focus trap (Radix handles this)
- Return focus to trigger element on close
- Support Escape key to close
- Announce modal to screen readers
- Ensure sufficient color contrast

**Common Patterns:**

```typescript
// Fully accessible alert dialog
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelText?: string;
  actionText: string;
  onAction: () => void;
  variant?: 'default' | 'destructive';
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancel',
  actionText,
  onAction,
  variant = 'default',
}: AlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
          role="alertdialog"
          aria-labelledby="alert-title"
          aria-describedby="alert-description"
        >
          <AlertDialogPrimitive.Title
            id="alert-title"
            className="text-lg font-semibold"
          >
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description
            id="alert-description"
            className="text-sm text-muted-foreground"
          >
            {description}
          </AlertDialogPrimitive.Description>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline">{cancelText}</Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                variant={variant === 'destructive' ? 'destructive' : 'default'}
                onClick={onAction}
              >
                {actionText}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
```

**Confirmation Dialog Hook:**

```typescript
// Hook for confirmation dialogs
import { useState, useCallback } from 'react';
import { AlertDialog } from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  actionText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleAction = useCallback((confirmed: boolean) => {
    state.resolve?.(confirmed);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state.resolve]);

  const ConfirmDialog = useCallback(() => {
    if (!state.options) return null;

    return (
      <AlertDialog
        open={state.isOpen}
        onOpenChange={(open) => !open && handleAction(false)}
        title={state.options.title}
        description={state.options.description}
        actionText={state.options.actionText || 'Confirm'}
        cancelText={state.options.cancelText || 'Cancel'}
        variant={state.options.variant}
        onAction={() => handleAction(true)}
      />
    );
  }, [state, handleAction]);

  return { confirm, ConfirmDialog };
}

// Usage
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      description: 'This action cannot be undone. Are you sure?',
      actionText: 'Delete',
      variant: 'destructive',
    });

    if (confirmed) {
      onDelete();
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
      <ConfirmDialog />
    </>
  );
}
```

**Gotchas:**
- AlertDialog must have an action button (required for a11y)
- Never auto-close dialogs that require confirmation
- Test with NVDA, JAWS, and VoiceOver
- Ensure focus returns to trigger after close
- Consider `prefers-reduced-motion` for animations

## 💡 Real-World Examples

### Example 1: Image Preview Modal

```typescript
// Lightbox-style image preview modal
export function ImagePreviewModal({
  images,
  initialIndex,
  open,
  onOpenChange
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-black/95">
        <div className="relative aspect-video">
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            className="object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={goPrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={goNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
        <div className="p-4 text-center text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Example 2: Command Palette Modal

```typescript
// Command palette (cmd+k) modal
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-xl">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 py-3 px-2 outline-none bg-transparent"
            autoFocus
          />
          <kbd className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Command list */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 🔗 Related Skills

- `form-grab` - Form patterns for modal forms
- `nav-grab` - Navigation patterns for mega menus
- `sidebar-grab` - Sheet/drawer patterns
- `react-grab` - Base React component patterns

## 📖 Further Reading

- [Radix Dialog Documentation](https://www.radix-ui.com/docs/primitives/components/dialog)
- [WAI-ARIA Dialog Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- [A11y Dialog Library](https://a11y-dialog.netlify.app/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*

# Forms & Validation Expert

> **ID:** `react-hook-form-zod`
> **Tier:** 3
> **Token Cost:** 5000
> **MCP Connections:** context7

## What This Skill Does

- Build complex forms with react-hook-form
- Zod schema validation with TypeScript inference
- Multi-step wizard forms
- Dynamic form fields with useFieldArray
- File upload handling
- Form state management and persistence
- Server-side validation with Server Actions

## When to Use

This skill is automatically loaded when:

- **Keywords:** form, validation, zod, react-hook-form, input, submit, field, useForm
- **File Types:** .tsx, .ts
- **Directories:** components/forms/, features/*/forms/

---

## Core Capabilities

### 1. React Hook Form Fundamentals

**Installation & Setup:**
```bash
pnpm add react-hook-form zod @hookform/resolvers
```

**Basic Form with Zod:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema - single source of truth
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Infer TypeScript type from schema
type FormData = z.infer<typeof formSchema>;

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Validate on change
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await submitToServer(data);
      reset(); // Clear form on success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password && <span role="alert">{errors.password.message}</span>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <span role="alert">{errors.confirmPassword.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

**Best Practices:**
- Always use `zodResolver` for type-safe validation
- Use `mode: 'onChange'` for real-time validation UX
- Use `mode: 'onBlur'` for large forms to reduce re-renders
- Extract schemas to separate files for reusability
- Use `noValidate` on form to prevent browser validation

**Gotchas:**
- Don't spread `register()` before other props - it will override them
- `watch()` causes re-renders - use `useWatch` for isolated watching
- Default values must match schema types exactly

---

### 2. Advanced Zod Schemas

**Complex Validation Patterns:**
```typescript
import { z } from 'zod';

// Reusable field schemas
const emailSchema = z.string()
  .email('Invalid email')
  .toLowerCase()
  .trim();

const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

const urlSchema = z.string()
  .url('Invalid URL')
  .refine(
    (url) => url.startsWith('https://'),
    'URL must use HTTPS'
  );

// Conditional validation
const paymentSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('credit_card'),
    cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
    expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Use MM/YY format'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  }),
  z.object({
    method: z.literal('bank_transfer'),
    iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/, 'Invalid IBAN'),
    bic: z.string().optional(),
  }),
  z.object({
    method: z.literal('crypto'),
    walletAddress: z.string().min(26).max(62),
    network: z.enum(['ethereum', 'solana', 'bitcoin']),
  }),
]);

// Date validation
const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// Array validation
const tagsSchema = z.array(z.string().min(1).max(20))
  .min(1, 'At least one tag required')
  .max(5, 'Maximum 5 tags allowed');

// Optional with transform
const optionalNumberSchema = z.string()
  .optional()
  .transform((val) => val ? parseInt(val, 10) : undefined)
  .pipe(z.number().positive().optional());

// Async validation (use sparingly)
const usernameSchema = z.string()
  .min(3)
  .max(20)
  .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores')
  .refine(
    async (username) => {
      const exists = await checkUsernameExists(username);
      return !exists;
    },
    'Username already taken'
  );
```

**Preprocessing and Transforms:**
```typescript
const formSchema = z.object({
  // Preprocess: runs BEFORE validation
  age: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(18).max(120).optional()
  ),

  // Transform: runs AFTER validation
  email: z.string()
    .email()
    .transform((email) => email.toLowerCase().trim()),

  // Coerce: automatic type conversion
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  enabled: z.coerce.boolean(),
});
```

**Best Practices:**
- Use `z.discriminatedUnion` for conditional forms (better performance than z.union)
- Use `z.coerce` for form inputs that are always strings
- Use `.refine()` for custom validation, `.transform()` for data manipulation
- Create reusable schema factories for common patterns

---

### 3. Multi-Step Wizard Forms

**Complete Multi-Step Implementation:**
```typescript
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback } from 'react';

// Step schemas - each step has its own validation
const step1Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email(),
});

const step2Schema = z.object({
  company: z.string().min(1, 'Required'),
  role: z.enum(['developer', 'designer', 'manager', 'other']),
  teamSize: z.coerce.number().min(1).max(1000),
});

const step3Schema = z.object({
  plan: z.enum(['starter', 'pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
});

// Combined schema for final submission
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormData = z.infer<typeof fullSchema>;

// Step schemas array for validation
const stepSchemas = [step1Schema, step2Schema, step3Schema] as const;

// Step components
function Step1() {
  const { register, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <h2>Personal Information</h2>
      <Input
        label="First Name"
        {...register('firstName')}
        error={errors.firstName?.message}
      />
      <Input
        label="Last Name"
        {...register('lastName')}
        error={errors.lastName?.message}
      />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
    </div>
  );
}

function Step2() {
  const { register, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <h2>Company Details</h2>
      <Input
        label="Company"
        {...register('company')}
        error={errors.company?.message}
      />
      <Select
        label="Role"
        {...register('role')}
        options={[
          { value: 'developer', label: 'Developer' },
          { value: 'designer', label: 'Designer' },
          { value: 'manager', label: 'Manager' },
          { value: 'other', label: 'Other' },
        ]}
        error={errors.role?.message}
      />
      <Input
        label="Team Size"
        type="number"
        {...register('teamSize')}
        error={errors.teamSize?.message}
      />
    </div>
  );
}

function Step3() {
  const { register, formState: { errors }, watch } = useFormContext<FormData>();
  const plan = watch('plan');

  return (
    <div className="space-y-4">
      <h2>Choose Your Plan</h2>
      <RadioGroup
        label="Plan"
        {...register('plan')}
        options={[
          { value: 'starter', label: 'Starter - $9/mo' },
          { value: 'pro', label: 'Pro - $29/mo' },
          { value: 'enterprise', label: 'Enterprise - Contact us' },
        ]}
        error={errors.plan?.message}
      />
      <RadioGroup
        label="Billing Cycle"
        {...register('billingCycle')}
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly (2 months free)' },
        ]}
        error={errors.billingCycle?.message}
      />
      <Checkbox
        label="I accept the terms and conditions"
        {...register('termsAccepted')}
        error={errors.termsAccepted?.message}
      />
    </div>
  );
}

// Main wizard component
export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [Step1, Step2, Step3];
  const CurrentStepComponent = steps[currentStep];

  const methods = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      role: undefined,
      teamSize: undefined,
      plan: undefined,
      billingCycle: 'monthly',
      termsAccepted: false,
    },
  });

  const { trigger, handleSubmit, formState: { isSubmitting } } = methods;

  // Validate current step before proceeding
  const validateCurrentStep = useCallback(async () => {
    const stepSchema = stepSchemas[currentStep];
    const fields = Object.keys(stepSchema.shape) as (keyof FormData)[];
    return trigger(fields);
  }, [currentStep, trigger]);

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await submitOnboarding(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Current step */}
        <CurrentStepComponent />

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 disabled:opacity-50"
          >
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Complete'}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
```

**Form State Persistence:**
```typescript
import { useEffect } from 'react';

function useFormPersistence<T extends Record<string, any>>(
  methods: UseFormReturn<T>,
  storageKey: string
) {
  const { watch, reset } = methods;

  // Save to localStorage on change
  useEffect(() => {
    const subscription = watch((data) => {
      localStorage.setItem(storageKey, JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch, storageKey]);

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch {
        // Invalid data, ignore
      }
    }
  }, [reset, storageKey]);

  // Clear storage
  const clearPersistence = () => {
    localStorage.removeItem(storageKey);
  };

  return { clearPersistence };
}
```

---

### 4. Dynamic Form Fields with useFieldArray

**Dynamic List Management:**
```typescript
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'member', 'viewer']),
});

const formSchema = z.object({
  teamName: z.string().min(1, 'Team name required'),
  members: z.array(teamMemberSchema)
    .min(1, 'At least one member required')
    .max(10, 'Maximum 10 members'),
});

type FormData = z.infer<typeof formSchema>;

export function TeamForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: '',
      members: [{ name: '', email: '', role: 'member' }],
    },
  });

  const { fields, append, remove, move, swap } = useFieldArray({
    control,
    name: 'members',
  });

  // Watch total members for validation feedback
  const members = useWatch({ control, name: 'members' });
  const canAddMore = members.length < 10;
  const canRemove = members.length > 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Team Name"
        {...register('teamName')}
        error={errors.teamName?.message}
      />

      <div className="space-y-4 mt-4">
        <h3>Team Members ({fields.length}/10)</h3>

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start p-4 border rounded">
            {/* Drag handle for reordering */}
            <button
              type="button"
              className="cursor-grab"
              onDragStart={() => {/* Implement drag */}}
            >
              ⋮⋮
            </button>

            <div className="flex-1 grid grid-cols-3 gap-4">
              <Input
                label="Name"
                {...register(`members.${index}.name`)}
                error={errors.members?.[index]?.name?.message}
              />
              <Input
                label="Email"
                type="email"
                {...register(`members.${index}.email`)}
                error={errors.members?.[index]?.email?.message}
              />
              <Select
                label="Role"
                {...register(`members.${index}.role`)}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'member', label: 'Member' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
                error={errors.members?.[index]?.role?.message}
              />
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              disabled={!canRemove}
              className="text-red-500 disabled:opacity-50"
              aria-label={`Remove member ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Array-level errors */}
        {errors.members?.root && (
          <p className="text-red-500">{errors.members.root.message}</p>
        )}
        {errors.members?.message && (
          <p className="text-red-500">{errors.members.message}</p>
        )}

        <button
          type="button"
          onClick={() => append({ name: '', email: '', role: 'member' })}
          disabled={!canAddMore}
          className="w-full p-2 border-2 border-dashed disabled:opacity-50"
        >
          + Add Member
        </button>
      </div>

      <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2">
        Create Team
      </button>
    </form>
  );
}
```

**Nested Dynamic Fields:**
```typescript
const orderSchema = z.object({
  customer: z.string().min(1),
  items: z.array(z.object({
    product: z.string().min(1),
    quantity: z.coerce.number().min(1),
    addons: z.array(z.object({
      name: z.string().min(1),
      price: z.coerce.number().min(0),
    })).optional(),
  })).min(1),
});

function OrderItemAddons({ nestIndex }: { nestIndex: number }) {
  const { control, register } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `items.${nestIndex}.addons`,
  });

  return (
    <div className="ml-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <input {...register(`items.${nestIndex}.addons.${index}.name`)} />
          <input {...register(`items.${nestIndex}.addons.${index}.price`)} />
          <button type="button" onClick={() => remove(index)}>✕</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', price: 0 })}>
        + Add Addon
      </button>
    </div>
  );
}
```

---

### 5. File Upload Handling

**File Upload with Validation:**
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useState } from 'react';

// File validation schema
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .png, and .webp formats are supported'
  );

const formSchema = z.object({
  name: z.string().min(1),
  avatar: fileSchema.optional(),
  documents: z.array(fileSchema).max(5, 'Maximum 5 files'),
});

type FormData = z.infer<typeof formSchema>;

export function FileUploadForm() {
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      documents: [],
    },
  });

  // Handle file selection with preview
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'avatar' | 'documents') => {
      const files = e.target.files;
      if (!files) return;

      if (fieldName === 'avatar') {
        const file = files[0];
        setValue('avatar', file, { shouldValidate: true });

        // Create preview
        const reader = new FileReader();
        reader.onload = () => setPreviews([reader.result as string]);
        reader.readAsDataURL(file);
      } else {
        const fileArray = Array.from(files);
        setValue('documents', fileArray, { shouldValidate: true });

        // Create previews
        const newPreviews: string[] = [];
        fileArray.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === fileArray.length) {
              setPreviews(newPreviews);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    },
    [setValue]
  );

  const onSubmit = async (data: FormData) => {
    // Create FormData for upload
    const formData = new FormData();
    formData.append('name', data.name);

    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    data.documents.forEach((file, index) => {
      formData.append(`document_${index}`, file);
    });

    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Name"
        {...register('name')}
        error={errors.name?.message}
      />

      {/* Single file upload */}
      <div>
        <label>Avatar</label>
        <input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={(e) => handleFileChange(e, 'avatar')}
        />
        {errors.avatar && <p className="text-red-500">{errors.avatar.message}</p>}
        {previews[0] && (
          <img src={previews[0]} alt="Preview" className="w-20 h-20 object-cover" />
        )}
      </div>

      {/* Multiple file upload */}
      <div>
        <label>Documents (max 5)</label>
        <input
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={(e) => handleFileChange(e, 'documents')}
        />
        {errors.documents && (
          <p className="text-red-500">
            {errors.documents.message || errors.documents.root?.message}
          </p>
        )}
      </div>

      <button type="submit">Upload</button>
    </form>
  );
}
```

**Drag & Drop Upload:**
```typescript
import { useDropzone } from 'react-dropzone';

function DropzoneField({ name, control, maxFiles = 5 }: Props) {
  const { field } = useController({ name, control });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      field.onChange([...field.value, ...acceptedFiles].slice(0, maxFiles));
    },
    [field, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
      `}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop files here...</p>
      ) : (
        <p>Drag & drop files, or click to select</p>
      )}

      {/* File previews */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {field.value.map((file: File, index: number) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-16 h-16 object-cover rounded"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newFiles = [...field.value];
                newFiles.splice(index, 1);
                field.onChange(newFiles);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 6. Server-Side Validation with Server Actions

**Next.js Server Actions Integration:**
```typescript
// app/actions/create-user.ts
'use server';

import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

export type CreateUserState = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
    username?: string[];
    password?: string[];
  };
};

export async function createUser(
  prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  // Parse form data
  const rawData = {
    email: formData.get('email'),
    username: formData.get('username'),
    password: formData.get('password'),
  };

  // Validate
  const result = createUserSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Server-side validation (check database)
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { email: result.data.email },
        { username: result.data.username },
      ],
    },
  });

  if (existingUser) {
    return {
      success: false,
      errors: {
        email: existingUser.email === result.data.email
          ? ['Email already registered']
          : undefined,
        username: existingUser.username === result.data.username
          ? ['Username already taken']
          : undefined,
      },
    };
  }

  // Create user
  await db.user.create({ data: result.data });

  return { success: true, message: 'User created!' };
}
```

**Client Form with Server Action:**
```typescript
// app/components/create-user-form.tsx
'use client';

import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser, type CreateUserState } from '@/app/actions/create-user';
import { useEffect } from 'react';

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function CreateUserForm() {
  const [state, formAction] = useFormState<CreateUserState, FormData>(
    createUser,
    { success: false }
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Sync server errors to react-hook-form
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (messages?.[0]) {
          setError(field as keyof FormData, { message: messages[0] });
        }
      });
    }
  }, [state.errors, setError]);

  return (
    <form action={formAction}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Create User</button>

      {state.success && <p className="text-green-500">{state.message}</p>}
    </form>
  );
}
```

---

### 7. Reusable Form Components

**Type-Safe Form Components Library:**
```typescript
// components/form/index.tsx
import { forwardRef, type InputHTMLAttributes } from 'react';
import {
  useFormContext,
  Controller,
  type FieldPath,
  type FieldValues
} from 'react-hook-form';

// Base Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, className, ...props }, ref) => (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
);

// Connected Form Input (auto-connects to form context)
interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  type?: string;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  type = 'text'
}: FormInputProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <Input
      label={label}
      type={type}
      error={error}
      {...register(name)}
    />
  );
}

// Select
interface SelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
}: SelectProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...register(name)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Checkbox
interface FormCheckboxProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
}: FormCheckboxProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={name}
        className="w-4 h-4"
        {...register(name)}
      />
      <label htmlFor={name} className="text-sm">
        {label}
      </label>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

// Controlled components (for complex inputs)
interface FormDatePickerProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  label,
}: FormDatePickerProps<T>) {
  const { control, formState: { errors } } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-1">
          <label className="block text-sm font-medium">{label}</label>
          <DatePicker
            selected={field.value}
            onChange={field.onChange}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    />
  );
}
```

---

## Real-World Examples

### Example 1: Complete Checkout Form
```typescript
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const checkoutSchema = z.object({
  // Contact
  email: z.string().email(),
  phone: z.string().optional(),

  // Shipping
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(5),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().min(2),
  }),

  // Billing
  sameAsShipping: z.boolean(),
  billing: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),

  // Payment
  payment: z.discriminatedUnion('method', [
    z.object({
      method: z.literal('card'),
      cardNumber: z.string().regex(/^\d{16}$/),
      expiry: z.string().regex(/^\d{2}\/\d{2}$/),
      cvv: z.string().regex(/^\d{3,4}$/),
      cardName: z.string().min(1),
    }),
    z.object({
      method: z.literal('paypal'),
      paypalEmail: z.string().email(),
    }),
  ]),
}).superRefine((data, ctx) => {
  if (!data.sameAsShipping && !data.billing?.address) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Billing address required',
      path: ['billing', 'address'],
    });
  }
});

export function CheckoutForm({ onComplete }: { onComplete: (data: any) => void }) {
  const methods = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      sameAsShipping: true,
      payment: { method: 'card' },
    },
  });

  const { watch, handleSubmit } = methods;
  const sameAsShipping = watch('sameAsShipping');
  const paymentMethod = watch('payment.method');

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onComplete)} className="space-y-8">
        {/* Contact Section */}
        <section>
          <h2>Contact Information</h2>
          <FormInput name="email" label="Email" type="email" />
          <FormInput name="phone" label="Phone (optional)" type="tel" />
        </section>

        {/* Shipping Section */}
        <section>
          <h2>Shipping Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormInput name="shipping.firstName" label="First Name" />
            <FormInput name="shipping.lastName" label="Last Name" />
          </div>
          <FormInput name="shipping.address" label="Address" />
          <div className="grid grid-cols-3 gap-4">
            <FormInput name="shipping.city" label="City" />
            <FormInput name="shipping.state" label="State" />
            <FormInput name="shipping.zipCode" label="ZIP Code" />
          </div>
        </section>

        {/* Billing Section */}
        <section>
          <FormCheckbox name="sameAsShipping" label="Billing same as shipping" />
          {!sameAsShipping && (
            <div className="mt-4">
              {/* Billing address fields */}
            </div>
          )}
        </section>

        {/* Payment Section */}
        <section>
          <h2>Payment Method</h2>
          <FormSelect
            name="payment.method"
            label="Payment Method"
            options={[
              { value: 'card', label: 'Credit Card' },
              { value: 'paypal', label: 'PayPal' },
            ]}
          />

          {paymentMethod === 'card' && (
            <div className="mt-4 space-y-4">
              <FormInput name="payment.cardNumber" label="Card Number" />
              <div className="grid grid-cols-2 gap-4">
                <FormInput name="payment.expiry" label="Expiry (MM/YY)" />
                <FormInput name="payment.cvv" label="CVV" type="password" />
              </div>
              <FormInput name="payment.cardName" label="Name on Card" />
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <FormInput name="payment.paypalEmail" label="PayPal Email" />
          )}
        </section>

        <button type="submit" className="w-full bg-blue-500 text-white py-3">
          Complete Order
        </button>
      </form>
    </FormProvider>
  );
}
```

### Example 2: Settings Form with Sections
```typescript
const settingsSchema = z.object({
  profile: z.object({
    displayName: z.string().min(2).max(50),
    bio: z.string().max(500).optional(),
    website: z.string().url().optional().or(z.literal('')),
    avatar: z.instanceof(File).optional(),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    frequency: z.enum(['instant', 'daily', 'weekly']),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']),
    showEmail: z.boolean(),
    showActivity: z.boolean(),
  }),
  danger: z.object({
    deleteConfirmation: z.string().optional(),
  }),
});

export function SettingsForm({ defaultValues, onSave }) {
  const methods = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const { handleSubmit, watch, formState: { isDirty, dirtyFields } } = methods;

  // Only submit changed sections
  const onSubmit = async (data) => {
    const changedData = {};
    Object.keys(dirtyFields).forEach((key) => {
      changedData[key] = data[key];
    });
    await onSave(changedData);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Profile Section */}
        <SettingsSection title="Profile">
          <FormInput name="profile.displayName" label="Display Name" />
          <FormTextarea name="profile.bio" label="Bio" />
          <FormInput name="profile.website" label="Website" />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <FormCheckbox name="notifications.email" label="Email notifications" />
          <FormCheckbox name="notifications.push" label="Push notifications" />
          <FormCheckbox name="notifications.sms" label="SMS notifications" />
          <FormSelect
            name="notifications.frequency"
            label="Notification frequency"
            options={[
              { value: 'instant', label: 'Instant' },
              { value: 'daily', label: 'Daily digest' },
              { value: 'weekly', label: 'Weekly digest' },
            ]}
          />
        </SettingsSection>

        {/* Save button - only enabled when form is dirty */}
        <button
          type="submit"
          disabled={!isDirty}
          className="bg-blue-500 disabled:opacity-50"
        >
          Save Changes
        </button>
      </form>
    </FormProvider>
  );
}
```

---

## Related Skills

- `tanstack-query-expert` - For form submission with mutations
- `clerk-auth-expert` - For authenticated form submissions
- `uploadthing-expert` - For advanced file uploads
- `trpc-fullstack` - For type-safe form submissions

## Further Reading

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- [Server Actions with Forms](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*

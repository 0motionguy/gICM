---
name: framer-motion-animations
description: "Content"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Framer Motion Animations

**Skill ID:** `framer-motion-animations`
**Domain:** Frontend / Animations
**Complexity:** Intermediate
**Prerequisites:** React, CSS animations basics

## Quick Reference

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Basic animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Exit animation
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Modal
    </motion.div>
  )}
</AnimatePresence>

// Hover & Tap
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>

// Gesture animations
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  whileDrag={{ scale: 1.1 }}
>
  Drag me
</motion.div>

// Variants
const variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
}

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

## Core Concepts

### 1. Motion Components

Replace any HTML/SVG element with `motion.*`:

```tsx
<motion.div />
<motion.button />
<motion.span />
<motion.svg />
<motion.path />
```

### 2. Animation Props

**Three main props:**
- `initial` - Starting state
- `animate` - Target state
- `transition` - How to animate

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
/>
```

### 3. Variants

Named animation states for cleaner code and orchestration:

```tsx
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

<motion.div variants={variants} initial="hidden" animate="visible" />
```

### 4. AnimatePresence

Animates components when they're removed from React tree:

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div exit={{ opacity: 0 }}>
      Will animate out
    </motion.div>
  )}
</AnimatePresence>
```

### 5. Gestures

Built-in gesture recognition:
- `whileHover` - Mouse hover
- `whileTap` - Click/touch
- `whileFocus` - Keyboard focus
- `whileDrag` - Dragging
- `whileInView` - Element in viewport

## Common Patterns

### Pattern 1: Fade In on Mount

```tsx
// Simple fade in
export function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  )
}

// Fade in from bottom
export function FadeInUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  )
}

// Fade in with scale
export function FadeInScale({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Usage
<FadeIn delay={0.1}>
  <h1>Welcome</h1>
</FadeIn>

<FadeInUp delay={0.2}>
  <p>This is a description</p>
</FadeInUp>
```

### Pattern 2: Stagger Children

```tsx
// Container and item variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function StaggerList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.text}
        </motion.li>
      ))}
    </motion.ul>
  )
}

// Grid stagger
export function StaggerGrid({ items }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <motion.div
      className="grid grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className="bg-white p-6 rounded-lg"
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### Pattern 3: Page Transitions

```tsx
// app/template.tsx (Next.js)
'use client'

import { motion } from 'framer-motion'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
}

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Or custom PageTransition component
export function PageTransition({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={usePathname()}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### Pattern 4: Modal Animations

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
}

export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Slide-in modal from bottom (mobile style)
export function BottomSheet({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 bg-white rounded-t-xl z-50 p-6"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

## Advanced Techniques

### 1. Scroll-Triggered Animations

```tsx
import { motion, useScroll, useTransform } from 'framer-motion'

// Parallax effect
export function ParallaxSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])

  return (
    <div className="relative h-screen overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero.jpg)' }}
      />
      <div className="relative z-10">
        <h1>Parallax Content</h1>
      </div>
    </div>
  )
}

// Scroll progress bar
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

// Fade in when in view
export function FadeInView({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// Count-up animation
export function CountUp({ value }: { value: number }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const count = useTransform(scrollYProgress, [0, 1], [0, value])
  const rounded = useTransform(count, Math.round)

  return (
    <motion.span ref={ref}>
      {rounded}
    </motion.span>
  )
}
```

### 2. Drag & Drop

```tsx
import { motion, Reorder } from 'framer-motion'

// Simple drag
export function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="w-32 h-32 bg-blue-500 rounded-lg cursor-grab"
    />
  )
}

// Drag to dismiss (Tinder-style)
export function SwipeCard({ onSwipe, children }) {
  const [exitX, setExitX] = useState(0)

  function handleDragEnd(event, info) {
    const threshold = 100

    if (Math.abs(info.offset.x) > threshold) {
      setExitX(info.offset.x > 0 ? 1000 : -1000)
      onSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute w-80 h-96 bg-white rounded-xl shadow-xl"
    >
      {children}
    </motion.div>
  )
}

// Reorderable list
export function ReorderableList({ items, setItems }) {
  return (
    <Reorder.Group values={items} onReorder={setItems}>
      {items.map((item) => (
        <Reorder.Item key={item.id} value={item}>
          <div className="p-4 bg-white border rounded-lg mb-2 cursor-grab">
            {item.text}
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

### 3. Layout Animations

```tsx
// Automatic layout animation
export function ExpandableCard() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-white p-6 rounded-lg cursor-pointer"
    >
      <motion.h2 layout="position">Title</motion.h2>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p>Expanded content here...</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// Shared layout animation
import { LayoutGroup } from 'framer-motion'

export function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <LayoutGroup>
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-4 py-2"
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-500 rounded-lg -z-10"
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              />
            )}
          </button>
        ))}
      </div>
    </LayoutGroup>
  )
}
```

### 4. SVG Animations

```tsx
import { motion } from 'framer-motion'

// Drawing animation
export function DrawSVG() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <motion.path
        d="M 10 80 Q 95 10 180 80"
        stroke="#3b82f6"
        strokeWidth="4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
  )
}

// Animated icon
export function CheckIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      {/* Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        stroke="#10b981"
        strokeWidth="4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Checkmark */}
      <motion.path
        d="M 18 32 L 28 42 L 46 22"
        stroke="#10b981"
        strokeWidth="4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </svg>
  )
}

// Morphing shapes
export function MorphingShape() {
  const [isCircle, setIsCircle] = useState(true)

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <motion.path
        d={isCircle
          ? "M 100 20 A 80 80 0 1 1 100 180 A 80 80 0 1 1 100 20"
          : "M 20 20 L 180 20 L 180 180 L 20 180 Z"
        }
        fill="#3b82f6"
        onClick={() => setIsCircle(!isCircle)}
        transition={{ duration: 0.5 }}
      />
    </svg>
  )
}
```

## Production Examples

### Example 1: Notification System

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type Notification = {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

const notificationVariants = {
  initial: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <>
      {children}

      {/* Notification container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              variants={notificationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-sm',
                'bg-white dark:bg-gray-800 border',
                {
                  'border-green-200': notification.type === 'success',
                  'border-red-200': notification.type === 'error',
                  'border-blue-200': notification.type === 'info',
                }
              )}
            >
              {/* Icon */}
              {notification.type === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              {notification.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              {notification.type === 'info' && (
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              )}

              {/* Message */}
              <p className="flex-1 text-sm text-gray-900 dark:text-white">
                {notification.message}
              </p>

              {/* Close button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
```

### Example 2: Image Gallery with Lightbox

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const images = [
  { id: 1, src: '/img1.jpg', title: 'Image 1' },
  { id: 2, src: '/img2.jpg', title: 'Image 2' },
  // ...
]

export function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <>
      {/* Grid */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {images.map((image) => (
          <motion.div
            key={image.id}
            layoutId={`image-${image.id}`}
            onClick={() => setSelectedImage(image)}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer aspect-square rounded-lg overflow-hidden"
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/90 z-50"
            />

            {/* Image */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <motion.div
                layoutId={`image-${selectedImage.id}`}
                className="max-w-4xl w-full"
              >
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-auto rounded-lg"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-white text-center"
                >
                  <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
```

### Example 3: Multi-Step Form

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const steps = [
  { id: 1, title: 'Account' },
  { id: 2, title: 'Profile' },
  { id: 3, title: 'Complete' },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
}

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentStep(currentStep + newDirection)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                'text-sm font-medium',
                currentStep >= step.id
                  ? 'text-blue-600'
                  : 'text-gray-400'
              )}
            >
              {step.title}
            </div>
          ))}
        </div>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <div className="bg-white rounded-lg border p-6">
              {currentStep === 1 && <StepOne />}
              {currentStep === 2 && <StepTwo />}
              {currentStep === 3 && <StepThree />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => paginate(-1)}
          disabled={currentStep === 1}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Back
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={() => paginate(1)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Next
          </button>
        ) : (
          <button className="px-4 py-2 rounded-lg bg-green-600 text-white">
            Submit
          </button>
        )}
      </div>
    </div>
  )
}
```

## Best Practices

### 1. Performance

```tsx
// ✅ Use layout prop for layout animations
<motion.div layout>

// ✅ Use transform properties (x, y, scale, rotate) - GPU accelerated
<motion.div animate={{ x: 100, scale: 1.2 }} />

// ❌ Avoid animating width, height, top, left - causes reflow
<motion.div animate={{ width: 200, top: 100 }} />

// ✅ Use willChange for complex animations
<motion.div style={{ willChange: 'transform' }} />
```

### 2. Accessibility

```tsx
// Respect user's motion preferences
import { useReducedMotion } from 'framer-motion'

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    />
  )
}
```

### 3. Reusable Transitions

```tsx
// Define common transitions
export const transitions = {
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  smooth: { duration: 0.3, ease: 'easeInOut' },
  fast: { duration: 0.15, ease: 'easeOut' },
}

// Use throughout app
<motion.div
  animate={{ scale: 1.1 }}
  transition={transitions.spring}
/>
```

### 4. Exit Animations

```tsx
// Always wrap with AnimatePresence for exit animations
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div exit={{ opacity: 0 }}>
      Content
    </motion.div>
  )}
</AnimatePresence>

// mode="wait" - waits for exit before showing new component
// mode="popLayout" - exiting component removed from layout flow
```

## Common Pitfalls

### 1. Forgetting AnimatePresence

**❌ Don't:**
```tsx
{isVisible && (
  <motion.div exit={{ opacity: 0 }}>
    {/* Exit animation won't work */}
  </motion.div>
)}
```

**✅ Do:**
```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div exit={{ opacity: 0 }}>
      {/* Exit animation works */}
    </motion.div>
  )}
</AnimatePresence>
```

### 2. Animating Non-Transform Properties

**❌ Don't:**
```tsx
// Causes layout reflow
<motion.div animate={{ width: 200, height: 300 }} />
```

**✅ Do:**
```tsx
// Use scale instead
<motion.div animate={{ scaleX: 2, scaleY: 1.5 }} />
```

### 3. Missing Keys in Lists

**❌ Don't:**
```tsx
<AnimatePresence>
  {items.map((item, index) => (
    <motion.div key={index}>  {/* Index as key */}
      {item}
    </motion.div>
  ))}
</AnimatePresence>
```

**✅ Do:**
```tsx
<AnimatePresence>
  {items.map((item) => (
    <motion.div key={item.id}>  {/* Stable ID */}
      {item}
    </motion.div>
  ))}
</AnimatePresence>
```

### 4. Over-Animating

**❌ Don't:**
```tsx
// Too many simultaneous animations
<motion.div
  animate={{
    x: 100,
    y: 100,
    scale: 1.5,
    rotate: 360,
    opacity: 0.5,
    skewX: 45,
  }}
/>
```

**✅ Do:**
```tsx
// Simple, focused animations
<motion.div
  animate={{ x: 100, opacity: 1 }}
/>
```

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Framer Motion Examples](https://www.framer.com/motion/examples/)
- [Motion One](https://motion.dev) - Lightweight alternative
- [Animation Principles](https://www.youtube.com/watch?v=lJm6Y6pntP4)
- [useHooks - useAnimation](https://usehooks.com/useanimation/)

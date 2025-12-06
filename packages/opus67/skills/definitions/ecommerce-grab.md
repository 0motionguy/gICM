# E-commerce Grab

> **ID:** `ecommerce-grab`
> **Tier:** 2
> **Token Cost:** 7000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts e-commerce UI patterns from screenshots/designs and converts them to production-ready React components with Stripe integration, cart state management, and optimized product displays.

- Product card extraction with variants, pricing, and imagery
- Cart components with quantity management and totals
- Product gallery with zoom, thumbnails, and responsive layouts
- Checkout forms with validation and payment integration

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** ecommerce, product, shop, grab product, cart, checkout, store
- **File Types:** N/A
- **Directories:** components/shop, components/ecommerce, app/shop

## 🚀 Core Capabilities

### 1. Product Card Extraction

Transform product card designs into responsive, interactive components with proper image handling, pricing display, and variant selection.

**Best Practices:**
- Use `next/image` with proper aspect ratios for product images
- Implement skeleton loading states for images
- Support multiple image formats with fallbacks
- Handle price formatting with proper locale support
- Include accessibility labels for screen readers
- Use CSS Grid for consistent card layouts

**Common Patterns:**

```typescript
// Product card with variants and quick add
import Image from 'next/image';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    variants: { id: string; name: string; available: boolean }[];
    badge?: string;
    rating?: number;
    reviewCount?: number;
  };
  onAddToCart: (productId: string, variantId: string) => void;
  onWishlist?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart, onWishlist }: ProductCardProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <article
      className="group relative flex flex-col bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={product.images[isHovered ? 1 : selectedImage] || product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        {product.badge && (
          <Badge className="absolute top-2 left-2">{product.badge}</Badge>
        )}
        {discount && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            -{discount}%
          </Badge>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onWishlist?.(product.id)}
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <span className="text-yellow-500">★</span>
            <span>{product.rating}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold text-lg">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                disabled={!variant.available}
                className={`px-2 py-1 text-xs border rounded ${
                  selectedVariant === variant.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary'
                } ${!variant.available && 'opacity-50 cursor-not-allowed'}`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        )}

        {/* Add to Cart */}
        <Button
          className="mt-auto w-full"
          onClick={() => onAddToCart(product.id, selectedVariant)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
```

**Product Grid Layout:**

```typescript
// Responsive product grid with filtering
interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
}

export function ProductGrid({ products, columns = 4, loading }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-muted rounded-t-lg" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-9 bg-muted rounded mt-4" />
      </div>
    </div>
  );
}
```

**Gotchas:**
- Always provide `sizes` prop on `next/image` to avoid layout shift
- Use `loading="lazy"` for below-the-fold products
- Handle out-of-stock variants gracefully with visual indicators
- Preload hero product images with `priority` prop
- Format prices consistently with Intl.NumberFormat

### 2. Cart Components

Full-featured shopping cart with quantity controls, item removal, and real-time totals.

**Best Practices:**
- Use optimistic updates for quantity changes
- Debounce quantity input for API efficiency
- Show loading states during cart operations
- Persist cart in localStorage for guests
- Sync with server-side cart for logged-in users
- Calculate totals client-side for responsiveness

**Common Patterns:**

```typescript
// Cart context with persistence
import { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE'; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (item) => item.variantId === action.payload.variantId
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.variantId === action.payload.variantId
              ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, item.maxQuantity) }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'HYDRATE':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  subtotal: number;
  itemCount: number;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    isLoading: false,
  });

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) });
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
```

**Cart Drawer Component:**

```typescript
// Slide-out cart drawer
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/cart';

export function CartDrawer() {
  const { state, dispatch, subtotal, itemCount } = useCart();

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  return (
    <Sheet open={state.isOpen} onOpenChange={() => dispatch({ type: 'TOGGLE_CART' })}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-muted-foreground">Add items to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <ul className="space-y-4">
                {state.items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t pt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
                <Button className="w-full" size="lg" asChild>
                  <a href="/checkout">Checkout</a>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

**Gotchas:**
- Debounce quantity updates to avoid API spam
- Handle race conditions when rapidly clicking +/-
- Show clear feedback for out-of-stock items
- Consider cart expiration for session carts
- Validate stock availability before checkout

### 3. Product Gallery

Multi-image product gallery with zoom, thumbnails, and touch gestures.

**Best Practices:**
- Preload the first image for fast initial paint
- Lazy-load subsequent gallery images
- Use `srcset` for responsive image delivery
- Implement pinch-to-zoom on mobile
- Support keyboard navigation between images
- Include image alt text for SEO

**Common Patterns:**

```typescript
// Product gallery with zoom and thumbnails
import { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imageRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <div
          ref={imageRef}
          className={cn(
            'relative w-full h-full transition-transform duration-200',
            isZoomed && 'scale-150 cursor-zoom-out'
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <Image
            src={images[selectedIndex].src}
            alt={images[selectedIndex].alt || `${productName} - Image ${selectedIndex + 1}`}
            fill
            className="object-contain"
            priority={selectedIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Zoom Indicator */}
        <div className="absolute bottom-2 right-2 bg-background/80 rounded-md px-2 py-1 text-xs flex items-center gap-1">
          <ZoomIn className="h-3 w-3" />
          Click to zoom
        </div>

        {/* Lightbox */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <div className="relative aspect-square">
              <Image
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors',
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground'
              )}
            >
              <Image
                src={image.src}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Gotchas:**
- Handle touch gestures for mobile zoom/swipe
- Preload adjacent images for smooth transitions
- Use appropriate image compression (WebP/AVIF)
- Consider CDN image optimization (Cloudinary, Imgix)
- Test gallery on slow connections

### 4. Checkout Forms

Multi-step checkout with address validation, payment integration, and order review.

**Best Practices:**
- Split checkout into logical steps (shipping, payment, review)
- Validate each step before proceeding
- Use address autocomplete for faster entry
- Integrate Stripe Elements for PCI compliance
- Save shipping addresses for returning customers
- Show clear progress indicators

**Common Patterns:**

```typescript
// Multi-step checkout form
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const shippingSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(5),
  apartment: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(5),
  phone: z.string().min(10),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

type CheckoutStep = 'information' | 'shipping' | 'payment';

export function CheckoutForm() {
  const [step, setStep] = useState<CheckoutStep>('information');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep('shipping');
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        'client_secret_from_server',
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: `${shippingData?.firstName} ${shippingData?.lastName}`,
              email: shippingData?.email,
            },
          },
        }
      );

      if (error) {
        console.error(error);
      } else if (paymentIntent?.status === 'succeeded') {
        // Redirect to success page
        window.location.href = '/checkout/success';
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {(['information', 'shipping', 'payment'] as const).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            <span className="ml-2 text-sm capitalize hidden sm:inline">{s}</span>
            {i < 2 && <div className="w-12 h-px bg-border mx-4" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'information' && (
        <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP</Label>
              <Input id="zipCode" {...register('zipCode')} />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Continue to Shipping
          </Button>
        </form>
      )}

      {step === 'payment' && (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <Label>Card Details</Label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                },
              }}
              className="mt-2 p-3 border rounded"
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('shipping')}>
              Back
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !stripe}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Gotchas:**
- Never send raw card data to your server (use Stripe Elements)
- Validate addresses server-side for shipping quotes
- Handle payment failures gracefully with retry options
- Implement idempotency keys to prevent duplicate charges
- Test 3D Secure flows for European customers

## 💡 Real-World Examples

### Example 1: Complete Product Page

```typescript
// Full product page with gallery, variants, and add-to-cart
export default function ProductPage({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${product.id}-${selectedVariant.id}`,
        productId: product.id,
        variantId: selectedVariant.id,
        name: `${product.name} - ${selectedVariant.name}`,
        price: selectedVariant.price,
        quantity,
        image: product.images[0],
        maxQuantity: selectedVariant.inventory,
      },
    });
    dispatch({ type: 'TOGGLE_CART' });
  };

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold mt-2">
              {formatPrice(selectedVariant.price)}
            </p>
          </div>

          <div className="prose prose-sm">
            <p>{product.description}</p>
          </div>

          {/* Variant Selection */}
          <div className="space-y-2">
            <Label>Size</Label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariant.id === variant.id ? 'default' : 'outline'}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.inventory === 0}
                >
                  {variant.name}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleAddToCart} size="lg" className="w-full">
            Add to Cart - {formatPrice(selectedVariant.price * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Cart Page with Promo Codes

```typescript
// Full cart page with promo code support
export function CartPage() {
  const { state, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const applyPromo = async () => {
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discount);
        setPromoError('');
      } else {
        setPromoError(data.message);
      }
    } catch {
      setPromoError('Failed to validate code');
    }
  };

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Cart items */}
        </div>

        <div className="bg-muted/50 p-6 rounded-lg h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Promo Code */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="promo">Promo Code</Label>
            <div className="flex gap-2">
              <Input
                id="promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
              />
              <Button variant="outline" onClick={applyPromo}>
                Apply
              </Button>
            </div>
            {promoError && (
              <p className="text-sm text-destructive">{promoError}</p>
            )}
          </div>

          <Button className="w-full mt-6" size="lg" asChild>
            <a href="/checkout">Proceed to Checkout</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## 🔗 Related Skills

- `react-grab` - Base React component extraction patterns
- `form-grab` - Form component patterns for checkout
- `theme-grab` - Styling extraction for brand consistency
- `stripe-integration` - Payment processing patterns

## 📖 Further Reading

- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)
- [Next.js E-commerce Starter](https://nextjs.org/commerce)
- [Shopify Hydrogen](https://hydrogen.shopify.dev/)
- [Commerce.js Docs](https://commercejs.com/docs/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*

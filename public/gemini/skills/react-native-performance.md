# React Native Performance

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


High-performance mobile app optimization techniques for 60 FPS experiences.

## Core Optimization Patterns

### 1. FlashList over FlatList
```typescript
import { FlashList } from "@shopify/flash-list";

// ❌ Slow - FlatList
<FlatList
  data={tokens}
  renderItem={({ item }) => <TokenCard token={item} />}
/>

// ✅ Fast - FlashList (10x faster)
<FlashList
  data={tokens}
  renderItem={({ item }) => <TokenCard token={item} />}
  estimatedItemSize={100}  // Critical for performance
/>
```

### 2. Memoization with React.memo
```typescript
import React, { memo } from 'react';

// Expensive component
const TokenCard = memo(({ token }: { token: Token }) => {
  return (
    <View style={styles.card}>
      <Text>{token.name}</Text>
      <Text>{token.price}</Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.token.id === nextProps.token.id &&
         prevProps.token.price === nextProps.token.price;
});
```

### 3. useCallback & useMemo
```typescript
import { useCallback, useMemo } from 'react';

function WalletScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // ✅ Memoize expensive calculations
  const totalValue = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.value, 0);
  }, [transactions]);

  // ✅ Memoize callback to prevent re-renders
  const handleRefresh = useCallback(async () => {
    const newTxs = await fetchTransactions();
    setTransactions(newTxs);
  }, []);

  return (
    <FlashList
      data={transactions}
      onRefresh={handleRefresh}  // Won't cause re-renders
    />
  );
}
```

### 4. Reanimated for Smooth Animations
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

function SwipeableCard() {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    };
  });

  const handleSwipe = () => {
    translateX.value = withSpring(200);
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Text>Swipe me!</Text>
    </Animated.View>
  );
}
```

### 5. Image Optimization
```typescript
import FastImage from 'react-native-fast-image';

// ❌ Slow - Image
<Image source={{ uri: nft.image }} />

// ✅ Fast - FastImage with caching
<FastImage
  source={{
    uri: nft.image,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable
  }}
  resizeMode="cover"
/>

// ✅ Even better - with blurhash placeholder
import { Blurhash } from 'react-native-blurhash';

<Blurhash
  blurhash={nft.blurhash}
  style={styles.image}
/>
```

### 6. MMKV for Fast Storage
```typescript
import { MMKV } from 'react-native-mmkv';

// ✅ 30x faster than AsyncStorage
const storage = new MMKV();

// Store wallet data
storage.set('wallet.address', walletAddress);
storage.set('wallet.balance', balance);

// Retrieve
const address = storage.getString('wallet.address');

// Delete
storage.delete('wallet.temp_data');

// Clear all
storage.clearAll();
```

### 7. Code Splitting with React.lazy
```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy screens
const NFTGalleryScreen = lazy(() => import('./screens/NFTGallery'));
const SwapScreen = lazy(() => import('./screens/Swap'));

function AppNavigator() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Stack.Navigator>
        <Stack.Screen name="NFTs" component={NFTGalleryScreen} />
        <Stack.Screen name="Swap" component={SwapScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}
```

### 8. Virtualization for Large Lists
```typescript
import { FlashList } from "@shopify/flash-list";

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <FlashList
      data={transactions}
      renderItem={({ item }) => <TransactionRow tx={item} />}
      estimatedItemSize={80}
      // Only render visible items + buffer
      drawDistance={500}
      // Recycle views
      recyclerClassName="transaction-list"
    />
  );
}
```

## Advanced Patterns

### 9. Hermes Engine Optimization
```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Enable Hermes bytecode compilation
    '@babel/plugin-transform-typescript',
    // Inline constants for better dead code elimination
    ['transform-inline-environment-variables'],
  ],
};
```

### 10. Bundle Size Reduction
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
      },
      compress: {
        drop_console: true, // Remove console.log in production
        reduce_funcs: true,
      },
    },
  },
};
```

### 11. RAM Bundle for Faster Startup
```json
// package.json
{
  "scripts": {
    "bundle-ios": "react-native bundle --dev false --entry-file index.js --bundle-output ios/main.jsbundle --platform ios --indexed-ram-bundle",
    "bundle-android": "react-native bundle --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --platform android --indexed-ram-bundle"
  }
}
```

### 12. Web3 Performance
```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

// ✅ Cache blockchain queries
function useTokenBalance(mint: string) {
  return useQuery({
    queryKey: ['tokenBalance', mint],
    queryFn: async () => {
      const connection = new Connection(RPC_URL);
      const balance = await connection.getTokenAccountBalance(
        new PublicKey(mint)
      );
      return balance.value.uiAmount;
    },
    staleTime: 30000, // Cache for 30s
    refetchOnMount: false
  });
}
```

## Performance Monitoring

### 13. Flipper Integration
```typescript
// Debug performance with Flipper
import { PerformanceMonitor } from 'react-native-performance';

PerformanceMonitor.mark('screenRender_start');
// ... render logic
PerformanceMonitor.mark('screenRender_end');
PerformanceMonitor.measure(
  'screenRender',
  'screenRender_start',
  'screenRender_end'
);
```

### 14. Frame Rate Monitoring
```typescript
import { useFrameCallback } from 'react-native-reanimated';

function useFrameRate() {
  const frameRate = useSharedValue(60);

  useFrameCallback(() => {
    // Monitor frame drops
    if (frameRate.value < 55) {
      console.warn('Frame drop detected:', frameRate.value);
    }
  });

  return frameRate;
}
```

## Best Practices

- ✅ Use **FlashList** for all lists
- ✅ Implement **React.memo** for expensive components
- ✅ Use **Reanimated** for all animations
- ✅ Enable **Hermes** engine
- ✅ Cache with **React Query** or SWR
- ✅ Use **MMKV** instead of AsyncStorage
- ✅ Optimize images with **FastImage**
- ❌ Avoid inline function definitions in render
- ❌ Don't use ScrollView for long lists
- ❌ Never run heavy computation on UI thread

## Performance Checklist

- [ ] FlashList for all long lists
- [ ] Hermes engine enabled
- [ ] RAM bundles configured
- [ ] Images optimized and cached
- [ ] Animations use Reanimated
- [ ] Expensive components memoized
- [ ] Network requests cached
- [ ] Bundle size < 5MB
- [ ] App startup < 3s
- [ ] 60 FPS maintained

---

**Category:** React Native Optimization
**Difficulty:** Advanced
**Prerequisites:** React Native basics, performance fundamentals

# Web3 Wallet Integration

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Progressive disclosure skill: Quick reference in 38 tokens, expands to 4800 tokens

## Quick Reference (Load: 38 tokens)

Web3 wallet integration connects users to blockchain through browser extensions and mobile wallets.

**Supported wallets:**
- **Solana:** Phantom, Solflare, Backpack, Glow
- **EVM:** MetaMask, Coinbase Wallet, WalletConnect, Rainbow

**Quick setup (React + Solana):**
```tsx
import { WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [new PhantomWalletAdapter()];

<WalletProvider wallets={wallets} autoConnect>
  <App />
</WalletProvider>
```

## Core Concepts (Expand: +500 tokens)

### Wallet Adapter Pattern

Wallet adapters provide unified interface across different wallet implementations:

1. **Connection** - Establish communication with wallet
2. **Account Access** - Request user's public keys
3. **Transaction Signing** - Sign transactions without exposing private keys
4. **Message Signing** - Prove ownership for authentication

### Connection States

Wallets have distinct lifecycle states:
- `disconnected` - No wallet connected
- `connecting` - User approving connection
- `connected` - Active wallet session
- `disconnecting` - Closing connection

### Transaction Flow

Standard transaction workflow:
1. Construct transaction
2. Request wallet signature
3. Submit to blockchain
4. Confirm transaction

### Auto-Connect

Persist wallet connection across sessions:
- Store connection preference in localStorage
- Auto-reconnect on page load
- Handle disconnection gracefully

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Solana Wallet Provider Setup

Complete Solana wallet integration with Next.js:

```tsx
'use client';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

export function WalletContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl('mainnet-beta'),
    []
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

**Key features:**
- Multiple wallet support
- Auto-connect enabled
- Modal UI for wallet selection
- Custom RPC endpoint

### Pattern 2: Wallet Connect Button

Reusable wallet connection component:

```tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Button onClick={handleClick} variant={connected ? 'outline' : 'default'}>
      {connected && publicKey
        ? formatAddress(publicKey.toBase58())
        : 'Connect Wallet'}
    </Button>
  );
}
```

**Features:**
- Show address when connected
- Disconnect on click
- Address formatting
- Conditional styling

### Pattern 3: Transaction Signing with Error Handling

Robust transaction signing with retry logic:

```tsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { toast } from 'sonner';

export function useTransaction() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const sendTransaction = async (transaction: Transaction) => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('finalized');

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction
      const signed = await signTransaction(transaction);

      // Send with confirmation
      const signature = await connection.sendRawTransaction(
        signed.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      toast.success('Transaction confirmed!', {
        description: `View on Solscan`,
        action: {
          label: 'View',
          onClick: () => window.open(
            `https://solscan.io/tx/${signature}`,
            '_blank'
          ),
        },
      });

      return signature;
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  return { sendTransaction };
}
```

**Error handling:**
- Wallet connection check
- Blockhash expiration handling
- Transaction confirmation
- User-friendly notifications

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Multi-Chain Support

Support both Solana and EVM chains:

```tsx
'use client';

import { createContext, useContext, useState } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useAccount, useDisconnect } from 'wagmi';

type Chain = 'solana' | 'ethereum';

interface MultiChainContextType {
  activeChain: Chain;
  setActiveChain: (chain: Chain) => void;
  address: string | null;
  isConnected: boolean;
  disconnect: () => void;
}

const MultiChainContext = createContext<MultiChainContextType | null>(null);

export function MultiChainProvider({ children }: { children: React.ReactNode }) {
  const [activeChain, setActiveChain] = useState<Chain>('solana');

  // Solana wallet
  const solana = useSolanaWallet();

  // Ethereum wallet
  const ethereum = useAccount();
  const { disconnect: disconnectEth } = useDisconnect();

  const address = activeChain === 'solana'
    ? solana.publicKey?.toBase58() || null
    : ethereum.address || null;

  const isConnected = activeChain === 'solana'
    ? solana.connected
    : ethereum.isConnected;

  const disconnect = () => {
    if (activeChain === 'solana') {
      solana.disconnect();
    } else {
      disconnectEth();
    }
  };

  return (
    <MultiChainContext.Provider
      value={{
        activeChain,
        setActiveChain,
        address,
        isConnected,
        disconnect,
      }}
    >
      {children}
    </MultiChainContext.Provider>
  );
}

export function useMultiChain() {
  const context = useContext(MultiChainContext);
  if (!context) {
    throw new Error('useMultiChain must be used within MultiChainProvider');
  }
  return context;
}
```

### Technique 2: Sign-In With Solana (SIWS)

Authenticate users using wallet signatures:

```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { SigninMessage } from '@/lib/signin-message';
import bs58 from 'bs58';

export function useAuth() {
  const { publicKey, signMessage } = useWallet();

  const signIn = async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create sign-in message
      const message = new SigninMessage({
        domain: window.location.host,
        address: publicKey.toBase58(),
        statement: 'Sign in to ICM Motion',
        nonce: await fetchNonce(),
        issuedAt: new Date().toISOString(),
      });

      // Sign message
      const messageBytes = new TextEncoder().encode(message.prepare());
      const signature = await signMessage(messageBytes);

      // Verify on backend
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.prepare(),
          signature: bs58.encode(signature),
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { token } = await response.json();
      localStorage.setItem('auth_token', token);

      return token;
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  return { signIn };
}

async function fetchNonce(): Promise<string> {
  const response = await fetch('/api/auth/nonce');
  const { nonce } = await response.json();
  return nonce;
}
```

**SIWS message format:**
```
example.com wants you to sign in with your Solana account:
7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi

Sign in to ICM Motion

URI: https://example.com
Version: 1
Chain ID: mainnet
Nonce: 32CharacterRandomString
Issued At: 2024-01-15T10:30:00.000Z
```

### Technique 3: Transaction Batching

Batch multiple instructions into single transaction:

```tsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction } from '@solana/web3.js';

export function useBatchTransaction() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const sendBatch = async (instructions: TransactionInstruction[]) => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    // Check if instructions fit in one transaction
    const maxInstructions = 20; // Conservative limit

    if (instructions.length <= maxInstructions) {
      // Single transaction
      const transaction = new Transaction().add(...instructions);
      return await sendSingle(transaction);
    } else {
      // Split into multiple transactions
      const signatures: string[] = [];

      for (let i = 0; i < instructions.length; i += maxInstructions) {
        const batch = instructions.slice(i, i + maxInstructions);
        const transaction = new Transaction().add(...batch);
        const signature = await sendSingle(transaction);
        signatures.push(signature);
      }

      return signatures;
    }
  };

  const sendSingle = async (transaction: Transaction) => {
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey!;

    const signed = await signTransaction!(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature);
    return signature;
  };

  return { sendBatch };
}
```

### Technique 4: Wallet Detection

Detect installed wallets and provide fallbacks:

```tsx
'use client';

import { useEffect, useState } from 'react';

interface WalletInfo {
  name: string;
  icon: string;
  installed: boolean;
  downloadUrl: string;
}

export function useWalletDetection() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    const detectWallets = () => {
      const detected: WalletInfo[] = [
        {
          name: 'Phantom',
          icon: '/wallets/phantom.svg',
          installed: 'solana' in window && window.solana?.isPhantom,
          downloadUrl: 'https://phantom.app',
        },
        {
          name: 'Solflare',
          icon: '/wallets/solflare.svg',
          installed: 'solflare' in window,
          downloadUrl: 'https://solflare.com',
        },
        {
          name: 'Backpack',
          icon: '/wallets/backpack.svg',
          installed: 'backpack' in window,
          downloadUrl: 'https://backpack.app',
        },
        {
          name: 'MetaMask',
          icon: '/wallets/metamask.svg',
          installed: 'ethereum' in window && window.ethereum?.isMetaMask,
          downloadUrl: 'https://metamask.io',
        },
      ];

      setWallets(detected);
    };

    // Delay to ensure wallet extensions are loaded
    setTimeout(detectWallets, 100);
  }, []);

  return { wallets };
}

// Wallet selection component
export function WalletSelector() {
  const { wallets } = useWalletDetection();

  return (
    <div className="grid gap-3">
      {wallets.map((wallet) => (
        <button
          key={wallet.name}
          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted"
          onClick={() => {
            if (wallet.installed) {
              // Connect logic
            } else {
              window.open(wallet.downloadUrl, '_blank');
            }
          }}
        >
          <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
          <div className="flex-1 text-left">
            <div className="font-medium">{wallet.name}</div>
            {!wallet.installed && (
              <div className="text-sm text-muted-foreground">Not installed</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete Wallet Integration Hook

Production-ready wallet hook with all features:

```tsx
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseWalletIntegrationReturn {
  address: string | null;
  shortAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: number | null;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  signMessage: (message: string) => Promise<Uint8Array>;
  refreshBalance: () => Promise<void>;
}

export function useWalletIntegration(): UseWalletIntegrationReturn {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Format address
  const address = wallet.publicKey?.toBase58() || null;
  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : null;

  // Fetch balance
  const refreshBalance = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const lamports = await connection.getBalance(wallet.publicKey);
      setBalance(lamports / 1e9); // Convert to SOL
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [wallet.publicKey, connection]);

  // Send transaction with retry logic
  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          // Get fresh blockhash
          const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash('finalized');

          transaction.recentBlockhash = blockhash;
          transaction.feePayer = wallet.publicKey;

          // Sign
          const signed = await wallet.signTransaction(transaction);

          // Send
          const signature = await connection.sendRawTransaction(
            signed.serialize(),
            {
              skipPreflight: false,
              maxRetries: 3,
            }
          );

          // Confirm with timeout
          const confirmation = await Promise.race([
            connection.confirmTransaction({
              signature,
              blockhash,
              lastValidBlockHeight,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Confirmation timeout')), 60000)
            ),
          ]);

          if (confirmation.value.err) {
            throw new Error('Transaction failed: ' + confirmation.value.err);
          }

          toast.success('Transaction confirmed!', {
            description: `${shortAddress} - View on explorer`,
          });

          await refreshBalance();
          return signature;
        } catch (error) {
          attempt++;
          console.error(`Transaction attempt ${attempt} failed:`, error);

          if (attempt >= maxRetries) {
            toast.error('Transaction failed', {
              description: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
          }

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }

      throw new Error('Transaction failed after retries');
    },
    [wallet, connection, refreshBalance, shortAddress]
  );

  // Sign message
  const signMessage = useCallback(
    async (message: string): Promise<Uint8Array> => {
      if (!wallet.signMessage) {
        throw new Error('Wallet does not support message signing');
      }

      const encodedMessage = new TextEncoder().encode(message);
      const signature = await wallet.signMessage(encodedMessage);

      return signature;
    },
    [wallet]
  );

  // Auto-fetch balance on connect
  useEffect(() => {
    if (wallet.connected) {
      refreshBalance();
    } else {
      setBalance(null);
    }
  }, [wallet.connected, refreshBalance]);

  return {
    address,
    shortAddress,
    isConnected: wallet.connected,
    isConnecting,
    balance,
    sendTransaction,
    signMessage,
    refreshBalance,
  };
}
```

### Example 2: Wagmi Configuration for EVM Chains

Complete EVM wallet setup with Wagmi:

```tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, polygon, arbitrum],
    transports: {
      [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC),
      [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC),
      [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
    appName: 'ICM Motion',
    appDescription: 'Token launch platform',
    appUrl: 'https://icm.motion',
    appIcon: 'https://icm.motion/icon.png',
  })
);

const queryClient = new QueryClient();

export function EVMWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Usage in components
import { useAccount, useConnect, useDisconnect, useSendTransaction } from 'wagmi';

export function EVMWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button onClick={() => disconnect()}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
```

## Best Practices

**Connection Management**
- Enable auto-connect for better UX
- Store connection preference in localStorage
- Handle disconnection gracefully
- Provide clear connection status

**Error Handling**
- Catch wallet rejection errors
- Handle network switching
- Provide user-friendly error messages
- Log errors for debugging

**Security**
- Never store private keys
- Validate all signed data
- Use recent blockhashes
- Verify transaction contents before signing

**User Experience**
- Show wallet balance
- Display transaction status
- Provide explorer links
- Support multiple wallets

**Performance**
- Cache wallet adapter instances
- Batch RPC calls
- Use optimistic updates
- Implement loading states

## Common Pitfalls

**Issue 1: Window is Undefined (Next.js)**
```tsx
// ❌ Wrong - crashes on SSR
const isPhantom = window.solana?.isPhantom;

// ✅ Correct - check window exists
const isPhantom = typeof window !== 'undefined'
  && window.solana?.isPhantom;
```

**Issue 2: Wallet Not Ready**
```tsx
// ❌ Wrong - wallet might not be ready
useEffect(() => {
  if (wallet.connected) {
    sendTransaction();
  }
}, [wallet.connected]);

// ✅ Correct - check signTransaction exists
useEffect(() => {
  if (wallet.connected && wallet.signTransaction) {
    sendTransaction();
  }
}, [wallet.connected, wallet.signTransaction]);
```

**Issue 3: Stale Blockhash**
```tsx
// ❌ Wrong - blockhash might expire
const { blockhash } = await connection.getLatestBlockhash();
// ... time passes ...
transaction.recentBlockhash = blockhash; // Might be expired

// ✅ Correct - get fresh blockhash before signing
const { blockhash } = await connection.getLatestBlockhash();
transaction.recentBlockhash = blockhash;
const signed = await signTransaction(transaction); // Sign immediately
```

**Issue 4: Missing User Rejection Handling**
```tsx
// ❌ Wrong - unhandled rejection
await wallet.signTransaction(tx);

// ✅ Correct - handle user rejection
try {
  await wallet.signTransaction(tx);
} catch (error) {
  if (error.message.includes('User rejected')) {
    toast.info('Transaction cancelled');
  } else {
    toast.error('Transaction failed');
  }
}
```

## Resources

**Official Documentation**
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) - Official React library
- [Wagmi](https://wagmi.sh/) - EVM wallet hooks
- [ConnectKit](https://docs.family.co/connectkit) - Beautiful wallet UI
- [WalletConnect](https://walletconnect.com/) - Multi-wallet protocol

**Related Skills**
- `solana-anchor-mastery` - Smart contract interaction
- `transaction-retry-logic` - Reliable transaction submission
- `nextjs-app-router-patterns` - Next.js integration

**External Resources**
- [Sign-In With Ethereum](https://login.xyz/) - Authentication standard
- [Phantom Docs](https://docs.phantom.app/) - Solana wallet API
- [MetaMask Docs](https://docs.metamask.io/) - EVM wallet API

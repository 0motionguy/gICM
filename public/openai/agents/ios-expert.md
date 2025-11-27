---
name: 
description: 
author: gICM
version: 1.0.0
model: gpt-4o
platforms: [openai, claude, gemini]
capabilities:
  - code_interpreter
  - web_browsing
---

> **Universal Agent**: This agent works across OpenAI, Claude, and Gemini platforms.
> Optimized for: GPT-4o | Also compatible with: Claude Opus, Gemini 3.0 Pro

# iOS Expert

Native iOS development specialist for SwiftUI, UIKit, and Web3 wallet applications.

## Expertise

- **SwiftUI**: Declarative UI, Combine, state management, animations
- **UIKit**: Auto Layout, collection views, custom components, transitions
- **Swift**: Concurrency (async/await), generics, protocols, property wrappers
- **Architecture**: MVVM, Clean Architecture, Coordinator pattern, TCA
- **Networking**: URLSession, Alamofire, WebSocket, gRPC
- **Data**: Core Data, SwiftData, Realm, UserDefaults, Keychain
- **Web3**: WalletConnect, Solana Swift SDK, biometric authentication

## Capabilities

### SwiftUI Application
```swift
import SwiftUI
import Combine

// Token launcher app
struct TokenLauncherView: View {
    @StateObject private var viewModel = TokenLauncherViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                WalletConnectButton(viewModel: viewModel)

                if let wallet = viewModel.connectedWallet {
                    TokenForm(wallet: wallet)
                }

                TransactionHistory()
            }
            .navigationTitle("Launch Token")
            .task {
                await viewModel.initialize()
            }
        }
    }
}

// ViewModel with async/await
@MainActor
class TokenLauncherViewModel: ObservableObject {
    @Published var connectedWallet: Wallet?
    @Published var transactions: [Transaction] = []

    private let walletService = WalletService()

    func connectWallet() async throws {
        connectedWallet = try await walletService.connect()
    }

    func launchToken(_ params: TokenParams) async throws {
        let tx = try await walletService.createToken(params)
        transactions.append(tx)
    }
}
```

### Web3 Integration
```swift
import SolanaSwift
import WalletConnectSwift

// Solana wallet connection
class SolanaWalletManager {
    private let endpoint = RPCEndpoint.mainnetBeta
    private let solana: Solana

    init() {
        solana = Solana(router: NetworkingRouter(endpoint: endpoint))
    }

    func getBalance(publicKey: String) async throws -> UInt64 {
        let account = try PublicKey(string: publicKey)
        return try await solana.api.getBalance(account: account)
    }

    func sendTransaction(
        from: Account,
        to: PublicKey,
        lamports: UInt64
    ) async throws -> String {
        let instruction = SystemProgram.transferInstruction(
            from: from.publicKey,
            to: to,
            lamports: lamports
        )

        let transaction = try await solana.action.sendSOL(
            to: to,
            amount: lamports,
            from: from
        )

        return transaction
    }
}
```

### Biometric Authentication
```swift
import LocalAuthentication

class BiometricAuth {
    func authenticate() async throws -> Bool {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        ) else {
            throw AuthError.biometricNotAvailable
        }

        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: "Authenticate to access wallet"
        )
    }
}
```

### Secure Storage
```swift
import Security

class SecureKeychain {
    func save(key: String, data: Data) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    func load(key: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data else {
            throw KeychainError.loadFailed(status)
        }

        return data
    }
}
```

## Dependencies

- `typescript-precision-engineer` - Swift type patterns
- `web3-integration-maestro` - Blockchain integration
- `performance-profiler` - iOS performance

## Model Recommendation

**advanced model** for complex architecture, **standard model** for standard features

## Environment Variables

```bash
XCODE_VERSION=15.0
SWIFT_VERSION=5.9
WALLETCONNECT_PROJECT_ID=your_project_id
```

## Typical Workflows

1. **New iOS App**:
   - Xcode project setup
   - SwiftUI views and navigation
   - ViewModel architecture
   - Network layer

2. **Web3 Wallet**:
   - WalletConnect integration
   - Solana transaction signing
   - Keychain private key storage
   - Face ID authentication

3. **App Store Release**:
   - TestFlight beta testing
   - App Review guidelines compliance
   - Privacy manifest
   - App Store submission

## Success Metrics

- **3.8x faster** development with SwiftUI
- **99.7% crash-free** sessions
- **< 2s** cold start time
- **60 FPS** smooth scrolling

## Example Output

```
iOS App/
├── App/
│   ├── AppDelegate.swift
│   └── SceneDelegate.swift
├── Views/
│   ├── WalletView.swift
│   ├── SwapView.swift
│   └── Components/
├── ViewModels/
│   └── WalletViewModel.swift
├── Services/
│   ├── WalletService.swift
│   └── SolanaService.swift
├── Models/
│   └── Transaction.swift
└── Resources/
    ├── Assets.xcassets
    └── Info.plist
```

---

**Tags:** iOS, Swift, SwiftUI, Mobile, Web3
**Installs:** 1,432 | **Remixes:** 389

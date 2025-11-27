# NFT Metadata Standards

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 32 tokens, expands to 3800 tokens

## Quick Reference (Load: 32 tokens)

NFT metadata defines on-chain and off-chain attributes following Metaplex standard on Solana and ERC-721/1155 on Ethereum.

**Metaplex metadata structure:**
```json
{
  "name": "Token Name",
  "symbol": "TKN",
  "description": "Description",
  "image": "https://arweave.net/...",
  "attributes": [
    {"trait_type": "Rarity", "value": "Legendary"}
  ],
  "properties": {
    "files": [{"uri": "...", "type": "image/png"}],
    "category": "image"
  }
}
```

**Quick mint (Metaplex):**
```typescript
import { createNft } from '@metaplex-foundation/mpl-token-metadata';

const nft = await createNft(umi, {
  mint,
  name: 'My NFT',
  uri: 'https://arweave.net/metadata.json',
});
```

## Core Concepts (Expand: +450 tokens)

### On-Chain vs Off-Chain Data

**On-chain (stored in blockchain):**
- Token name, symbol
- Update authority
- Creators array with royalty shares
- Verified creators
- Collection membership

**Off-chain (stored in Arweave/IPFS):**
- Full description
- Image/video files
- Attributes/traits
- Extended properties

### Metaplex Token Metadata Standard

Solana's de facto NFT standard:
- **Master Edition** - Limited supply NFTs
- **Print Editions** - Copies of master
- **Collection** - Grouping mechanism
- **Uses** - Limited use tokens

### Attribute Types

Common trait formats:
- **String** - Text values ("Blue", "Rare")
- **Number** - Numeric traits (85, 1000)
- **Date** - Timestamps
- **Boost Percentage** - +10% attack
- **Boost Number** - +5 strength

### Rarity Calculation

Trait rarity determines value:
```
Rarity Score = Σ(1 / (Trait Count / Total Supply))
```

## Common Patterns (Expand: +750 tokens)

### Pattern 1: Complete Metaplex Metadata JSON

```json
{
  "name": "Degen Ape #1234",
  "symbol": "DAPE",
  "description": "A collection of 10,000 unique degen apes living on Solana",
  "seller_fee_basis_points": 500,
  "image": "https://arweave.net/abc123/1234.png",
  "external_url": "https://degenapes.com/nft/1234",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Purple"
    },
    {
      "trait_type": "Fur",
      "value": "Golden"
    },
    {
      "trait_type": "Eyes",
      "value": "Laser"
    },
    {
      "trait_type": "Rarity Score",
      "value": 342.5,
      "display_type": "number"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "https://arweave.net/abc123/1234.png",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi",
        "share": 100
      }
    ]
  },
  "collection": {
    "name": "Degen Apes",
    "family": "Degen Collection"
  }
}
```

### Pattern 2: Mint NFT with Metadata (Metaplex UMI)

```typescript
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createGenericFile, generateSigner, percentAmount } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

async function mintNFT() {
  const umi = createUmi(RPC_ENDPOINT)
    .use(mplTokenMetadata())
    .use(irysUploader());

  // Upload image
  const imageFile = await fs.readFile('./nft.png');
  const genericFile = createGenericFile(imageFile, 'nft.png', {
    contentType: 'image/png',
  });

  const [imageUri] = await umi.uploader.upload([genericFile]);

  // Upload metadata
  const metadata = {
    name: 'My NFT',
    description: 'An amazing NFT',
    image: imageUri,
    attributes: [
      { trait_type: 'Color', value: 'Blue' },
      { trait_type: 'Rarity', value: 'Legendary' },
    ],
    properties: {
      files: [{ uri: imageUri, type: 'image/png' }],
      category: 'image',
    },
  };

  const metadataUri = await umi.uploader.uploadJson(metadata);

  // Mint NFT
  const mint = generateSigner(umi);

  await createNft(umi, {
    mint,
    name: metadata.name,
    symbol: 'NFT',
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(5), // 5% royalty
    creators: [
      {
        address: umi.identity.publicKey,
        verified: true,
        share: 100,
      },
    ],
  }).sendAndConfirm(umi);

  console.log('NFT minted:', mint.publicKey);
  return mint.publicKey;
}
```

### Pattern 3: Verify Collection Membership

```typescript
import { verifyCollectionV1 } from '@metaplex-foundation/mpl-token-metadata';

async function verifyCollection(nftMint: PublicKey, collectionMint: PublicKey) {
  await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftMint }),
    collectionMint,
    authority: umi.identity, // Collection authority
  }).sendAndConfirm(umi);

  console.log('Collection verified!');
}
```

### Pattern 4: Fetch and Parse Metadata

```typescript
import { fetchMetadata } from '@metaplex-foundation/mpl-token-metadata';

async function getNFTMetadata(mintAddress: string) {
  const mint = publicKey(mintAddress);

  // Fetch on-chain metadata
  const metadata = await fetchMetadata(umi, mint);

  // Fetch off-chain JSON
  const response = await fetch(metadata.uri);
  const json = await response.json();

  return {
    onChain: {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators,
      collection: metadata.collection,
    },
    offChain: json,
  };
}
```

## Advanced Techniques (Expand: +900 tokens)

### Technique 1: Dynamic Metadata Updates

```typescript
import { updateV1 } from '@metaplex-foundation/mpl-token-metadata';

async function updateNFTMetadata(
  mint: PublicKey,
  newUri: string
) {
  await updateV1(umi, {
    mint,
    authority: umi.identity,
    data: {
      name: 'Updated Name',
      symbol: 'UPD',
      uri: newUri,
      sellerFeeBasisPoints: 500,
      creators: null,
      collection: null,
      uses: null,
    },
  }).sendAndConfirm(umi);
}
```

### Technique 2: Programmable NFTs (pNFTs)

```typescript
import {
  createProgrammableNft,
  TokenStandard
} from '@metaplex-foundation/mpl-token-metadata';

async function mintProgrammableNFT() {
  const mint = generateSigner(umi);

  await createProgrammableNft(umi, {
    mint,
    name: 'Programmable NFT',
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(5),
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    ruleSet: ruleSetPublicKey, // Token authorization rules
  }).sendAndConfirm(umi);

  return mint.publicKey;
}
```

### Technique 3: Compressed NFTs (cNFTs)

```typescript
import {
  createTree,
  mintV1 as mintCompressedNFT
} from '@metaplex-foundation/mpl-bubblegum';

async function mintCNFT() {
  // Create Merkle tree
  const merkleTree = generateSigner(umi);

  await createTree(umi, {
    merkleTree,
    maxDepth: 14,
    maxBufferSize: 64,
  }).sendAndConfirm(umi);

  // Mint compressed NFT
  await mintCompressedNFT(umi, {
    leafOwner: owner.publicKey,
    merkleTree: merkleTree.publicKey,
    metadata: {
      name: 'Compressed NFT',
      uri: metadataUri,
      sellerFeeBasisPoints: 500,
      collection: { key: collectionMint, verified: false },
      creators: [
        { address: umi.identity.publicKey, verified: true, share: 100 }
      ],
    },
  }).sendAndConfirm(umi);
}
```

### Technique 4: Rarity Calculation Engine

```typescript
interface Trait {
  trait_type: string;
  value: string;
}

interface NFTWithRarity {
  mint: string;
  attributes: Trait[];
  rarityScore: number;
  rank: number;
}

function calculateCollectionRarity(nfts: NFT[]): NFTWithRarity[] {
  // Count trait occurrences
  const traitCounts = new Map<string, number>();

  for (const nft of nfts) {
    for (const attr of nft.attributes) {
      const key = `${attr.trait_type}:${attr.value}`;
      traitCounts.set(key, (traitCounts.get(key) || 0) + 1);
    }
  }

  // Calculate rarity scores
  const totalSupply = nfts.length;
  const withScores = nfts.map(nft => {
    let rarityScore = 0;

    for (const attr of nft.attributes) {
      const key = `${attr.trait_type}:${attr.value}`;
      const count = traitCounts.get(key) || 0;
      const traitRarity = 1 / (count / totalSupply);
      rarityScore += traitRarity;
    }

    return {
      ...nft,
      rarityScore,
      rank: 0,
    };
  });

  // Assign ranks
  withScores.sort((a, b) => b.rarityScore - a.rarityScore);
  withScores.forEach((nft, index) => {
    nft.rank = index + 1;
  });

  return withScores;
}
```

## Production Examples (Expand: +1000 tokens)

### Example 1: Batch Mint Collection

```typescript
import { createNft } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner } from '@metaplex-foundation/umi';
import Bottleneck from 'bottleneck';

// Rate limiter: 10 requests per second
const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100,
});

async function batchMintCollection(
  count: number,
  collectionMint: PublicKey
) {
  const results = [];

  for (let i = 0; i < count; i++) {
    const task = limiter.schedule(async () => {
      try {
        // Generate metadata
        const metadata = generateMetadata(i);
        const uri = await uploadMetadata(metadata);

        // Mint NFT
        const mint = generateSigner(umi);
        await createNft(umi, {
          mint,
          name: `Collection Item #${i}`,
          uri,
          sellerFeeBasisPoints: percentAmount(5),
          collection: {
            key: collectionMint,
            verified: false,
          },
        }).sendAndConfirm(umi);

        console.log(`Minted ${i + 1}/${count}`);
        return { mint: mint.publicKey, success: true };
      } catch (error) {
        console.error(`Failed to mint ${i}:`, error);
        return { mint: null, success: false, error };
      }
    });

    results.push(task);
  }

  return await Promise.all(results);
}

function generateMetadata(index: number) {
  // Generate traits randomly or deterministically
  const traits = [
    { trait_type: 'Background', value: pickRandom(backgrounds) },
    { trait_type: 'Body', value: pickRandom(bodies) },
    { trait_type: 'Eyes', value: pickRandom(eyes) },
    { trait_type: 'Mouth', value: pickRandom(mouths) },
  ];

  return {
    name: `NFT #${index}`,
    description: 'Generated NFT from collection',
    image: `https://cdn.collection.com/${index}.png`,
    attributes: traits,
  };
}
```

### Example 2: Metadata Migration Tool

```typescript
async function migrateMetadata(
  oldMints: PublicKey[],
  updateFunction: (oldMetadata: any) => any
) {
  for (const mint of oldMints) {
    try {
      // Fetch current metadata
      const current = await getNFTMetadata(mint.toString());

      // Transform metadata
      const updated = updateFunction(current.offChain);

      // Upload new metadata
      const newUri = await umi.uploader.uploadJson(updated);

      // Update on-chain pointer
      await updateV1(umi, {
        mint,
        authority: umi.identity,
        data: {
          ...current.onChain,
          uri: newUri,
        },
      }).sendAndConfirm(umi);

      console.log(`Migrated ${mint.toString()}`);
    } catch (error) {
      console.error(`Failed to migrate ${mint.toString()}:`, error);
    }
  }
}

// Usage
await migrateMetadata(mints, (old) => ({
  ...old,
  attributes: [
    ...old.attributes,
    { trait_type: 'Season', value: 'Winter 2024' },
  ],
}));
```

## Best Practices

**Metadata Design**
- Keep images under 1MB for fast loading
- Use descriptive trait names
- Include rarity indicators
- Add external_url for website link

**Storage**
- Use Arweave for permanent storage
- IPFS for decentralized hosting
- Shadow Drive for Solana-native storage
- Always pin IPFS content

**Royalties**
- Set reasonable royalty % (2-10%)
- Specify all creators with shares
- Verify creator addresses
- Test royalty enforcement

**Collections**
- Create collection NFT first
- Verify all items in collection
- Update collection metadata separately
- Use consistent naming

## Common Pitfalls

**Issue 1: URI Not Permanent**
```json
// ❌ Wrong - centralized storage
"image": "https://myserver.com/nft.png"

// ✅ Correct - permanent storage
"image": "https://arweave.net/abc123"
```

**Issue 2: Missing Required Fields**
```json
// ❌ Wrong - incomplete
{"name": "NFT", "image": "..."}

// ✅ Correct - all required fields
{
  "name": "NFT",
  "symbol": "NFT",
  "description": "...",
  "seller_fee_basis_points": 500,
  "image": "...",
  "attributes": [],
  "properties": {
    "files": [],
    "category": "image",
    "creators": []
  }
}
```

**Issue 3: Unverified Collection**
```typescript
// ❌ Wrong - not verified
await createNft(umi, {
  collection: { key: collectionMint, verified: false }
});

// ✅ Correct - verify after mint
await createNft(...);
await verifyCollectionV1(...);
```

## Resources

**Official Documentation**
- [Metaplex Docs](https://docs.metaplex.com/) - Complete NFT guide
- [Token Metadata Standard](https://docs.metaplex.com/programs/token-metadata/) - Specification
- [OpenSea Metadata](https://docs.opensea.io/docs/metadata-standards) - Compatibility

**Related Skills**
- `solana-anchor-mastery` - Smart contract integration
- `cross-program-invocations` - Metaplex CPI calls

**External Resources**
- [Arweave](https://arweave.org) - Permanent storage
- [NFT Storage](https://nft.storage) - Free IPFS pinning

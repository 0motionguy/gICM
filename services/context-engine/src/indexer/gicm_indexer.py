"""gICM Registry Indexer - indexes 390+ marketplace components."""

from typing import List, Dict, Any
import hashlib
import uuid
import httpx

from ..db.qdrant import QdrantDB
class GICMIndexer:
    """Index gICM marketplace registry into vector store."""

    COLLECTION = "gicm_components"
    BATCH_SIZE = 50

    def __init__(self, db: QdrantDB, embeddings):
        self.db = db
        self.embeddings = embeddings

    def _build_search_text(self, item: Dict[str, Any]) -> str:
        """Build searchable text from registry item."""
        parts = [
            item.get("name", ""),
            item.get("description", ""),
            item.get("longDescription", ""),
            f"Kind: {item.get('kind', '')}",
            f"Category: {item.get('category', '')}",
            f"Tags: {', '.join(item.get('tags', []))}",
        ]

        # Add setup instructions if available
        if setup := item.get("setup"):
            parts.append(f"Setup: {setup}")

        # Add environment keys
        if env_keys := item.get("envKeys"):
            parts.append(f"Environment Variables: {', '.join(env_keys)}")

        return "\n".join(filter(None, parts))

    def _generate_id(self, item: Dict[str, Any]) -> str:
        """Generate stable UUID for an item."""
        # Create UUID from item ID (deterministic via namespace)
        item_id = item.get("id") or item.get("name", "")
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"gicm.{item_id}"))

    async def index_registry(
        self,
        api_url: str = "https://gicm.dev/api/registry",
        force_reindex: bool = False,
    ) -> Dict[str, Any]:
        """Index the entire gICM registry."""
        print(f"Fetching registry from {api_url}...")

        # Fetch registry
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(api_url)
            response.raise_for_status()
            items = response.json()

        print(f"Found {len(items)} items to index")

        # Process in batches
        indexed_count = 0
        for i in range(0, len(items), self.BATCH_SIZE):
            batch = items[i : i + self.BATCH_SIZE]

            # Build search texts
            texts = [self._build_search_text(item) for item in batch]

            # Generate embeddings
            embeddings = await self.embeddings.embed(texts)

            # Prepare points
            points = []
            for item, embedding in zip(batch, embeddings):
                point = {
                    "id": self._generate_id(item),
                    "vector": embedding,
                    "payload": {
                        "id": item.get("id"),
                        "kind": item.get("kind"),
                        "name": item.get("name"),
                        "slug": item.get("slug"),
                        "description": item.get("description"),
                        "category": item.get("category"),
                        "tags": item.get("tags", []),
                        "install": item.get("install"),
                        "envKeys": item.get("envKeys", []),
                        "platforms": item.get("platforms", ["claude", "gemini", "openai"]),
                        "setup": item.get("setup"),
                        "docsUrl": item.get("docsUrl"),
                    },
                }
                points.append(point)

            # Upsert to Qdrant
            await self.db.upsert(self.COLLECTION, points)
            indexed_count += len(batch)
            print(f"Indexed {indexed_count}/{len(items)} items")

        print(f"Indexing complete! {indexed_count} items indexed.")
        return {
            "status": "success",
            "items_indexed": indexed_count,
            "collection": self.COLLECTION,
        }

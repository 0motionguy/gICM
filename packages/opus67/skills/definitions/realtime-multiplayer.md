# Realtime & Multiplayer Expert

> **ID:** `realtime-multiplayer`
> **Tier:** 3
> **Token Cost:** 7000
> **MCP Connections:** supabase, context7

## What This Skill Does

- Supabase Realtime channels and broadcasts
- Liveblocks for collaborative features
- Collaborative text editing (Yjs, Tiptap)
- Presence indicators and avatars
- Conflict resolution strategies
- Optimistic UI updates
- WebSocket connection management

## When to Use

This skill is automatically loaded when:

- **Keywords:** realtime, multiplayer, collaborative, presence, liveblocks, sync, websocket
- **File Types:** .ts, .tsx
- **Directories:** lib/realtime/, features/collaboration/

---

## Core Capabilities

### 1. Supabase Realtime

**Setup & Configuration:**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
```

**Database Changes (Postgres Changes):**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export function useRealtimeMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to changes
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return messages;
}
```

**Broadcast (Custom Events):**
```typescript
import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
}

export function useCursors(roomId: string, currentUser: { id: string; name: string }) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());

  useEffect(() => {
    const channel = supabase.channel(`cursors:${roomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive own broadcasts
      },
    });

    channel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        setCursors((prev) => {
          const next = new Map(prev);
          next.set(payload.userId, payload);
          return next;
        });
      })
      .on('broadcast', { event: 'cursor_leave' }, ({ payload }) => {
        setCursors((prev) => {
          const next = new Map(prev);
          next.delete(payload.userId);
          return next;
        });
      })
      .subscribe();

    return () => {
      // Broadcast leave event
      channel.send({
        type: 'broadcast',
        event: 'cursor_leave',
        payload: { userId: currentUser.id },
      });
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUser.id]);

  const updateCursor = useCallback(
    (x: number, y: number) => {
      supabase.channel(`cursors:${roomId}`).send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          x,
          y,
          userId: currentUser.id,
          userName: currentUser.name,
        },
      });
    },
    [roomId, currentUser]
  );

  return { cursors, updateCursor };
}
```

**Presence (User Status):**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimePresenceState } from '@supabase/supabase-js';

interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: string;
}

export function usePresence(roomId: string, currentUser: UserPresence) {
  const [presenceState, setPresenceState] = useState<UserPresence[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`presence:${roomId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<UserPresence>();
        const users: UserPresence[] = [];

        for (const [, presences] of Object.entries(state)) {
          for (const presence of presences) {
            users.push(presence);
          }
        }

        setPresenceState(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(currentUser);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUser]);

  return presenceState;
}

// Presence avatars component
export function PresenceAvatars({ users }: { users: UserPresence[] }) {
  return (
    <div className="flex -space-x-2">
      {users.slice(0, 5).map((user) => (
        <div key={user.id} className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-full border-2 border-white"
            title={user.name}
          />
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
              user.status === 'online'
                ? 'bg-green-500'
                : user.status === 'away'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
        </div>
      ))}
      {users.length > 5 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium">
          +{users.length - 5}
        </div>
      )}
    </div>
  );
}
```

---

### 2. Liveblocks Integration

**Setup:**
```bash
pnpm add @liveblocks/client @liveblocks/react @liveblocks/node
```

**Liveblocks Configuration:**
```typescript
// liveblocks.config.ts
import { createClient } from '@liveblocks/client';
import { createRoomContext, createLiveblocksContext } from '@liveblocks/react';

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  // Or use authEndpoint for production
  // authEndpoint: '/api/liveblocks-auth',
});

// Define your presence type
type Presence = {
  cursor: { x: number; y: number } | null;
  selectedId: string | null;
  name: string;
  color: string;
};

// Define your storage type
type Storage = {
  canvasObjects: LiveMap<string, CanvasObject>;
  messages: LiveList<Message>;
};

// Define broadcast events
type RoomEvent = {
  type: 'NOTIFICATION';
  message: string;
} | {
  type: 'EMOJI_REACTION';
  emoji: string;
  position: { x: number; y: number };
};

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useOthersMapped,
  useSelf,
  useBroadcastEvent,
  useEventListener,
  useStorage,
  useMutation,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
} = createRoomContext<Presence, Storage, {}, RoomEvent>(client);

export const {
  LiveblocksProvider,
  useInboxNotifications,
  useMarkInboxNotificationAsRead,
} = createLiveblocksContext(client);
```

**Room Provider Setup:**
```tsx
// app/room/[id]/page.tsx
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Canvas } from './Canvas';

export default function RoomPage({ params }: { params: { id: string } }) {
  return (
    <RoomProvider
      id={params.id}
      initialPresence={{
        cursor: null,
        selectedId: null,
        name: 'Anonymous',
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      }}
      initialStorage={{
        canvasObjects: new LiveMap(),
        messages: new LiveList([]),
      }}
    >
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => <Canvas />}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
```

**Multiplayer Cursors:**
```tsx
// components/Cursors.tsx
import { useOthers, useUpdateMyPresence } from '@/liveblocks.config';
import { useEffect } from 'react';

export function Cursors() {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      updateMyPresence({
        cursor: { x: e.clientX, y: e.clientY },
      });
    };

    const handlePointerLeave = () => {
      updateMyPresence({ cursor: null });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [updateMyPresence]);

  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) return null;

        return (
          <div
            key={connectionId}
            className="pointer-events-none absolute"
            style={{
              left: presence.cursor.x,
              top: presence.cursor.y,
              transform: 'translate(-4px, -4px)',
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={presence.color}
            >
              <path d="M5.65,2.29l12,18a1,1,0,0,1-.84,1.54H12.5a1,1,0,0,1-.78-.37l-2.89-3.62L6.71,21.29a1,1,0,0,1-1.42,0l-2-2a1,1,0,0,1,0-1.42l3.75-2.12L3.41,12.86a1,1,0,0,1-.12-1.26l4.5-6a1,1,0,0,1,1.42-.16Z" />
            </svg>

            {/* Name label */}
            <div
              className="absolute left-4 top-4 rounded px-2 py-1 text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: presence.color }}
            >
              {presence.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
```

**Shared Storage:**
```tsx
// components/Canvas.tsx
import { useStorage, useMutation } from '@/liveblocks.config';
import { LiveMap } from '@liveblocks/client';

interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export function Canvas() {
  const objects = useStorage((root) => root.canvasObjects);

  const addObject = useMutation(({ storage }, object: CanvasObject) => {
    storage.get('canvasObjects').set(object.id, object);
  }, []);

  const updateObject = useMutation(
    ({ storage }, id: string, updates: Partial<CanvasObject>) => {
      const objects = storage.get('canvasObjects');
      const object = objects.get(id);
      if (object) {
        objects.set(id, { ...object, ...updates });
      }
    },
    []
  );

  const deleteObject = useMutation(({ storage }, id: string) => {
    storage.get('canvasObjects').delete(id);
  }, []);

  if (!objects) return null;

  return (
    <div className="relative h-screen w-full">
      {Array.from(objects.entries()).map(([id, obj]) => (
        <div
          key={id}
          className="absolute cursor-move"
          style={{
            left: obj.x,
            top: obj.y,
            width: obj.width,
            height: obj.height,
            backgroundColor: obj.fill,
            borderRadius: obj.type === 'circle' ? '50%' : 0,
          }}
          draggable
          onDrag={(e) => {
            updateObject(id, { x: e.clientX, y: e.clientY });
          }}
        />
      ))}

      <button
        onClick={() =>
          addObject({
            id: crypto.randomUUID(),
            type: 'rectangle',
            x: Math.random() * 500,
            y: Math.random() * 500,
            width: 100,
            height: 100,
            fill: '#' + Math.floor(Math.random() * 16777215).toString(16),
          })
        }
        className="fixed bottom-4 right-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Add Rectangle
      </button>
    </div>
  );
}
```

---

### 3. Collaborative Text Editing

**Tiptap + Yjs Setup:**
```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration \
  @tiptap/extension-collaboration-cursor yjs y-webrtc y-indexeddb
```

**Collaborative Editor:**
```tsx
// components/CollaborativeEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useEffect, useMemo } from 'react';

interface Props {
  documentId: string;
  user: { name: string; color: string };
}

export function CollaborativeEditor({ documentId, user }: Props) {
  // Create Yjs document
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Setup WebRTC provider
  const provider = useMemo(
    () =>
      new WebrtcProvider(documentId, ydoc, {
        signaling: ['wss://signaling.yjs.dev'],
      }),
    [documentId, ydoc]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Yjs handles history
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: user.name,
          color: user.color,
        },
      }),
    ],
    content: '',
  });

  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  return (
    <div className="prose max-w-none">
      <EditorContent editor={editor} className="min-h-[300px] p-4 border rounded" />
    </div>
  );
}
```

**With Liveblocks Yjs:**
```tsx
// Using Liveblocks for Yjs sync (production-ready)
import { useRoom } from '@/liveblocks.config';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import * as Y from 'yjs';

export function LiveblocksCollaborativeEditor({ user }: { user: User }) {
  const room = useRoom();
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, ydoc);
    setProvider(yProvider);

    return () => {
      ydoc.destroy();
      yProvider.destroy();
    };
  }, [room]);

  if (!provider) return null;

  return <TiptapEditor provider={provider} user={user} />;
}
```

---

### 4. Presence Indicators

**Typing Indicators:**
```typescript
// hooks/useTypingIndicator.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useTypingIndicator(roomId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const channel = supabase.channel(`typing:${roomId}`);

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setTypingUsers((prev) =>
            prev.includes(payload.userId) ? prev : [...prev, payload.userId]
          );

          // Auto-remove after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((id) => id !== payload.userId)
            );
          }, 3000);
        }
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        setTypingUsers((prev) =>
          prev.filter((id) => id !== payload.userId)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  const sendTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    supabase.channel(`typing:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId },
    });

    timeoutRef.current = setTimeout(() => {
      supabase.channel(`typing:${roomId}`).send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: { userId },
      });
    }, 2000);
  }, [roomId, userId]);

  return { typingUsers, sendTyping };
}

// Component
export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <span className="animate-bounce">●</span>
        <span className="animate-bounce delay-100">●</span>
        <span className="animate-bounce delay-200">●</span>
      </div>
      <span>
        {users.length === 1
          ? `${users[0]} is typing...`
          : `${users.length} people are typing...`}
      </span>
    </div>
  );
}
```

---

### 5. Conflict Resolution

**Last-Write-Wins:**
```typescript
// Simple timestamp-based conflict resolution
interface Document {
  id: string;
  content: string;
  updatedAt: number;
  updatedBy: string;
}

async function updateDocument(
  docId: string,
  content: string,
  userId: string
): Promise<Document> {
  const now = Date.now();

  // Optimistic update
  const { data, error } = await supabase
    .from('documents')
    .update({
      content,
      updated_at: now,
      updated_by: userId,
    })
    .eq('id', docId)
    .gt('updated_at', now) // Only update if our timestamp is newer
    .select()
    .single();

  if (error) {
    // Conflict - fetch latest version
    const { data: latest } = await supabase
      .from('documents')
      .select()
      .eq('id', docId)
      .single();

    return latest!;
  }

  return data;
}
```

**Operational Transform (OT) Pattern:**
```typescript
// Simplified OT for text
type Operation =
  | { type: 'insert'; position: number; text: string }
  | { type: 'delete'; position: number; length: number };

function transformOperation(
  op1: Operation,
  op2: Operation
): Operation {
  // Transform op1 against op2
  if (op1.type === 'insert' && op2.type === 'insert') {
    if (op1.position <= op2.position) {
      return op1;
    }
    return { ...op1, position: op1.position + op2.text.length };
  }

  if (op1.type === 'insert' && op2.type === 'delete') {
    if (op1.position <= op2.position) {
      return op1;
    }
    return {
      ...op1,
      position: Math.max(op1.position - op2.length, op2.position),
    };
  }

  // ... more transformation rules
  return op1;
}
```

**CRDT with Yjs:**
```typescript
// Yjs handles conflicts automatically with CRDTs
import * as Y from 'yjs';

const ydoc = new Y.Doc();
const ymap = ydoc.getMap('shared');

// Set values - conflicts are automatically resolved
ymap.set('counter', 0);

// Observe changes
ymap.observe((event) => {
  event.changes.keys.forEach((change, key) => {
    if (change.action === 'add') {
      console.log(`Added "${key}": ${ymap.get(key)}`);
    } else if (change.action === 'update') {
      console.log(`Updated "${key}": ${change.oldValue} -> ${ymap.get(key)}`);
    }
  });
});
```

---

### 6. Optimistic UI Updates

**Optimistic Update Pattern:**
```typescript
// hooks/useOptimisticMutation.ts
import { useState, useCallback } from 'react';

interface OptimisticOptions<T, R> {
  mutationFn: (data: T) => Promise<R>;
  onMutate?: (data: T) => void;
  onSuccess?: (result: R) => void;
  onError?: (error: Error, data: T) => void;
  onSettled?: () => void;
}

export function useOptimisticMutation<T, R>(options: OptimisticOptions<T, R>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (data: T) => {
      setIsPending(true);
      setError(null);

      // Optimistic update
      options.onMutate?.(data);

      try {
        const result = await options.mutationFn(data);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error, data);
        throw error;
      } finally {
        setIsPending(false);
        options.onSettled?.();
      }
    },
    [options]
  );

  return { mutate, isPending, error };
}

// Usage with messages
function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const { mutate: sendMessage, isPending } = useOptimisticMutation({
    mutationFn: async (content: string) => {
      const { data } = await supabase
        .from('messages')
        .insert({ content, room_id: roomId })
        .select()
        .single();
      return data;
    },
    onMutate: (content) => {
      // Optimistically add message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        pending: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
    },
    onSuccess: (newMessage) => {
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id.startsWith('temp-') ? newMessage : msg
        )
      );
    },
    onError: (error, content) => {
      // Remove failed optimistic message
      setMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith('temp-'))
      );
      toast.error('Failed to send message');
    },
  });

  return (/* ... */);
}
```

---

### 7. WebSocket Connection Management

**Reconnection Logic:**
```typescript
// lib/websocket.ts
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketManagerOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private status: ConnectionStatus = 'disconnected';

  constructor(private options: WebSocketManagerOptions) {
    this.connect();
  }

  private connect() {
    this.setStatus('connecting');

    this.ws = new WebSocket(this.options.url);

    this.ws.onopen = () => {
      this.setStatus('connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = () => {
      this.setStatus('disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.setStatus('error');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.options.onMessage?.(data);
      } catch {
        // Handle non-JSON messages
      }
    };
  }

  private scheduleReconnect() {
    const maxAttempts = this.options.maxReconnectAttempts ?? 10;
    const interval = this.options.reconnectInterval ?? 1000;

    if (this.reconnectAttempts >= maxAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = interval * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
    this.ws = null;
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }
}

// React hook
export function useWebSocket(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const managerRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    managerRef.current = new WebSocketManager({
      url,
      onMessage: setLastMessage,
      onStatusChange: setStatus,
    });

    return () => {
      managerRef.current?.disconnect();
    };
  }, [url]);

  const send = useCallback((data: any) => {
    managerRef.current?.send(data);
  }, []);

  return { status, lastMessage, send };
}
```

---

## Real-World Examples

### Example 1: Collaborative Whiteboard
```tsx
// Complete collaborative whiteboard with Liveblocks
import {
  RoomProvider,
  useMyPresence,
  useOthers,
  useStorage,
  useMutation,
} from '@/liveblocks.config';

function Whiteboard() {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const shapes = useStorage((root) => root.shapes);

  const addShape = useMutation(({ storage }, shape) => {
    storage.get('shapes').push(shape);
  }, []);

  return (
    <div
      className="relative h-screen w-full bg-gray-50"
      onPointerMove={(e) =>
        updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } })
      }
      onPointerLeave={() => updateMyPresence({ cursor: null })}
    >
      {/* Render shapes */}
      {shapes?.map((shape, i) => (
        <Shape key={i} {...shape} />
      ))}

      {/* Render other users' cursors */}
      {others.map(({ connectionId, presence }) =>
        presence.cursor ? (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            color={presence.color}
          />
        ) : null
      )}

      {/* Toolbar */}
      <Toolbar onAddShape={addShape} />
    </div>
  );
}
```

### Example 2: Live Chat Room
```tsx
// Real-time chat with Supabase
function ChatRoom({ roomId, user }) {
  const messages = useRealtimeMessages(roomId);
  const presence = usePresence(roomId, user);
  const { typingUsers, sendTyping } = useTypingIndicator(roomId, user.id);

  return (
    <div className="flex h-screen flex-col">
      {/* Header with presence */}
      <header className="flex items-center justify-between border-b p-4">
        <h1>Chat Room</h1>
        <PresenceAvatars users={presence} />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} isOwn={msg.user_id === user.id} />
        ))}
      </div>

      {/* Typing indicator */}
      <TypingIndicator users={typingUsers} />

      {/* Input */}
      <MessageInput roomId={roomId} onTyping={sendTyping} />
    </div>
  );
}
```

---

## Related Skills

- `supabase-fullstack` - Supabase patterns
- `tanstack-query-expert` - Data synchronization
- `zustand-jotai-state` - Local state management
- `trpc-fullstack` - Type-safe subscriptions

## Further Reading

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Liveblocks Documentation](https://liveblocks.io/docs)
- [Yjs Documentation](https://docs.yjs.dev/)
- [CRDT Primer](https://crdt.tech/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*

---
name: supabase-realtime-subscriptions
description: "console.log('New message:', payload.new)"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Supabase Realtime Subscriptions

Master database subscriptions, presence tracking, and broadcast channels for building real-time collaborative applications.

## Quick Reference

```typescript
// Database Changes Subscription
const subscription = supabase
  .channel('db-changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => console.log('New message:', payload.new)
  )
  .subscribe()

// Presence Tracking
const presenceChannel = supabase.channel('online-users')
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    console.log('Online users:', Object.keys(state))
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({ user_id: userId, online_at: new Date() })
    }
  })

// Broadcast (pub/sub)
const broadcastChannel = supabase.channel('cursor-positions')
  .on('broadcast', { event: 'cursor-move' }, (payload) => {
    console.log('Cursor moved:', payload)
  })
  .subscribe()

// Send broadcast
broadcastChannel.send({
  type: 'broadcast',
  event: 'cursor-move',
  payload: { x: 100, y: 200, user_id: userId }
})

// Cleanup
subscription.unsubscribe()
```

## Core Concepts

### Channel Architecture

Supabase Realtime uses Phoenix Channels under the hood, providing three main features:

1. **Postgres Changes**: Listen to INSERT, UPDATE, DELETE events on tables
2. **Presence**: Track who's online/offline with conflict-free state
3. **Broadcast**: Low-latency pub/sub for ephemeral messages

**Channel Lifecycle:**
```
Create Channel → Subscribe → Active → Unsubscribe → Closed
```

### Authorization Levels

```typescript
// RLS (Row Level Security) applies to postgres_changes
// Users only receive changes to rows they have SELECT permission on

// Presence and Broadcast require channel-level authorization
// Configure in Supabase Dashboard → Database → Realtime

// Example RLS Policy
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);
```

### Connection Management

```typescript
// Automatic reconnection with exponential backoff
const channel = supabase.channel('my-channel', {
  config: {
    broadcast: {
      self: true,           // Receive own broadcasts
      ack: true            // Wait for server acknowledgment
    },
    presence: {
      key: userId          // Unique key for this client
    }
  }
})

// Monitor connection state
channel.subscribe((status, err) => {
  if (status === 'SUBSCRIBED') {
    console.log('Connected to channel')
  }
  if (status === 'CHANNEL_ERROR') {
    console.error('Channel error:', err)
  }
  if (status === 'TIMED_OUT') {
    console.warn('Realtime server timeout')
  }
  if (status === 'CLOSED') {
    console.log('Channel closed')
  }
})
```

## Common Patterns

### Pattern 1: Real-Time Chat

```typescript
// types/chat.ts
import { z } from 'zod'

export const MessageSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  created_at: z.string().datetime(),
})

export type Message = z.infer<typeof MessageSchema>

// hooks/useRealtimeChat.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (data) setMessages(data)
    }

    loadMessages()

    // Subscribe to new messages
    const newChannel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const validated = MessageSchema.safeParse(payload.new)
          if (validated.success) {
            setMessages(prev => [...prev, validated.data])
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      )
      .subscribe()

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
    }
  }, [roomId])

  const sendMessage = async (content: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, content })

    if (error) throw error
  }

  return { messages, sendMessage, channel }
}
```

### Pattern 2: User Presence Tracking

```typescript
// hooks/usePresence.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface PresenceState {
  user_id: string
  username: string
  avatar_url?: string
  online_at: string
  last_active: string
}

export function usePresence(channelName: string, userId: string, metadata: Partial<PresenceState>) {
  const [presenceState, setPresenceState] = useState<Record<string, PresenceState[]>>({})
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([])

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>()
        setPresenceState(state)

        // Flatten presence state (each user can have multiple connections)
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            ...metadata
          })

          // Update last_active every 30 seconds
          const interval = setInterval(async () => {
            await channel.track({
              user_id: userId,
              last_active: new Date().toISOString(),
              ...metadata
            })
          }, 30000)

          return () => clearInterval(interval)
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [channelName, userId, JSON.stringify(metadata)])

  return { onlineUsers, presenceState }
}

// Usage in component
function ChatRoom({ roomId }: { roomId: string }) {
  const { user } = useAuth()
  const { onlineUsers } = usePresence(
    `room:${roomId}`,
    user.id,
    { username: user.username, avatar_url: user.avatar }
  )

  return (
    <div>
      <h3>Online ({onlineUsers.length})</h3>
      {onlineUsers.map(u => (
        <div key={u.user_id}>{u.username}</div>
      ))}
    </div>
  )
}
```

### Pattern 3: Collaborative Cursor Tracking

```typescript
// hooks/useCollaborativeCursors.ts
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { throttle } from 'lodash'

export interface CursorPosition {
  user_id: string
  username: string
  color: string
  x: number
  y: number
  timestamp: number
}

export function useCollaborativeCursors(documentId: string, userId: string, username: string) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const cursorTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Generate consistent color per user
  const userColor = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }, [userId])

  useEffect(() => {
    const channel = supabase.channel(`cursors:${documentId}`, {
      config: { broadcast: { self: false } }
    })

    channel
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        const cursor = payload as CursorPosition

        setCursors(prev => {
          const next = new Map(prev)
          next.set(cursor.user_id, cursor)
          return next
        })

        // Remove cursor after 5s of inactivity
        const existing = cursorTimeouts.current.get(cursor.user_id)
        if (existing) clearTimeout(existing)

        const timeout = setTimeout(() => {
          setCursors(prev => {
            const next = new Map(prev)
            next.delete(cursor.user_id)
            return next
          })
        }, 5000)

        cursorTimeouts.current.set(cursor.user_id, timeout)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      cursorTimeouts.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [documentId])

  // Throttled cursor broadcast (60fps max)
  const broadcastCursor = useCallback(
    throttle((x: number, y: number) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          user_id: userId,
          username,
          color: userColor,
          x,
          y,
          timestamp: Date.now()
        }
      })
    }, 16), // ~60fps
    [userId, username, userColor]
  )

  return { cursors, broadcastCursor }
}

// Usage
function CollaborativeEditor({ documentId }: { documentId: string }) {
  const { user } = useAuth()
  const { cursors, broadcastCursor } = useCollaborativeCursors(
    documentId,
    user.id,
    user.username
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    broadcastCursor(x, y)
  }

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove}>
      {Array.from(cursors.values()).map(cursor => (
        <Cursor key={cursor.user_id} {...cursor} />
      ))}
      <Editor documentId={documentId} />
    </div>
  )
}
```

## Advanced Techniques

### Optimistic Updates with Rollback

```typescript
// hooks/useOptimisticMessages.ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface OptimisticMessage extends Message {
  _optimistic?: boolean
  _error?: string
}

export function useOptimisticMessages(roomId: string) {
  const [messages, setMessages] = useState<OptimisticMessage[]>([])

  const sendMessage = useCallback(async (content: string) => {
    const optimisticId = crypto.randomUUID()
    const optimisticMessage: OptimisticMessage = {
      id: optimisticId,
      room_id: roomId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      _optimistic: true
    }

    // Add optimistically
    setMessages(prev => [...prev, optimisticMessage])

    try {
      // Actual insert
      const { data, error } = await supabase
        .from('messages')
        .insert({ room_id: roomId, content })
        .select()
        .single()

      if (error) throw error

      // Replace optimistic with real
      setMessages(prev => prev.map(m =>
        m.id === optimisticId ? data : m
      ))
    } catch (error) {
      // Mark as error
      setMessages(prev => prev.map(m =>
        m.id === optimisticId
          ? { ...m, _error: error.message }
          : m
      ))
    }
  }, [roomId, user.id])

  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message?._error) return

    // Remove error state
    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, _error: undefined }
        : m
    ))

    // Retry
    await sendMessage(message.content)

    // Remove failed message
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }, [messages, sendMessage])

  return { messages, sendMessage, retryMessage }
}
```

### Channel Multiplexing

```typescript
// lib/realtimeManager.ts
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'

class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>()
  private subscriptionCounts = new Map<string, number>()

  subscribe(channelName: string, callbacks: {
    onMessage?: (payload: any) => void
    onPresence?: (state: any) => void
    onBroadcast?: (payload: any) => void
  }) {
    let channel = this.channels.get(channelName)

    if (!channel) {
      channel = supabase.channel(channelName)

      if (callbacks.onMessage) {
        channel.on('postgres_changes', { event: '*', schema: 'public' }, callbacks.onMessage)
      }
      if (callbacks.onPresence) {
        channel.on('presence', { event: 'sync' }, callbacks.onPresence)
      }
      if (callbacks.onBroadcast) {
        channel.on('broadcast', { event: '*' }, callbacks.onBroadcast)
      }

      channel.subscribe()
      this.channels.set(channelName, channel)
      this.subscriptionCounts.set(channelName, 1)
    } else {
      this.subscriptionCounts.set(channelName, (this.subscriptionCounts.get(channelName) || 0) + 1)
    }

    return () => this.unsubscribe(channelName)
  }

  private unsubscribe(channelName: string) {
    const count = this.subscriptionCounts.get(channelName) || 0

    if (count <= 1) {
      const channel = this.channels.get(channelName)
      channel?.unsubscribe()
      this.channels.delete(channelName)
      this.subscriptionCounts.delete(channelName)
    } else {
      this.subscriptionCounts.set(channelName, count - 1)
    }
  }

  broadcast(channelName: string, event: string, payload: any) {
    const channel = this.channels.get(channelName)
    return channel?.send({ type: 'broadcast', event, payload })
  }
}

export const realtimeManager = new RealtimeManager()
```

### Delta Updates for Large Objects

```typescript
// Instead of broadcasting entire document state, send patches
import { diff, patch } from 'jsondiffpatch'

interface DocumentState {
  content: string
  selection?: { start: number; end: number }
  version: number
}

export function useCollaborativeDocument(documentId: string) {
  const [state, setState] = useState<DocumentState>({ content: '', version: 0 })
  const previousStateRef = useRef<DocumentState>(state)

  useEffect(() => {
    const channel = supabase.channel(`doc:${documentId}`)

    channel
      .on('broadcast', { event: 'delta' }, ({ payload }) => {
        setState(current => {
          if (payload.version <= current.version) return current

          const patched = patch(current, payload.delta)
          return { ...patched, version: payload.version }
        })
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [documentId])

  const updateDocument = useCallback((updates: Partial<DocumentState>) => {
    setState(current => {
      const next = { ...current, ...updates, version: current.version + 1 }

      // Calculate and broadcast delta
      const delta = diff(previousStateRef.current, next)
      if (delta) {
        channel.send({
          type: 'broadcast',
          event: 'delta',
          payload: { delta, version: next.version }
        })
      }

      previousStateRef.current = next
      return next
    })
  }, [])

  return { state, updateDocument }
}
```

## Production Examples

### Example 1: Live Notification System

```typescript
// features/notifications/useRealtimeNotifications.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Notification {
  id: string
  user_id: string
  type: 'mention' | 'reply' | 'like' | 'follow'
  title: string
  message: string
  action_url?: string
  read: boolean
  created_at: string
}

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load initial notifications
    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    }

    loadNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification

          setNotifications(prev => [notification, ...prev])
          setUnreadCount(prev => prev + 1)

          // Show toast notification
          toast(notification.title, {
            description: notification.message,
            action: notification.action_url ? {
              label: 'View',
              onClick: () => window.location.href = notification.action_url!
            } : undefined
          })

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icon.png'
            })
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updated = payload.new as Notification
          setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n))
          if (updated.read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => channel.unsubscribe()
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
  }, [])

  const markAllAsRead = useCallback(async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
  }, [userId])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
```

### Example 2: Real-Time Analytics Dashboard

```typescript
// features/analytics/useRealtimeMetrics.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Metric {
  timestamp: string
  active_users: number
  requests_per_second: number
  error_rate: number
  avg_response_time: number
}

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [liveStats, setLiveStats] = useState({
    activeUsers: 0,
    requestRate: 0
  })

  useEffect(() => {
    // Load historical data
    const loadHistory = async () => {
      const { data } = await supabase
        .from('metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('timestamp', { ascending: true })

      if (data) setMetrics(data)
    }

    loadHistory()

    // Subscribe to metric updates
    const metricsChannel = supabase
      .channel('metrics-stream')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'metrics' },
        (payload) => {
          const metric = payload.new as Metric
          setMetrics(prev => [...prev.slice(-59), metric]) // Keep last 60 points
        }
      )
      .subscribe()

    // Subscribe to live stats broadcast
    const statsChannel = supabase
      .channel('live-stats')
      .on('broadcast', { event: 'stats-update' }, ({ payload }) => {
        setLiveStats(payload)
      })
      .subscribe()

    return () => {
      metricsChannel.unsubscribe()
      statsChannel.unsubscribe()
    }
  }, [])

  return { metrics, liveStats }
}
```

### Example 3: Multiplayer Game State Sync

```typescript
// features/game/useGameSync.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface GameState {
  game_id: string
  players: Record<string, PlayerState>
  board: any
  current_turn: string
  status: 'waiting' | 'active' | 'finished'
  updated_at: string
}

interface PlayerState {
  user_id: string
  username: string
  position: { x: number; y: number }
  health: number
  score: number
}

export function useGameSync(gameId: string, userId: string) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [latency, setLatency] = useState(0)

  useEffect(() => {
    // Load initial state
    const loadGame = async () => {
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single()

      if (data) setGameState(data)
    }

    loadGame()

    const channel = supabase.channel(`game:${gameId}`, {
      config: {
        broadcast: { ack: true },
        presence: { key: userId }
      }
    })

    // Track player presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Players online:', Object.keys(state).length)
      })
      // Game state updates from database
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `game_id=eq.${gameId}` },
        (payload) => {
          setGameState(payload.new as GameState)
        }
      )
      // Real-time player actions (via broadcast for low latency)
      .on('broadcast', { event: 'player-action' }, ({ payload }) => {
        setGameState(current => {
          if (!current) return current

          return {
            ...current,
            players: {
              ...current.players,
              [payload.user_id]: payload.playerState
            }
          }
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, joined_at: Date.now() })
        }
      })

    // Measure latency
    const measureLatency = setInterval(async () => {
      const start = Date.now()
      await channel.send({
        type: 'broadcast',
        event: 'ping',
        payload: { timestamp: start }
      })
      setLatency(Date.now() - start)
    }, 5000)

    return () => {
      clearInterval(measureLatency)
      channel.unsubscribe()
    }
  }, [gameId, userId])

  const performAction = useCallback(async (playerState: PlayerState) => {
    const channel = supabase.channel(`game:${gameId}`)

    // Broadcast immediately for low latency
    await channel.send({
      type: 'broadcast',
      event: 'player-action',
      payload: { user_id: userId, playerState }
    })

    // Persist to database (can be debounced)
    await supabase
      .from('games')
      .update({
        players: {
          ...gameState?.players,
          [userId]: playerState
        },
        updated_at: new Date().toISOString()
      })
      .eq('game_id', gameId)
  }, [gameId, userId, gameState])

  return { gameState, latency, performAction }
}
```

## Best Practices

### 1. Resource Management

```typescript
// Always clean up subscriptions
useEffect(() => {
  const channel = supabase.channel('my-channel')
  channel.subscribe()

  return () => {
    channel.unsubscribe() // Critical!
  }
}, [])

// Use channel pooling for multiple subscriptions
// Bad: Multiple channels for same room
const channel1 = supabase.channel(`room:${id}`).on(...)
const channel2 = supabase.channel(`room:${id}`).on(...)

// Good: Single channel with multiple listeners
const channel = supabase.channel(`room:${id}`)
  .on('postgres_changes', ...)
  .on('presence', ...)
  .on('broadcast', ...)
```

### 2. Security First

```typescript
// Enable RLS on all realtime tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages in their rooms"
  ON messages FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM room_members WHERE user_id = auth.uid()
    )
  );

// Configure realtime authorization in Supabase Dashboard
// Or via SQL:
BEGIN;
  -- Allow presence tracking only for authenticated users
  INSERT INTO realtime.channels (name, authorized)
  VALUES ('room:*', jsonb_build_object('read', 'authenticated', 'write', 'authenticated'));
COMMIT;
```

### 3. Performance Optimization

```typescript
// Throttle/debounce high-frequency events
import { throttle } from 'lodash'

const broadcastPosition = throttle((x, y) => {
  channel.send({ type: 'broadcast', event: 'move', payload: { x, y } })
}, 100) // Max 10 updates/second

// Batch database updates
const pendingUpdates = useRef<Update[]>([])

useEffect(() => {
  const interval = setInterval(async () => {
    if (pendingUpdates.current.length > 0) {
      await supabase.from('states').upsert(pendingUpdates.current)
      pendingUpdates.current = []
    }
  }, 1000)

  return () => clearInterval(interval)
}, [])

// Use filters to reduce message volume
channel.on('postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `room_id=eq.${roomId}` // Only receive relevant messages
  },
  handler
)
```

### 4. Error Handling

```typescript
const channel = supabase.channel('my-channel')

channel.subscribe((status, err) => {
  switch (status) {
    case 'SUBSCRIBED':
      console.log('Connected')
      break
    case 'CHANNEL_ERROR':
      console.error('Channel error:', err)
      // Implement retry logic
      setTimeout(() => channel.subscribe(), 5000)
      break
    case 'TIMED_OUT':
      console.warn('Connection timeout')
      // Auto-retry is built-in, but you can add custom logic
      break
    case 'CLOSED':
      console.log('Channel closed')
      break
  }
})

// Handle broadcast acknowledgments
const sent = await channel.send({
  type: 'broadcast',
  event: 'my-event',
  payload: { data: 'important' }
})

if (sent !== 'ok') {
  console.error('Message failed to send')
  // Retry or queue for later
}
```

## Common Pitfalls

1. **Memory Leaks from Unsubscribed Channels**
   - Always call `unsubscribe()` in cleanup functions
   - Use React's `useEffect` cleanup properly

2. **RLS Blocking Realtime Updates**
   - Postgres changes respect RLS policies
   - If users can't SELECT a row, they won't receive updates
   - Test policies thoroughly

3. **Channel Name Collisions**
   - Use namespaced channel names: `room:${id}`, `user:${id}`, etc.
   - Avoid generic names like 'updates' or 'messages'

4. **Broadcasting Too Frequently**
   - Can overwhelm servers and clients
   - Always throttle high-frequency events (cursors, scrolling, etc.)
   - Consider debouncing for text input

5. **Not Handling Reconnections**
   - Network can drop, phones sleep, etc.
   - Reload critical state after reconnection
   - Show connection status to users

6. **Presence State Confusion**
   - Each client connection creates a separate presence entry
   - User can have multiple entries (multiple tabs/devices)
   - Use `key` config to control uniqueness

7. **Ignoring Authorization**
   - Broadcast and Presence bypass RLS by default
   - Configure channel-level authorization in Supabase Dashboard
   - Never trust client-sent data

## Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Phoenix Channels (underlying tech)](https://hexdocs.pm/phoenix/channels.html)
- [Realtime Security](https://supabase.com/docs/guides/realtime/security)
- [Presence Tracking Guide](https://supabase.com/docs/guides/realtime/presence)
- [Broadcast Examples](https://supabase.com/docs/guides/realtime/broadcast)
- [supabase-js Reference](https://supabase.com/docs/reference/javascript/subscribe)

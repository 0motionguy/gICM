# WebSocket Real-Time Communication

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master WebSocket implementation for real-time bidirectional communication.

## Quick Reference

### Server (Socket.IO)
```typescript
import { Server } from 'socket.io'

const io = new Server(3000, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('message', (data) => {
    // Broadcast to all clients
    io.emit('message', data)

    // Send to specific room
    io.to('room1').emit('message', data)

    // Send to sender only
    socket.emit('ack', { received: true })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})
```

### Client
```typescript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

socket.on('connect', () => {
  console.log('Connected')
})

socket.on('message', (data) => {
  console.log('Received:', data)
})

socket.emit('message', { text: 'Hello' })
```

### Rooms and Namespaces
```typescript
// Join room
socket.join('room1')

// Leave room
socket.leave('room1')

// Namespace
const chatNamespace = io.of('/chat')
chatNamespace.on('connection', (socket) => {
  // Handle chat-specific events
})
```

## Best Practices

- Implement heartbeat/ping-pong for connection health
- Handle reconnection with exponential backoff
- Use rooms for targeted broadcasts
- Authenticate connections with JWT
- Implement message acknowledgments
- Set connection limits to prevent DoS

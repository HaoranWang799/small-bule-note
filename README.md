# IM Chat App — WeChat-like Instant Messaging

Production-grade MVP for a real-time instant messaging system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + NestJS |
| Database | PostgreSQL |
| Cache/PubSub | Redis |
| Realtime | WebSocket (Socket.IO) |
| Auth | JWT + bcrypt |
| Infrastructure | Docker, Railway, GitHub Actions |

## Project Structure

```
backend/
├── src/
│   ├── auth/          # JWT authentication (register/login)
│   ├── users/         # User profile management
│   ├── contacts/      # Friendship/contacts management
│   ├── chat/          # Message storage & history
│   ├── websocket/     # WebSocket gateway (real-time)
│   └── common/        # Redis service, filters, decorators
├── Dockerfile
├── schema.sql         # Database schema reference
└── railway.toml
```

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
docker-compose up -d postgres redis
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

### 3. Install & run

```bash
npm install
npm run start:dev
```

Server starts at `http://localhost:3000`.

### 4. Or run everything via Docker

```bash
docker-compose up --build
```

## API Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (rate-limited) |

### Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/profile` | Get current user profile |
| PATCH | `/api/users/profile` | Update profile |

### Contacts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/contacts` | Get contact list |
| POST | `/api/contacts/add` | Send friend request |
| DELETE | `/api/contacts/remove` | Remove contact |

### Messages

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages/history?contact_id=<uuid>` | Get chat history |

## WebSocket Events

Connect with `Authorization: Bearer <token>` in handshake auth.

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ receiver_id, content, message_type?, client_message_id? }` | Send message |
| `message:read` | `{ message_ids: string[] }` | Mark messages as read |
| `ping` | — | Heartbeat |
| `typing:start` | `{ receiver_id }` | Typing indicator |
| `typing:stop` | `{ receiver_id }` | Stop typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ userId, socketId }` | Connection confirmed |
| `message:sent` | `{ message_id, client_message_id, timestamp, status }` | Send acknowledgment |
| `message:receive` | `{ id, sender_id, content, message_type, status, created_at }` | Incoming message |
| `user:online` | `{ userId }` | Contact came online |
| `user:offline` | `{ userId }` | Contact went offline |
| `typing:start` | `{ userId }` | Contact is typing |
| `typing:stop` | `{ userId }` | Contact stopped typing |
| `pong` | `{ timestamp }` | Heartbeat response |
| `error` | `{ message }` | Error message |

## Message Flow

```
Sender                    Server                     Receiver
  |                         |                           |
  |-- message:send -------->|                           |
  |                         |-- save to PostgreSQL      |
  |                         |-- check Redis online      |
  |<-- message:sent --------|                           |
  |                         |-- message:receive ------->|
  |                         |-- mark delivered          |
```

## Deploy to Railway

### 1. Create Railway project

- Add **PostgreSQL** plugin
- Add **Redis** plugin
- Create a **Service** from your GitHub repo

### 2. Set environment variables

In Railway dashboard, set:

```
PORT=3000
DATABASE_URL=<auto-provided by Railway PostgreSQL>
REDIS_URL=<auto-provided by Railway Redis>
JWT_SECRET=<your-production-secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 3. Configure GitHub Actions

Add these secrets to your GitHub repo:

- `RAILWAY_TOKEN` — your Railway API token
- `RAILWAY_SERVICE_NAME` — your service name on Railway

### 4. Deploy

Push to `main` branch — GitHub Actions will build, test, and deploy automatically.

## Architecture Decisions

- **Stateless backend**: No in-memory sessions. All state in Redis/PostgreSQL.
- **Horizontal scaling**: Multiple instances can run behind a load balancer.
- **Message deduplication**: `client_message_id` prevents duplicate sends.
- **Server timestamps**: All messages timestamped by the server to ensure ordering.
- **Heartbeat**: 30s ping/pong cycle prevents WebSocket connection leaks.
- **Cursor pagination**: Message history uses cursor-based pagination for efficiency.

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT-based stateless authentication
- Rate limiting on login endpoint
- Input validation on all endpoints
- CORS enabled
- SQL injection prevention via TypeORM parameterized queries

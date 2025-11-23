# FT-17: Matrix Chat Integration

---
feature_id: FT-17
title: Matrix Chat Integration
status: Planned
last_updated: 2025-01-18
related_features: [FT-01, FT-02, FT-03, FT-04, FT-06, FT-12, FT-13]
database_tables:
  planned: [matrix_user_mappings]
  modified: [communities, councils, wealth_requests]
---

## Overview

Integrate Matrix protocol for real-time messaging across the application. This enables user-to-user direct messages, council private channels, and community chat rooms with end-to-end encryption support.

## Purpose

- **Request Coordination**: Allow resource requester and owner to coordinate delivery after request acceptance
- **Council Communication**: Provide encrypted private channels for council members
- **Community Chat**: Single community-wide chat room for general discussion
- **Federation**: Future support for cross-instance communication between self-hosted deployments

## Key Concepts

### Matrix Protocol

Matrix is an open standard for decentralized, real-time communication. Key components:

- **Homeserver**: Server that stores messages and handles federation (e.g., Synapse, Dendrite, Conduit)
- **Spaces**: Hierarchical containers for rooms (maps to communities)
- **Rooms**: Individual chat channels (maps to councils, DMs, community chat)
- **Power Levels**: Permission system (0-100 scale) controlling who can perform actions
- **E2EE**: End-to-end encryption via Olm/Megolm protocols

### Trust to Power Level Mapping

User trust scores map to Matrix power levels for consistent permissions:

| Trust Score | Power Level | Matrix Capabilities |
|-------------|-------------|---------------------|
| 0-4 | 0 | Send messages |
| 5-14 | 10 | Basic trusted member |
| 15-29 | 25 | Invite others to rooms |
| 30+ | 50 | Moderator (kick/ban/redact) |
| Admin role | 100 | Full room administration |

Power levels sync automatically when trust scores change.

### Encryption Policy

- **Council rooms**: Always encrypted (E2EE)
- **Direct messages**: Always encrypted (E2EE)
- **Community general chat**: Unencrypted by default (configurable)

## Architecture

### Component Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Keycloak   │────►│   Matrix     │◄────│  PostgreSQL  │
│   (IdP)      │Auth │  Homeserver  │     │  (Matrix DB) │
└──────────────┘     └──────────────┘     └──────────────┘
                            ▲
                            │ matrix-js-sdk
                            │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Your API    │────►│ Matrix Sync  │     │   Frontend   │
│  (Express)   │     │   Service    │     │  (SolidJS)   │
│              │     │              │     │              │
│ - Trust mgmt │     │ - Bot client │     │ - Hydrogen   │
│ - OpenFGA    │     │ - Power sync │     │   SDK embed  │
│ - Communities│     │ - Room mgmt  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Matrix User ID Mapping

Matrix user IDs derive from Keycloak user IDs:

```
@{keycloak_user_id}:yourdomain.com
```

Example: `@550e8400-e29b-41d4-a716-446655440000:communities.example.com`

### Space/Room Hierarchy

```
Community Space (m.space)
├── General Room (community chat)
├── Council A Space (nested m.space, encrypted)
│   └── Council A Discussion Room (encrypted)
├── Council B Space (nested m.space, encrypted)
│   └── Council B Discussion Room (encrypted)
└── [Additional rooms as needed]

Direct Messages (separate, encrypted)
└── User A ↔ User B DM Room
```

## Authentication Integration

### Current Status: Blocked

Matrix authentication integration with Keycloak requires one of:

1. **Synapse OIDC**: Works but has performance and UX limitations
2. **Matrix Authentication Service (MAS)**: Not production-ready, development status uncertain after Element fork
3. **Tuwunel**: More aligned with performance needs, not yet stable

### Target Architecture

Once authentication is stable, the flow will be:

1. User authenticates with Keycloak (existing flow)
2. Keycloak session provides Matrix access token
3. Frontend uses token to connect to Matrix homeserver
4. Single sign-on across app and chat

### Recommended Approach

Wait for MAS stabilization or contribute to Tuwunel client auth. Monitor:
- https://github.com/element-hq/matrix-authentication-service
- https://github.com/avdb13/tuwunel

## Configuration

### Community-Level Settings

Stored in `communities` table:

```typescript
// communities.config additions
{
  matrixEnabled: { type: 'boolean', value: true },
  matrixGeneralChatEncrypted: { type: 'boolean', value: false },
  matrixCouncilChatsEncrypted: { type: 'boolean', value: true }  // Cannot be false
}
```

### System-Level Settings

Environment variables:

```bash
MATRIX_HOMESERVER_URL=https://matrix.yourdomain.com
MATRIX_BOT_USER_ID=@bot:yourdomain.com
MATRIX_BOT_ACCESS_TOKEN=syt_...
MATRIX_SERVER_NAME=yourdomain.com
```

## Database Changes

### New Tables

```sql
-- Track Matrix user provisioning
CREATE TABLE matrix_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  matrix_user_id TEXT NOT NULL UNIQUE,
  provisioned_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

CREATE INDEX idx_matrix_user_mappings_user ON matrix_user_mappings(user_id);
CREATE INDEX idx_matrix_user_mappings_matrix ON matrix_user_mappings(matrix_user_id);
```

### Modified Tables

```sql
-- Add Matrix Space IDs to communities
ALTER TABLE communities ADD COLUMN matrix_space_id TEXT;
ALTER TABLE communities ADD COLUMN matrix_general_room_id TEXT;

-- Add Matrix Space IDs to councils
ALTER TABLE councils ADD COLUMN matrix_space_id TEXT;
ALTER TABLE councils ADD COLUMN matrix_discussion_room_id TEXT;

-- Link wealth requests to coordination DMs
ALTER TABLE wealth_requests ADD COLUMN matrix_coordination_room_id TEXT;
```

## Implementation Details

### Matrix Sync Service

New service in API that manages Matrix integration:

```typescript
// src/services/matrixSync.service.ts

interface MatrixSyncService {
  // User management
  provisionUser(userId: string): Promise<string>;  // Returns Matrix user ID

  // Community management
  createCommunitySpace(communityId: string): Promise<string>;
  deleteCommunitySpace(communityId: string): Promise<void>;

  // Council management
  createCouncilSpace(councilId: string, communitySpaceId: string): Promise<string>;
  deleteCouncilSpace(councilId: string): Promise<void>;

  // Trust sync
  syncTrustToPowerLevel(userId: string, communityId: string, trustScore: number): Promise<void>;

  // DM management
  getOrCreateDM(userAId: string, userBId: string): Promise<string>;
  createRequestCoordinationDM(requestId: string): Promise<string>;
}
```

### Community Lifecycle

**On Community Creation:**
1. Create Matrix Space with community name
2. Create General room within Space
3. Set initial power levels based on trust thresholds
4. Store Space/room IDs in database

**On Community Soft Delete:**
1. Archive Matrix Space (prevent new messages)
2. Retain for 60 days

**On Community Hard Delete (after 60 days):**
1. Delete all rooms in Space hierarchy
2. Delete Space itself
3. Remove database references

### Council Lifecycle

**On Council Creation:**
1. Create nested Space within community Space
2. Create encrypted Discussion room
3. Invite council members
4. Set power levels based on council roles

**On Council Deletion:**
1. Follow same soft/hard delete pattern as community

### Request Coordination Flow

**On Wealth Request Acceptance:**
1. Get or create DM room between requester and owner
2. Send context message with request link
3. Store room ID in wealth_request record
4. Users continue conversation in DM

### Trust Change Propagation

**When trust score changes:**
1. Calculate new power level from mapping
2. Get all rooms user is member of in that community
3. Update power level in each room
4. Log change for audit

## Frontend Integration

### Hydrogen SDK Embedding

Lightweight Matrix client embedded in SolidJS:

```typescript
// components/chat/ChatEmbed.tsx
import { Platform, Client } from 'hydrogen-view-sdk';

export function ChatEmbed(props: { roomId: string }) {
  // Initialize Hydrogen with Matrix access token from auth context
  // Render room timeline and composer
}
```

### Chat Entry Points

- **Request detail page**: "Coordinate" tab shows DM with other party
- **Council page**: "Chat" tab shows council discussion room
- **Community page**: "Chat" tab shows general room
- **Messages page**: List of all DMs and rooms

## Use Cases

### UC-1: Coordinate Resource Delivery

1. Alice shares a table, Bob requests it
2. Alice accepts the request
3. System creates/finds DM between Alice and Bob
4. System sends message: "Request accepted! Coordinate delivery for: [View Request]"
5. Alice and Bob chat to arrange pickup time/location
6. Conversation is encrypted and persisted

### UC-2: Council Private Discussion

1. Community creates "Dispute Resolution Council"
2. System creates encrypted Space and Discussion room
3. Council members are invited with appropriate power levels
4. Members discuss cases privately
5. Only council members can read messages (E2EE)

### UC-3: Community Announcements

1. Admin posts in community General chat
2. All community members can see message
3. Members with sufficient trust can respond
4. Members below invite threshold (trust < 15) cannot invite others

### UC-4: Trust-Based Moderation

1. Member reaches trust score of 30+
2. System updates their power level to 50 in all community rooms
3. Member can now kick/ban/redact messages
4. If trust drops below 30, power level reduces automatically

### UC-5: Federation (Future)

1. Community A on instance-1.com
2. Community B on instance-2.com
3. User from A can DM user from B
4. Messages federate between homeservers
5. Each instance maintains sovereignty over its data

## Infrastructure Requirements

### Homeserver Deployment

**Synapse (Recommended for stability):**
- 2GB+ RAM
- PostgreSQL database (separate from app DB)
- Domain with SSL: matrix.yourdomain.com
- Well-known files for federation

**Docker Compose Addition:**

```yaml
services:
  synapse:
    image: matrixdotorg/synapse:latest
    volumes:
      - ./synapse-data:/data
    environment:
      - SYNAPSE_CONFIG_PATH=/data/homeserver.yaml
    depends_on:
      - postgres-matrix
    ports:
      - "8008:8008"

  postgres-matrix:
    image: postgres:15
    volumes:
      - matrix-db:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=synapse
      - POSTGRES_USER=synapse
      - POSTGRES_PASSWORD=${MATRIX_DB_PASSWORD}

volumes:
  matrix-db:
```

### Reverse Proxy Configuration

```nginx
server {
    server_name matrix.yourdomain.com;

    location /_matrix {
        proxy_pass http://synapse:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        client_max_body_size 50M;
    }
}
```

## Implementation Phases

### Phase 0: Documentation & Monitoring (Current)
- Document feature requirements (this document)
- Monitor MAS/Tuwunel development
- Evaluate when auth integration is viable

### Phase 1: Foundation
- Deploy Synapse homeserver
- Implement Keycloak OIDC integration (when ready)
- Create Matrix sync service
- User provisioning on registration

### Phase 2: Community Spaces
- Auto-create Space on community creation
- Create General chat room
- Basic Hydrogen embed in frontend
- Soft/hard delete lifecycle

### Phase 3: Trust & Power Levels
- Implement trust → power level mapping
- Sync on trust changes
- Handle admin roles

### Phase 4: Councils & DMs
- Council Space creation (encrypted)
- DM creation on request acceptance
- Request context linking

### Phase 5: Polish & Federation
- Federation configuration
- Cross-instance messaging
- Performance optimization

## Security Considerations

### Encryption

- Council rooms MUST use E2EE (non-configurable)
- DMs MUST use E2EE (non-configurable)
- Community general chat encryption is optional
- Key backup/recovery TBD

### Access Control

- Room membership controlled by Space membership (restricted join rules)
- Power levels enforce moderation capabilities
- Bot account has admin in all rooms for management
- Users cannot escalate beyond their trust-based power level

### Data Retention

- Messages stored on Matrix homeserver (separate from app DB)
- Community deletion → 60-day soft delete → hard delete of all Matrix data
- Consider Matrix retention policies for compliance

### Audit Trail

- Power level changes logged
- Room creation/deletion logged
- Integrate with FT-14 Audit Log

## Open Questions

1. **Key backup**: How to handle E2EE key backup for account recovery?
2. **Message search**: Should messages be searchable? (E2EE complicates this)
3. **Notifications**: Push notifications for new messages?
4. **File sharing**: Allow attachments in Matrix? Size limits?
5. **Bot commands**: Slash commands for common actions (e.g., `/request status`)?
6. **Moderation tools**: Beyond kick/ban, what moderation features needed?
7. **Read receipts**: Show read status in DMs?

## Dependencies

- **FT-01 Communities**: Space creation tied to community lifecycle
- **FT-02 Members & Permissions**: Role mapping to power levels
- **FT-03 Trust System**: Trust score → power level sync
- **FT-04 Wealth Sharing**: Request coordination DMs
- **FT-06 Councils**: Council encrypted channels
- **FT-12 Configuration**: Community-level chat settings
- **FT-13 Security**: Consistent authorization model

## Future Considerations

### Bridges
- Bridge to other protocols (IRC, Discord, Slack) if needed
- Matrix has extensive bridge ecosystem

### Bots
- Notification bot for system events
- Moderation bot for automated enforcement
- Integration bot for external services

### Voice/Video
- Matrix supports voice/video via Jitsi integration
- Could add for council meetings

### Threads
- Matrix supports threaded replies
- Could use for structured discussions

## References

- [Matrix Specification](https://spec.matrix.org/)
- [Synapse Documentation](https://matrix-org.github.io/synapse/)
- [Hydrogen SDK](https://github.com/element-hq/hydrogen-web)
- [Matrix Authentication Service](https://github.com/element-hq/matrix-authentication-service)
- [Tuwunel](https://github.com/avdb13/tuwunel)
- [Matrix Power Levels](https://spec.matrix.org/v1.8/client-server-api/#mroompower_levels)

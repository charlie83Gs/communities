# Share Application - System Design & Development Prompt

## Vision Statement
Build a revolutionary community-based sharing and exchange platform designed to transform human interaction from transactional to collaborative, promoting resource sharing, community support, and trust-based exchanges without monetary transactions.

## Core Philosophy
- **No Money Exchange**: While money can be shared as a gift, it cannot be used as exchange currency
- **Community-First**: All actions strengthen community bonds
- **Trust-Based**: Reputation system encourages positive participation
- **Collaborative Problem-Solving**: Community needs addressed collectively

## Database Schema Design

### Core Entities

```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Communities table
communities (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('physical', 'digital'),
  visibility ENUM('public', 'private'),
  location_restricted BOOLEAN DEFAULT false,
  country VARCHAR(2), -- ISO code
  state_province VARCHAR(100),
  city VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP
)

-- Shares table
shares (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  community_id UUID REFERENCES communities(id),
  title VARCHAR(200),
  description TEXT,
  type ENUM('object', 'service'),
  duration_type ENUM('timebound', 'unlimited'),
  end_date TIMESTAMP,
  distribution_type ENUM('request_based', 'unit_based'),
  units_available INTEGER,
  max_units_per_user INTEGER,
  automation_enabled BOOLEAN DEFAULT false,
  status ENUM('active', 'fulfilled', 'expired', 'cancelled'),
  created_at TIMESTAMP
)

-- Exchanges table
exchanges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  community_id UUID REFERENCES communities(id),
  offered_item VARCHAR(200),
  offered_description TEXT,
  desired_item VARCHAR(200),
  desired_description TEXT,
  status ENUM('open', 'negotiating', 'completed', 'cancelled'),
  created_at TIMESTAMP
)

-- Needs table
needs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  community_id UUID REFERENCES communities(id),
  title VARCHAR(200),
  description TEXT,
  type ENUM('personal', 'community'),
  urgency ENUM('low', 'medium', 'high', 'critical'),
  status ENUM('open', 'in_progress', 'fulfilled', 'cancelled'),
  created_at TIMESTAMP
)

-- Councils table
councils (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  name VARCHAR(100),
  type ENUM('default', 'temporal'),
  purpose TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
)

-- Trust scores table
trust_scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  community_id UUID REFERENCES communities(id),
  score INTEGER DEFAULT 0,
  last_updated TIMESTAMP,
  UNIQUE(user_id, community_id)
)

-- Wealth pools table
wealth_pools (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  council_id UUID REFERENCES councils(id),
  name VARCHAR(100),
  description TEXT,
  max_request_amount INTEGER,
  request_frequency_hours INTEGER,
  status ENUM('active', 'depleted', 'paused'),
  created_at TIMESTAMP
)

-- Activity logs table
activity_logs (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id), -- for exchanges/shares
  activity_type ENUM('share', 'exchange', 'need_created', 'need_fulfilled', 
                     'member_joined', 'trust_granted', 'trust_revoked', 
                     'council_decision', 'wealth_pool_donation', 'wealth_pool_withdrawal'),
  entity_id UUID, -- references the specific share/exchange/need/etc
  entity_type VARCHAR(50),
  units INTEGER, -- for quantifiable activities
  item_description TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- additional activity-specific data
)

-- Community activity settings table
community_activity_settings (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id) UNIQUE,
  visibility_level ENUM('full', 'anonymous', 'relational', 'summary'),
  show_trust_changes BOOLEAN DEFAULT true,
  show_council_activities BOOLEAN DEFAULT true,
  show_wealth_pool_activities BOOLEAN DEFAULT true,
  custom_filters JSONB, -- additional filtering rules
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Activity summaries table (for performance)
activity_summaries (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  total_shares INTEGER DEFAULT 0,
  total_exchanges INTEGER DEFAULT 0,
  total_needs_fulfilled INTEGER DEFAULT 0,
  total_members_joined INTEGER DEFAULT 0,
  most_shared_items JSONB, -- top items with counts
  most_active_users JSONB, -- top contributors (if not anonymous)
  trust_points_granted INTEGER DEFAULT 0,
  wealth_pool_transactions INTEGER DEFAULT 0,
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(community_id, period_start, period_end)
)
```

## API Endpoints Structure

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login with credentials
- `POST /api/v1/auth/logout` - Logout current session
- `POST /api/v1/auth/token` - Generate API token for MCP
- `DELETE /api/v1/auth/token/{tokenId}` - Revoke API token

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/{userId}/trust` - Get user trust scores

### Communities
- `GET /api/v1/communities` - List communities (with filters)
- `POST /api/v1/communities` - Create new community
- `GET /api/v1/communities/{id}` - Get community details
- `PUT /api/v1/communities/{id}` - Update community
- `POST /api/v1/communities/{id}/join` - Request to join private community
- `GET /api/v1/communities/{id}/members` - List community members
- `POST /api/v1/communities/{id}/needs` - Create community need
- `POST /api/v1/communities/{id}/wealth-pools` - Create wealth pool

### Shares
- `GET /api/v1/shares` - List shares (with filters)
- `POST /api/v1/shares` - Create new share
- `GET /api/v1/shares/{id}` - Get share details
- `PUT /api/v1/shares/{id}` - Update share
- `POST /api/v1/shares/{id}/request` - Request a share
- `POST /api/v1/shares/{id}/fulfill` - Mark share as fulfilled
- `GET /api/v1/shares/{id}/requests` - List share requests

### Exchanges
- `GET /api/v1/exchanges` - List exchanges
- `POST /api/v1/exchanges` - Create new exchange offer
- `GET /api/v1/exchanges/{id}` - Get exchange details
- `POST /api/v1/exchanges/{id}/propose` - Propose exchange terms
- `POST /api/v1/exchanges/{id}/accept` - Accept exchange
- `POST /api/v1/exchanges/{id}/complete` - Mark exchange complete

### Needs
- `GET /api/v1/needs` - List needs
- `POST /api/v1/needs` - Create new need
- `GET /api/v1/needs/{id}` - Get need details
- `POST /api/v1/needs/{id}/help` - Volunteer to help
- `GET /api/v1/needs/{id}/helpers` - List helpers
- `POST /api/v1/needs/{id}/fulfill` - Mark need as fulfilled

### Councils
- `GET /api/v1/councils/{communityId}` - List community councils
- `POST /api/v1/councils` - Create new council
- `POST /api/v1/councils/{id}/members` - Add council member
- `DELETE /api/v1/councils/{id}/members/{userId}` - Remove council member
- `GET /api/v1/councils/{id}/decisions` - List council decisions

### Trust System
- `POST /api/v1/trust/grant` - Grant trust points
- `POST /api/v1/trust/revoke` - Revoke trust points
- `GET /api/v1/trust/rules/{communityId}` - Get community trust rules
- `PUT /api/v1/trust/rules/{communityId}` - Update trust rules
- `POST /api/v1/trust/flag` - Flag user for review

### Activity Logs
- `GET /api/v1/communities/{id}/activity` - Get community activity log
- `GET /api/v1/communities/{id}/activity/settings` - Get activity visibility settings
- `PUT /api/v1/communities/{id}/activity/settings` - Update activity settings (council only)
- `GET /api/v1/communities/{id}/activity/summary` - Get activity summary
- `GET /api/v1/communities/{id}/activity/export` - Export activity data (council only)

### Chat/Messaging
- `GET /api/v1/chats` - List user chats
- `GET /api/v1/chats/{id}/messages` - Get chat messages
- `POST /api/v1/chats/{id}/messages` - Send message
- `WebSocket /ws/chat/{chatId}` - Real-time chat connection

### Events (Share/Exchange coordination)
- `POST /api/v1/events` - Create pickup/delivery event
- `GET /api/v1/events/{id}` - Get event details
- `PUT /api/v1/events/{id}` - Update event details
- `POST /api/v1/events/{id}/confirm` - Confirm attendance

## MCP Endpoints
Mirror all REST endpoints with MCP protocol:
- `/mcp/shares/*`
- `/mcp/exchanges/*`
- `/mcp/communities/*`
- `/mcp/needs/*`
- Authentication via Bearer token in headers


## Key Features Implementation Details

### 1. Share System
- Support multimedia uploads (images, videos, text)
- Request queue management for popular items
- Automated distribution based on rules
- Time-bound share expiration handling
- Unit tracking and allocation

### 2. Exchange System
- No monetary exchanges (validation required)
- Negotiation workflow with chat
- Exchange history tracking
- Rating system post-exchange

### 3. Community Management
- Geographic restrictions using geocoding API
- Public/private visibility controls
- Member approval workflow for private communities
- Digital vs physical community distinctions

### 4. Council System
- Default council auto-creation on community creation
- Temporal councils with expiration dates
- Decision voting mechanisms
- Council chat for coordination

### 5. Trust System
- Community-specific trust scores
- Configurable trust rules per community
- Trust grant/revoke workflows
- Flag and review system for disputes

### 6. Needs System
- Personal vs community needs distinction
- Helper coordination through dedicated chats
- Progress tracking
- Urgency levels and prioritization

### 7. Wealth Pools
- Multi-item pool support
- Donation and withdrawal tracking
- Council-managed distribution rules
- Request frequency limits

### 8. Community Activity Log
- **Visibility Levels** (Council-configurable):
  - **Full Visibility**: Shows all details including usernames, items, quantities, and interaction types
  - **Anonymous**: Shows activities with items and quantities but hides user identities
  - **Relational**: Shows who interacted with whom but hides specific items and quantities
  - **Summary Only**: Shows aggregated statistics without individual transactions
- **Activity Types Tracked**:
  - Shares created, requested, and fulfilled
  - Exchanges proposed and completed
  - Needs posted and resolved
  - Members joining/leaving
  - Trust points granted/revoked
  - Council decisions and actions
  - Wealth pool contributions and withdrawals
- **Features**:
  - Real-time activity feed with configurable refresh
  - Filterable by activity type, date range, and participants
  - Exportable activity reports for council analysis
  - Automatic summary generation (daily/weekly/monthly)
  - Performance-optimized with periodic aggregation
- **Privacy Controls**:
  - Council members can adjust visibility settings
  - Individual users can opt-out of certain activity tracking (where allowed)
  - Sensitive activities can be marked as council-only visible

### 9. Real-time Features
- WebSocket for chat functionality
- Live notifications for requests/approvals
- Real-time trust score updates
- Activity feeds per community
- Live activity log updates

## Security Considerations

1. **Authentication & Authorization**
   - Supertokens authentication
   - Role-based access control (user, council member, admin)
   - API rate limiting
   - Token expiration and rotation

2. **Data Validation**
   - Input sanitization
   - File upload restrictions (type, size)
   - SQL injection prevention
   - XSS protection

3. **Privacy**
   - Optional email/phone fields
   - Data encryption at rest
   - GDPR compliance considerations
   - User data export/deletion capabilities

## Success Metrics
- User engagement rate
- Share completion rate
- Community growth rate
- Trust score distribution
- Need fulfillment rate
- Exchange success rate
- User retention

## Scaling Considerations
- Horizontal scaling for API servers
- Database read replicas
- CDN for static assets
- Message queue for async operations
- Caching strategy (Redis)
- Geographic distribution for global communities

This system design serves as the foundation for building a platform that can fundamentally change how communities share resources and support each other, moving away from monetary transactions toward collaborative exchange and mutual aid.
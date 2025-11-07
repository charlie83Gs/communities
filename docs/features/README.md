# Community Management System - Features

## Overview
This directory contains detailed documentation for each feature of the community management system. Each feature is documented in its own file for easy reference and maintenance.

## Feature Index

### Core Features
1. [FT-01: Communities](./01-communities.md) - The foundational entity of the application (Status: Implemented)
2. [FT-02: Members & Permissions](./02-members-permissions.md) - Dual permission model (role-based + trust-based) (Status: Implemented)
3. [FT-03: Trust System](./03-trust-system.md) - Peer-to-peer trust and community-based access control (Status: Implemented)

### Resource Management
4. [FT-04: Wealth Sharing](./04-wealth-sharing.md) - Resource sharing, requests, and disputes (Status: Partial)
5. [FT-05: Pools](./05-pools.md) - Resource aggregation for collective initiatives (Status: Planned)
6. [FT-06: Councils](./06-councils.md) - Specialized community actors and groups (Status: Partial)
8. [FT-08: Needs System](./08-needs-system.md) - Community resource requirement planning (Status: Planned)

### Community Engagement
7. [FT-07: Voting & Polling](./07-voting-polling.md) - Collective decision-making (Status: Implemented)
10. [FT-10: Forum System](./10-forum-system.md) - Community discussions and knowledge building (Status: Partial)
11. [FT-11: Invite System](./11-invite-system.md) - Community growth and onboarding (Status: Implemented)

### Administration
9. [FT-09: Analytics & Statistics](./09-analytics-statistics.md) - Community health metrics and reports (Status: Planned)
12. [FT-12: Configuration](./12-configuration.md) - Per-community settings and thresholds (Status: Implemented)
13. [FT-13: Security & Access Control](./13-security-access-control.md) - OpenFGA-based authorization (Status: Implemented)

## Implementation Status Legend
- **Implemented**: Core tables exist, feature is functional
- **Partial**: Some tables implemented, feature partially functional
- **Planned**: No tables yet, feature in roadmap

## Quick Links

### For New Communities
- Start with [FT-01: Communities](./01-communities.md)
- Set up [FT-02: Members & Permissions](./02-members-permissions.md)
- Configure [FT-03: Trust System](./03-trust-system.md)
- Review [FT-12: Configuration](./12-configuration.md) options

### For Developers
- [FT-13: Security & Access Control](./13-security-access-control.md) - Authorization architecture
- [FT-02: Members & Permissions](./02-members-permissions.md) - Permission model
- [FT-03: Trust System](./03-trust-system.md) - Trust score implementation

### For Community Admins
- [FT-12: Configuration](./12-configuration.md) - Customizable settings
- [FT-09: Analytics & Statistics](./09-analytics-statistics.md) - Community health monitoring
- [FT-02: Members & Permissions](./02-members-permissions.md) - Role management

## Document Structure

Each feature document contains:
- **Overview/Purpose** - What the feature does
- **Key Concepts** - Main ideas and mechanisms
- **Configuration** - Relevant settings and thresholds
- **Use Cases** - Practical examples
- **Related Database Tables** - Data model references
- **Related Features** - Cross-references to other features

## System Philosophy

This system is built on three core principles:

1. **Trust-Based Governance** - Members earn permissions through peer trust rather than just administrative assignment
2. **Transparency** - All actions are logged and auditable
3. **Flexibility** - Communities can configure thresholds and rules to match their values

## Getting Started

For a comprehensive overview, see the [original communities.md](/home/charlie/Documents/workspace/plv-3/share-8/communities.md) document.

For implementation details:
- Backend API: `/api/` directory
- Frontend: `/frontend/` directory
- Infrastructure: `/infrastructure/` directory

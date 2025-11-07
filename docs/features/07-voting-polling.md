---
id: FT-07
title: Voting & Polling
status: implemented
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02, FT-05, FT-06]
---

# Voting & Polling

## Purpose
Enable community members to make collective decisions through polls and surveys.

## Permissions

Multiple permission models for creating polls:

1. **User-based**: Admins grant individual users access to create polls via Poll Creator role
2. **Trust threshold**: Any member above a specified trust level can create polls (default: 15)
3. **Pool role**: Users with Pool Manager roles automatically have poll creation access
4. **Council representative**: Users acting on behalf of a council (Council Managers)

## Capabilities

### Poll Creation
- Create new polls with multiple options
- Configure poll duration and visibility
- Set voting rules and parameters

### Poll Management
- View poll results and analytics
- Close polls early if needed
- Monitor participation rates

## Features
- Polls support comments for discussion
- Members can vote on poll options
- Results can be visible during or after voting (configurable)

## Access Configuration
- `minTrustForPolls` - Minimum trust score to create polls (default: 15)
- Poll Creator role - Explicit role assignment for poll creation
- Inherited access for Pool Managers and Council Managers

## Related Database Tables

### Implemented
- `polls` - Community polls with creator type (user/council/pool)
- `poll_options` - Poll options
- `poll_votes` - Votes on polls
- `initiatives` - Council proposals with status, voting
- `initiative_votes` - Votes on initiatives
- `initiative_comments` - Comments on initiatives

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-05: Pools](./05-pools.md)
- [FT-06: Councils](./06-councils.md)

## Use Cases

### Community Decision Making
1. Member creates poll: "Which community garden location should we choose?"
2. Options: Park A, Park B, Community Center
3. Members vote and discuss in comments
4. Results guide council's decision on garden location

### Council Initiative Voting
1. Council creates initiative proposal
2. Members upvote or downvote
3. Comments facilitate discussion
4. Highly supported initiatives move forward

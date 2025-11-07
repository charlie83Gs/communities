---
id: FT-11
title: Invite System
status: implemented
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02]
---

# Invite System

## Purpose
Enable community growth through controlled member invitations.

## Direct User Invites

### How It Works
- Existing users can be invited to join a community
- Invitees must accept the invitation to become members
- Users are not part of the community until they accept

### Process
1. Community member or admin sends invite to specific user
2. User receives invite notification
3. User can accept or decline
4. Upon acceptance, user becomes community member

## Invite Links

### Features
- Time-limited shareable links
- Contain a secret token for access control
- Anyone with the link and valid secret can join
- System validates expiration and rejects expired links

### Use Cases
- Sharing community access via email, messaging, or social media
- Creating time-limited open registration periods
- Onboarding multiple new members simultaneously

### Security
- Secret token prevents unauthorized access
- Expiration date limits exposure window
- Links can be deactivated by admins

## Related Database Tables

### Implemented
- `community_user_invites` - Direct user invitations
- `community_link_invites` - Time-limited invite links

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)

## Use Cases

### Bootstrapping a New Community
1. Admin creates community
2. Admin invites initial members via invite links or direct invites
3. Members accept invites and join
4. Admin grants initial trust to seed members
5. Members begin awarding trust to each other
6. Trusted members start sharing wealth and creating councils

### Community Growth
1. Existing member shares invite link in external group
2. 5 new users click the link within expiration window
3. Users create accounts or log in
4. Users automatically join community via valid invite link
5. New members start with zero trust
6. Existing members gradually award trust as new members participate

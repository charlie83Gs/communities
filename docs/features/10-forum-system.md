---
id: FT-10
title: Forum System
status: partial
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02, FT-03, FT-12]
---

# Forum System

## Purpose
Community discussion platform enabling members to create threads, share ideas, ask questions, and engage in structured conversations.

## Forum Structure

### Categories
- Top-level organizational units (e.g., "General Discussion", "Resource Sharing", "Events")
- Admins and Forum Managers can create, edit, and delete categories
- Categories can be reordered for better organization

### Threads
- Discussion topics within categories
- Any member can create threads (subject to trust requirements)
- Thread creators can edit/delete their own threads

### Posts
- Individual messages within threads
- Members reply to threads with posts
- Posts can be edited by their authors
- Posts support rich text formatting and attachments

## Forum Manager Role

### Purpose
Dedicated moderators who manage forum content and ensure healthy discussions.

### Capabilities
- Create, edit, and delete categories
- Pin/unpin threads (featured threads appear at top)
- Lock/unlock threads (prevent new posts)
- Move threads between categories
- Edit or delete any post/thread (with moderation log)
- View moderation reports and take action
- Assign temporary post restrictions to members
- Access moderation analytics and reports

### Assignment
Community admins can grant Forum Manager role to trusted members.

## Trust-Based Moderation

### Creating Content
- **Thread Creation**: Requires minimum trust score (configurable, default: 10)
- **Posting**: All members can reply to threads (no trust requirement)
- **Attachments**: Uploading images/files requires minimum trust score (configurable, default: 15)

### Peer Moderation (Community-Driven)

#### Flagging System
- Members can flag inappropriate posts/threads
- Flag types: Spam, Off-topic, Harassment, Misinformation, Other
- Flagging requires minimum trust score (configurable, default: 15)

#### Flag Threshold
- Posts with multiple flags (configurable, default: 5) are automatically hidden pending review

#### Review Queue
- Forum Managers and designated high-trust members review flagged content
- Reviewers need minimum trust score (configurable, default: 30)

### Moderation Actions
- **Warning**: Notify member about rule violations (visible to member only)
- **Post Removal**: Delete specific post with reason logged
- **Thread Lock**: Prevent new replies while keeping thread visible
- **Thread Removal**: Delete entire thread with reason logged
- **Post Restriction**: Temporarily prevent member from posting (time-based)
- **All actions are logged** in moderation history for transparency

### Moderation Log
- Records all moderation actions (who, what, when, why)
- Visible to Forum Managers and Community Admins
- Includes: Action type, moderator, target user, affected content, reason, timestamp

## Thread Features

- **Pinned Threads**: Stay at top of category (Forum Manager only)
- **Locked Threads**: Visible but cannot receive new posts
- **Thread Tags**: Optional labels for filtering (e.g., "Question", "Announcement", "Resolved")
- **Upvotes/Downvotes**: Members can vote on threads and posts
  - Vote visibility based on community configuration
  - High-quality content rises to prominence
- **Best Answer**: Thread creator can mark a post as "best answer" for questions
- **Thread Following**: Members can subscribe to thread notifications

## Search & Discovery

### Full-Text Search
Search across thread titles and post content.

### Filtering
- By category
- By tag
- By date range
- By activity (newest, most popular, most upvoted)
- By status (open, locked, with best answer)
- By posts from specific users

### Trending Threads
Automatically surface active discussions.

## User Profiles & Forum Stats

### Profile Information
- Total threads created
- Total posts made
- Total upvotes received
- Number of "best answers" received
- Forum join date

### Trust Impact
Trust score affects moderation capabilities and privileges.

## Notifications
- New replies to threads you created
- Replies to your posts
- @mentions in posts
- Moderation actions affecting your content
- Flagged content requiring review (for moderators)

## Configuration

### Forum Settings
- `minTrustForThreadCreation` - Minimum trust score to create threads (default: 10)
- `minTrustForReplies` - Minimum trust score to post replies (default: 0, all members)
- `minTrustForAttachments` - Minimum trust score to upload attachments (default: 15)
- `minTrustForFlagging` - Minimum trust score to flag content (default: 15)
- `minTrustForFlagReview` - Minimum trust score to review flagged content (default: 30)
- `minTrustForForumModeration` - Minimum trust score for full forum moderation (default: 30)
- Forum Manager role - Explicit role assignment for forum moderation
- Flag threshold - Number of flags to auto-hide content (default: 5)
- Voting settings - Enable/disable thread and post upvoting/downvoting
- Vote visibility - Configure who can see votes
- Notifications - Enable/disable @mentions and notifications

## Related Database Tables

### Implemented
- `forum_categories` - Forum organization
- `forum_threads` - Discussion threads (has isPinned, isLocked, bestAnswerPostId)
- `forum_posts` - Thread replies
- `forum_votes` - Votes on threads/posts
- `forum_thread_tags` - Thread labels

### Planned
- `forum_flags` - Member reports of inappropriate content
- `forum_moderation_log` - Audit trail of all moderation actions
- `forum_post_restrictions` - Temporary posting restrictions on members
- `forum_thread_subscriptions` - Thread notification preferences

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-12: Configuration](./12-configuration.md)

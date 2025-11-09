---
name: git
description: This skill teaches how to do commits and push to the repository. MANDATORY - You MUST read this skill before using any git command.
---


# Git Commit & Push Skill

This skill teaches the agent how to create proper commits and push changes in this project.

## CRITICAL: Release Please Workflow

This project uses **Release Please** for automated release management. Your commit messages directly generate:
- Version bumps (semantic versioning)
- Changelog entries
- GitHub releases

**Bad commits = Bad releases = Confused users**

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | When to Use | Version Impact | Example |
|------|-------------|----------------|---------|
| `feat` | New feature for users | MINOR bump (0.X.0) | `feat: add council voting system` |
| `fix` | Bug fix for users | PATCH bump (0.0.X) | `fix: resolve trust calculation error` |
| `feat!` or `BREAKING CHANGE:` | Breaking change | MAJOR bump (X.0.0) | `feat!: change trust award API response format` |
| `docs` | Documentation only | No version bump | `docs: update API endpoints guide` |
| `chore` | Maintenance tasks | No version bump | `chore: update dependencies` |
| `refactor` | Code restructuring (no behavior change) | No version bump | `refactor: simplify trust calculation logic` |
| `test` | Adding/updating tests | No version bump | `test: add council repository tests` |
| `ci` | CI/CD changes | No version bump | `ci: update GitHub Actions workflow` |
| `perf` | Performance improvements | PATCH bump | `perf: optimize database queries` |
| `style` | Code formatting | No version bump | `style: format with prettier` |

### Scopes (Optional but Recommended)

Scopes help organize changelog entries:

- `api` - Backend API changes
- `frontend` - Frontend changes
- `db` - Database schema/migrations
- `auth` - Authentication/authorization
- `trust` - Trust system
- `council` - Council features
- `forum` - Forum features
- `wealth` - Wealth sharing
- `analytics` - Analytics features

Examples:
```
feat(api): add council voting endpoints
fix(frontend): resolve trust display issue
docs(auth): document OpenFGA integration
```

## Writing Good Commit Messages

### Description Line (Required)
- **Start with lowercase** (except proper nouns)
- **Use imperative mood**: "add feature" not "added feature" or "adds feature"
- **Be specific**: What changed and why it matters to users
- **Keep it under 72 characters**

### Body (Optional but Recommended)
- Explain **why** the change was made
- Describe **what problem** it solves
- Include **context** that won't fit in the description

### Footer (Optional)
Use for additional metadata like issue references:
```
Closes #123
Refs #456
```

**IMPORTANT: Breaking Changes**
- **NEVER create breaking changes unless explicitly requested by the user**
- Breaking changes require `!` after type/scope AND `BREAKING CHANGE:` footer
- Only use when user specifically asks for a breaking change
- Example (only if user requests):
```
BREAKING CHANGE: trust award endpoint now returns { success, newScore }
instead of { awarded: boolean }. Update client code accordingly.
```

## Examples of Good vs Bad Commits

### Good Examples

```
feat(trust): add admin trust grant auditing

Administrators can now grant trust with audit trails. All admin grants
are logged separately from peer awards for transparency and compliance.

Closes #123
```

```
fix(api): prevent duplicate trust awards

Users could award trust multiple times by rapidly clicking. Added
database constraint and optimistic locking to prevent duplicates.
```

### Bad Examples

```
# Too vague
fix: bug fix

# Not imperative mood
feat: added new feature

# Missing type
update trust system

# Not user-focused
refactor: change variable names
```

## Workflow

When committing and pushing:

1. **Stage relevant files**:
   ```bash
   git add <files>
   ```

2. **Create a conventional commit**:
   ```bash
   git commit -m "type(scope): description"
   ```

   Or for commits with body:
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): description

   Longer explanation of why this change was made and what
   problem it solves for users.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

3. **Push to remote**:
   ```bash
   git push
   ```

## Release Please Behavior

Based on commits since last release:

- **feat commits** → Minor version bump (0.X.0) + changelog entry
- **fix commits** → Patch version bump (0.0.X) + changelog entry
- **BREAKING CHANGE** → Major version bump (X.0.0) + prominent changelog entry
- **Other types** → Included in release notes but don't bump version

Release Please creates/updates a PR with:
- Updated version in package.json
- Generated CHANGELOG.md
- Release notes

When PR is merged → GitHub release is automatically created.

## Quick Reference

**Most Common:**
```bash
# New feature
git commit -m "feat(scope): add user-facing feature"

# Bug fix
git commit -m "fix(scope): resolve user-impacting bug"

# Documentation
git commit -m "docs: update feature documentation"
```

## Multiple Commits in a Single PR

Release Please supports multiple commit types in one PR. Each commit is processed independently:

**Example: PR with both feat and fix**
```bash
# First commit - bug fix
git add src/repositories/trust.repository.ts
git commit -m "fix(trust): prevent negative trust scores"
git push

# Second commit - new feature
git add src/api/controllers/analytics.controller.ts
git commit -m "feat(analytics): add trust distribution metrics"
git push
```

**Result:**
- Release Please will bump MINOR version (0.X.0) due to `feat`
- Changelog will include both commits in appropriate sections:
  - "Features" section: analytics trust distribution
  - "Bug Fixes" section: negative trust scores

**When to use multiple commits:**
- ✅ Fixes discovered while implementing a feature
- ✅ Multiple independent features/fixes in one PR
- ✅ Separating refactoring from behavioral changes
- ❌ Don't artificially split one logical change into multiple commits

**Example of a well-structured multi-commit PR:**
```bash
# Commit 1: Fix existing bug found during development
git commit -m "fix(forum): resolve thread pagination edge case"

# Commit 2: Add the planned feature
git commit -m "feat(forum): add thread pinning for moderators"

# Commit 3: Update documentation
git commit -m "docs(forum): document thread pinning feature"
```

This creates a clean changelog with fixes and features properly categorized.

## Tips for the Agent

1. **Always read recent commits** (`git log`) to match the project's style
2. **Focus on user impact** in descriptions - what changes for them?
3. **Use scopes consistently** - check existing commits for scope patterns
4. **Ask user if unsure** whether change is feat vs fix vs refactor
5. **NEVER create breaking changes** unless user explicitly requests one
6. **Use multiple commits** when you fix bugs while adding features
7. **Group related changes** - one logical change per commit when possible

## Common Mistakes to Avoid

- ❌ Using past tense: "Added feature" → ✅ "Add feature"
- ❌ Too generic: "Fix bug" → ✅ "Fix trust calculation overflow"
- ❌ Multiple unrelated changes in one commit
- ❌ Forgetting type prefix
- ❌ Creating breaking changes without user request
- ❌ Commits that don't explain user impact
- ❌ Combining feat and fix in same commit when they should be separate

Remember: Your commits become the public changelog. Write for users, not developers.

## Agent Restrictions

**CRITICAL - DO NOT:**
- ❌ Create breaking changes (`feat!`, `BREAKING CHANGE:`) unless user explicitly requests
- ❌ Use breaking change syntax for non-breaking changes
- ❌ Guess whether something is breaking - ask the user if uncertain

**ALWAYS:**
- ✅ Use separate commits for fixes and features in the same work session
- ✅ Ask user before making any breaking changes
- ✅ Default to non-breaking implementations when possible

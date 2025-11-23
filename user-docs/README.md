# Communities User Documentation

This directory contains the comprehensive user-facing documentation for Communities, built with MkDocs and the Material theme.

## Accessing the Documentation

### Via Docker Compose

The easiest way to view the documentation:

```bash
# Start the documentation service
docker compose up -d docs

# View at: http://localhost:8090
```

### Local Development

To run the documentation locally without Docker:

```bash
cd user-docs

# Install dependencies
pip install mkdocs==1.5.3 mkdocs-material==9.5.3 pymdown-extensions==10.7

# Serve documentation
mkdocs serve

# View at: http://localhost:8000
```

## Documentation Structure

The documentation is organized into several sections:

### Getting Started
- **Introduction** - What is Share App and gift economy
- **Creating Account** - Account setup and configuration
- **Joining a Community** - How to join and participate
- **Understanding Trust** - The trust-based permission system

### Core Concepts
- **Communities** - Understanding community structure
- **Trust System** - Deep dive into trust philosophy
- **Members & Roles** - Role and membership system
- **Permissions** - How the dual permission model works

### Features
Comprehensive guides for all Share App features:
- Wealth Sharing
- Councils
- Pools
- Community Forum
- Voting & Polls
- Needs System
- Value Contributions
- Skills & Endorsements
- Dispute Resolution
- Notifications

### For Community Admins
- Creating a Community
- Configuring Settings
- Managing Members
- Trust Thresholds
- Analytics & Health
- Moderation

### How-To Guides
Step-by-step tutorials for common tasks:
- Share Resources
- Request Resources
- Award Trust
- Create a Poll
- Join a Council
- Create a Pool
- Log Contributions
- Endorse Skills

### Support
- FAQ - Frequently Asked Questions
- Support - Getting help and troubleshooting

## Building for Production

To build static documentation for deployment:

```bash
cd user-docs
mkdocs build

# Output will be in user-docs/site/
```

## Documentation Updates

The documentation uses hot-reload in development mode. Simply edit files in `user-docs/docs/` and the site will automatically rebuild.

### Updating Content

1. Edit markdown files in `user-docs/docs/`
2. Changes are automatically reflected (in dev mode)
3. Commit changes to version control

### Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add the page to `mkdocs.yml` in the `nav` section
3. Build/serve to verify

## Documentation Coverage

### Implemented Features Documented
✅ Community Management
✅ Trust System
✅ Wealth Sharing
✅ Councils
✅ Pools
✅ Forum
✅ Voting & Polls
✅ Value Contributions
✅ Skills & Endorsements
✅ Notifications
✅ Dispute Resolution
✅ Needs System (partial)

### Admin Documentation
✅ Creating Communities
✅ Configuring Settings
✅ Managing Members
✅ Trust Thresholds
✅ Analytics & Health
✅ Moderation

### Guides & Support
✅ 8 How-To Guides
✅ 4 Getting Started Guides
✅ 4 Concept Deep-Dives
✅ Comprehensive FAQ
✅ Support Resources

## Technology Stack

- **MkDocs** 1.5.3 - Static site generator
- **Material for MkDocs** 9.5.3 - Modern theme
- **PyMdown Extensions** 10.7 - Enhanced markdown features

## Features

- 🌓 Dark/light mode
- 🔍 Full-text search
- 📱 Mobile-responsive
- 🎨 Material Design
- 📑 Tabbed content
- 💬 Admonitions (tip, warning, note boxes)
- 📊 Tables and lists
- 🔗 Cross-references
- 📝 Markdown formatting
- 🎯 Navigation tabs and sections

## Contributing

To contribute to the documentation:

1. Edit relevant `.md` files in `user-docs/docs/`
2. Test locally with `mkdocs serve`
3. Verify all links work
4. Check for broken cross-references
5. Commit and push changes

## Troubleshooting

### Port Already in Use

If port 8090 is already in use, edit `docker-compose.yml`:

```yaml
docs:
  ports:
    - "NEW_PORT:8000"  # Change 8090 to your preferred port
```

### Documentation Won't Build

Check the logs:

```bash
docker compose logs docs
```

Common issues:
- Missing files referenced in `mkdocs.yml` nav
- Broken cross-references
- Invalid YAML in `mkdocs.yml`

### Hot-Reload Not Working

Restart the service:

```bash
docker compose restart docs
```

## License

Same license as the main Communities project (MIT).

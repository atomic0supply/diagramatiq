# GitHub Integration Guide

## 🎯 Overview

This document explains how to set up and use GitHub integration for DiagramatIQ project management.

## 🚀 Quick Setup

### 1. Create GitHub Repository

```bash
# Create repository on GitHub (via web interface or gh CLI)
gh repo create diagramatiq --public --description "🧠 DiagramatIQ - AI-powered diagram generator"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/diagramatiq.git

# Push initial commit
git push -u origin main
```

### 2. Install GitHub CLI (if not installed)

```bash
# macOS
brew install gh

# Authenticate
gh auth login
```

### 3. Configure Issue Manager

Edit `scripts/issue-manager.sh` and set:
- `REPO_OWNER="your-github-username"`
- `REPO_NAME="diagramatiq"`

## 📋 Issue Management Workflow

### Creating Issues

#### From Command Line
```bash
# List current issues
./scripts/issue-manager.sh list

# Create new issue
./scripts/issue-manager.sh create "Add PlantUML support"

# Sync TODO.md tasks to GitHub issues
./scripts/issue-manager.sh sync
```

#### From GitHub Web Interface
1. Go to your repository
2. Click "Issues" tab
3. Click "New Issue"
4. Choose template (Bug Report, Feature Request, or Task)
5. Fill out the template

### Closing Issues

#### From Command Line
```bash
# Close issue with comment
./scripts/issue-manager.sh close 42 "Fixed in commit abc123"

# Close issue without comment
./scripts/issue-manager.sh close 42
```

#### From GitHub Web Interface
1. Go to the issue
2. Add a comment if needed
3. Click "Close issue"

### Automated Features

#### Auto-labeling
Issues are automatically labeled based on:
- **Title prefix**: `[BUG]`, `[FEATURE]`, `[TASK]`
- **Content keywords**: MVP Phase 1/2, Phase 3, priority levels
- **Priority**: Critical, High, Medium, Low

#### TODO.md Sync
When issues are closed:
- Automatically updates `TODO.md` with completed tasks
- Commits changes to repository
- Maintains project history

## 🏷️ Label System

### Type Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `task` - Development task or TODO item
- `documentation` - Improvements or additions to docs

### Priority Labels
- `priority-critical` - Blocks core functionality
- `priority-high` - Important feature broken
- `priority-medium` - Minor feature issue
- `priority-low` - Cosmetic issue

### Phase Labels
- `mvp-phase-1` - Core MVP functionality
- `mvp-phase-2` - Extended MVP features
- `phase-3` - Advanced features
- `future` - Backlog items

### Status Labels
- `needs-triage` - Needs initial review
- `in-progress` - Currently being worked on
- `blocked` - Cannot proceed due to dependencies
- `ready-for-review` - Ready for code review

## 🔄 Workflow Examples

### Example 1: Bug Report to Fix
1. User reports bug via GitHub issue template
2. Issue auto-labeled as `bug`, `needs-triage`
3. Developer triages and adds priority/phase labels
4. Developer works on fix and references issue in commits
5. Developer closes issue with fix details
6. TODO.md automatically updated

### Example 2: Feature Development
1. Create feature request issue
2. Break down into smaller tasks (sub-issues)
3. Link related issues
4. Work on implementation
5. Update TODO.md as tasks complete
6. Close main issue when feature is complete

### Example 3: TODO.md Sync
1. Add tasks to TODO.md during development
2. Run `./scripts/issue-manager.sh sync`
3. Script creates GitHub issues for pending tasks
4. Track progress in GitHub
5. Close issues as tasks complete

## 📊 Project Tracking

### Milestones
Create GitHub milestones for major phases:
- MVP Phase 1 Complete
- MVP Phase 2 Complete
- Phase 3 Complete
- v1.0 Release

### Project Boards
Use GitHub Projects to track:
- Backlog
- In Progress
- In Review
- Done

### Issue Templates
Three templates available:
- **Bug Report**: For reporting issues
- **Feature Request**: For new features
- **Task/TODO**: For development tasks

## 🛠️ Advanced Usage

### Linking Issues to Commits
```bash
# Reference issue in commit message
git commit -m "fix: resolve diagram rendering issue

Fixes #42 - Mermaid diagrams now render correctly in dark mode"

# Close issue via commit
git commit -m "feat: add PlantUML support

Closes #15 - Users can now create PlantUML diagrams"
```

### Bulk Operations
```bash
# Close multiple issues
for issue in 10 11 12; do
  ./scripts/issue-manager.sh close $issue "Completed in batch update"
done
```

### Custom Labels
Add project-specific labels:
```bash
gh label create "ai-integration" --description "Related to AI functionality" --color "purple"
gh label create "ui-ux" --description "User interface improvements" --color "blue"
gh label create "performance" --description "Performance optimization" --color "orange"
```

## 🔧 Troubleshooting

### Common Issues

#### Authentication Problems
```bash
# Re-authenticate with GitHub
gh auth logout
gh auth login
```

#### Permission Issues
```bash
# Make script executable
chmod +x scripts/issue-manager.sh
```

#### Sync Issues
```bash
# Manual TODO.md update
git add TODO.md
git commit -m "docs: manual TODO.md update"
git push
```

## 📝 Best Practices

1. **Use descriptive titles** - Make issues easy to understand
2. **Add proper labels** - Help with organization and filtering
3. **Link related issues** - Use "Related to #X" or "Depends on #Y"
4. **Update TODO.md regularly** - Keep project status current
5. **Close issues promptly** - Don't let completed work stay open
6. **Use milestones** - Track progress toward major goals
7. **Reference issues in commits** - Maintain traceability

## 🚀 Next Steps

After setting up GitHub integration:

1. Create initial issues from TODO.md
2. Set up project milestones
3. Configure project board
4. Add team members as collaborators
5. Set up branch protection rules
6. Configure automated deployments

---

**Happy issue tracking! 🎯**
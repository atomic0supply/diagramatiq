#!/bin/bash

# 🧠 DiagramatIQ - GitHub Issue Management Script
# Helps create, manage, and sync GitHub issues with local TODO.md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER=""  # Set your GitHub username
REPO_NAME="diagramatiq"
GITHUB_TOKEN=""  # Set your GitHub token or use gh CLI

echo -e "\n${BLUE}🧠 DiagramatIQ - Issue Manager${NC}\n"

# Function to check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
        echo -e "${YELLOW}Install it with: brew install gh${NC}"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}⚠️  Not authenticated with GitHub${NC}"
        echo -e "${BLUE}Run: gh auth login${NC}"
        exit 1
    fi
}

# Function to create issue from TODO item
create_issue_from_todo() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo -e "${BLUE}Creating GitHub issue...${NC}"
    
    # Create issue using gh CLI
    issue_url=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --assignee "@me")
    
    echo -e "${GREEN}✅ Issue created: $issue_url${NC}"
    
    # Extract issue number
    issue_number=$(echo "$issue_url" | grep -o '[0-9]*$')
    echo "Issue #$issue_number"
}

# Function to list open issues
list_issues() {
    echo -e "${BLUE}📋 Open Issues:${NC}"
    gh issue list --state open --limit 20
}

# Function to close issue and update TODO
close_issue() {
    local issue_number="$1"
    local comment="$2"
    
    echo -e "${BLUE}Closing issue #$issue_number...${NC}"
    
    if [ -n "$comment" ]; then
        gh issue comment "$issue_number" --body "$comment"
    fi
    
    gh issue close "$issue_number"
    
    # Update TODO.md
    update_todo_with_completed_issue "$issue_number"
    
    echo -e "${GREEN}✅ Issue #$issue_number closed and TODO.md updated${NC}"
}

# Function to update TODO.md with completed issue
update_todo_with_completed_issue() {
    local issue_number="$1"
    
    # Get issue details
    issue_title=$(gh issue view "$issue_number" --json title --jq '.title')
    
    # Create completed task entry
    completed_task="- [x] **$issue_title** - Closed issue #$issue_number ($(date +%Y-%m-%d))"
    
    # Add to TODO.md
    if grep -q "## ✅ COMPLETED - Recent Issues" TODO.md; then
        # Add after the existing section
        sed -i '' "/## ✅ COMPLETED - Recent Issues/a\\
$completed_task
" TODO.md
    else
        # Create new section at the top
        echo -e "## ✅ COMPLETED - Recent Issues\n$completed_task\n\n$(cat TODO.md)" > TODO.md
    fi
    
    echo -e "${GREEN}📝 TODO.md updated with completed issue${NC}"
}

# Function to sync TODO with GitHub issues
sync_todo_to_github() {
    echo -e "${BLUE}🔄 Syncing TODO.md with GitHub issues...${NC}"
    
    # Extract pending tasks from TODO.md
    pending_tasks=$(grep -E "^- \[ \]" TODO.md | head -10)
    
    if [ -z "$pending_tasks" ]; then
        echo -e "${YELLOW}⚠️  No pending tasks found in TODO.md${NC}"
        return
    fi
    
    echo -e "${BLUE}Found pending tasks:${NC}"
    echo "$pending_tasks"
    
    echo -e "\n${YELLOW}Do you want to create GitHub issues for these tasks? (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        while IFS= read -r task; do
            # Extract task title (remove checkbox and clean up)
            title=$(echo "$task" | sed 's/^- \[ \] \*\*//g' | sed 's/\*\*:.*//g' | sed 's/\*\*.*//g')
            
            if [ -n "$title" ]; then
                create_issue_from_todo "$title" "Synced from TODO.md\n\nOriginal task: $task" "task,needs-triage"
                sleep 1  # Rate limiting
            fi
        done <<< "$pending_tasks"
    fi
}

# Function to show help
show_help() {
    echo -e "${BLUE}DiagramatIQ Issue Manager${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  list                    List open issues"
    echo "  create <title>          Create new issue"
    echo "  close <number> [comment] Close issue with optional comment"
    echo "  sync                    Sync TODO.md tasks to GitHub issues"
    echo "  help                    Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 create \"Add PlantUML support\""
    echo "  $0 close 42 \"Fixed in commit abc123\""
    echo "  $0 sync"
}

# Main script logic
main() {
    check_gh_cli
    
    case "${1:-help}" in
        "list")
            list_issues
            ;;
        "create")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ Please provide issue title${NC}"
                exit 1
            fi
            create_issue_from_todo "$2" "Created via issue manager script" "task,needs-triage"
            ;;
        "close")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ Please provide issue number${NC}"
                exit 1
            fi
            close_issue "$2" "$3"
            ;;
        "sync")
            sync_todo_to_github
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
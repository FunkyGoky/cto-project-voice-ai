# Voice AI PM Workflow — Installation Guide

## What's in this package

This is a complete PM-to-Prototype workflow system for Claude Code, designed for a Voice AI Product Manager at Zendesk. It extends the Zevi Arnovitz CTO project workflow with PM-specific phases (discovery, prioritisation, conversation design, stakeholder communication) and Voice AI domain tooling.

**25 files total:**
- 1 `CLAUDE.md` (updated with full PM lifecycle)
- 12 slash commands (8 original + 4 new)
- 3 sub-agents (1 new Voice AI engineer + 2 from PM course)
- 2 skills with references (conversation designer + existing PRD generator)
- 5 PM frameworks (from the PM course)
- 1 step-by-step guide (`PM-WORKFLOW-GUIDE.md`)
- 1 test use case (`TEST-USE-CASE.md`)

## Installation

### Option A: Fresh project setup

```bash
# 1. Create your project directory
mkdir -p ~/Documents/Claude/voice-ai-pm-workspace
cd ~/Documents/Claude/voice-ai-pm-workspace

# 2. Unzip this package into the project root
unzip pm-workflow.zip -d .

# 3. Move files to the right locations
cp CLAUDE.md .
mkdir -p .claude/commands .claude/agents .claude/skills
cp commands/* .claude/commands/
cp agents/* .claude/agents/
cp -r skills/* .claude/skills/

# 4. Create working directories
mkdir -p ideas prds conversation-designs prototypes outputs

# 5. Start Claude Code
claude
```

### Option B: Add to existing CTO project

```bash
cd ~/Documents/Claude/cto-project

# 1. Replace CLAUDE.md with the updated version
cp CLAUDE.md .

# 2. Add new commands (keeps existing ones)
cp commands/discover.md .claude/commands/
cp commands/prioritize.md .claude/commands/
cp commands/design-conversation.md .claude/commands/
cp commands/stakeholder-update.md .claude/commands/

# 3. Add agents
mkdir -p .claude/agents
cp agents/* .claude/agents/

# 4. Add skills
mkdir -p .claude/skills
cp -r skills/* .claude/skills/

# 5. Add frameworks
cp -r frameworks/ .

# 6. Add guide and test case
cp PM-WORKFLOW-GUIDE.md .
cp TEST-USE-CASE.md .
```

## What's new vs. what changed

### New files (not in the original CTO project)
- `commands/discover.md` — Research synthesis phase
- `commands/prioritize.md` — Feature scoring and ranking
- `commands/design-conversation.md` — Voice AI dialog flow design
- `commands/stakeholder-update.md` — Stakeholder communication generator
- `agents/voice-ai-engineer.md` — Voice AI technical reviewer
- `agents/executive.md` — Strategic communication reviewer
- `agents/user-researcher.md` — User insight reviewer
- `skills/voice-conversation-designer/` — Conversation design skill
- `frameworks/` — PM thinking frameworks from the course
- `PM-WORKFLOW-GUIDE.md` — Step-by-step operating manual
- `TEST-USE-CASE.md` — End-to-end test case

### Modified files
- `CLAUDE.md` — Expanded with full PM lifecycle phases and workflow map

### Unchanged files
- All 8 original slash commands (create-issue, explore, create-plan, execute, review, peer-review, document, learning-opportunity)

## First run

Open `PM-WORKFLOW-GUIDE.md` for the full operating manual, then run the test case in `TEST-USE-CASE.md` to validate everything works end-to-end.

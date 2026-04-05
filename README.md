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
## First run

Open `PM-WORKFLOW-GUIDE.md` for the full operating manual, then run the test case in `TEST-USE-CASE.md` to validate everything works end-to-end.

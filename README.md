# Voice AI PM Workflow — Installation Guide

## What's in this package

A complete PM-to-Prototype workflow system for Claude Code, designed for a Voice AI Product Manager at Zendesk. Strategy frames everything; features flow from discovery through validation with Notion integration throughout.

**30 files total:**
- 1 `CLAUDE.md` (project context with 12-phase lifecycle)
- 14 slash commands (8 original + 6 new: strategy, discover, prioritize, design-conversation, validate, stakeholder-update)
- 3 sub-agents (voice-ai-engineer, executive, user-researcher)
- 2 skills with references (conversation designer)
- 7 PM frameworks (Rumelt, DHM, SWOT, Devil's Advocate, Socratic Questioning, Impact Estimation, Carl's PRD Template)
- 1 step-by-step guide (`PM-WORKFLOW-GUIDE.md`)
- 1 test use case (`TEST-USE-CASE.md`)
- 1 README

## Workflow Sequence

```
Phase 0:  /strategy         (periodic — sets the strategic frame)
Phase 1:  Capture            (on the go — Claude mobile → Notion)
Phase 2:  /discover          (validate problem, search Notion research)
Phase 3:  /prioritize        (score against strategic goals, requires approval)
Phase 4:  PRD skill          (specify the solution)
Phase 5:  /design-conversation (Voice AI dialog design)
Phase 6:  /explore           (understand before building)
Phase 7:  /create-plan       (implementation roadmap)
Phase 8:  /execute           (build it)
Phase 9:  /review            (quality check)
Phase 10: /validate          (test with users/stakeholders, decide ship/iterate/kill)
Phase 11: /document + /stakeholder-update (share the work)
```

## Installation

### For the existing CTO project repo

```bash
cd ~/Documents/Claude/cto-project-voice-ai

# Replace CLAUDE.md
cp [source]/CLAUDE.md ./CLAUDE.md

# Add all commands
cp [source]/commands/* .claude/commands/

# Add agents
cp [source]/agents/* .claude/agents/

# Add skills
cp -r [source]/skills/* .claude/skills/

# Add frameworks
cp -r [source]/frameworks .

# Add guides
cp [source]/PM-WORKFLOW-GUIDE.md .
cp [source]/TEST-USE-CASE.md .
cp [source]/README.md .

# Create working directories
mkdir -p strategy ideas prds conversation-designs prototypes outputs

# Push
git add -A
git commit -m "Update PM workflow with corrected sequence and validate step"
git push origin main
```

## What's new vs. what changed

### New files
- `commands/strategy.md` — Product strategy (Phase 0 — the frame)
- `commands/discover.md` — Research synthesis with Notion integration
- `commands/prioritize.md` — Feature scoring with strategic frame reference
- `commands/design-conversation.md` — Voice AI dialog flow design
- `commands/validate.md` — Prototype validation and feedback capture
- `commands/stakeholder-update.md` — Stakeholder communication generator
- `agents/voice-ai-engineer.md` — Voice AI technical reviewer
- `agents/executive.md` — Strategic communication reviewer
- `agents/user-researcher.md` — User insight reviewer
- `skills/voice-conversation-designer/` — Conversation design skill + voice design principles
- `frameworks/rumelt-strategy-kernel.md` — Strategy structure
- `frameworks/gibson-biddle-dhm.md` — Strategy evaluation (Delight, Hard-to-copy, Margin)
- `frameworks/swot-analysis.md` — Situational analysis
- `frameworks/devils-advocate-strategy.md` — Strategy pressure-testing
- `frameworks/socratic-questioning.md` — PRD sharpening
- `frameworks/impact-estimation-framework.md` — Feature impact sizing
- `frameworks/Carls-PRD-Template.md` — PRD template

### Modified files
- `CLAUDE.md` — Rebuilt with correct phase sequence (strategy as Phase 0, validate as Phase 10)

### Unchanged files
- 8 original slash commands (create-issue, explore, create-plan, execute, review, peer-review, document, learning-opportunity)

## First run

Open `PM-WORKFLOW-GUIDE.md` for the full operating manual, then run the test case in `TEST-USE-CASE.md`.

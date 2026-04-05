# PM-to-Prototype Guide

A step-by-step operating manual for going from "I have an idea" to "I have a working prototype I can demo" using the Voice AI PM × CTO workspace.

---

## How the Workflow is Structured

Strategy sits above everything else as the frame. It's not a step you run for every feature — it's a periodic activity that produces the context all other decisions flow from.

```
STRATEGY (periodic — the frame)
    ↓ guides
CAPTURE → DISCOVER → PRIORITIZE → SPECIFY → DESIGN → EXPLORE → PLAN → BUILD → REVIEW → VALIDATE → DOCUMENT
    ↑                                                                                         |
    └─────────────────────────── learnings feed back ─────────────────────────────────────────┘
```

---

## Prerequisites

Before your first run, make sure your project is set up:

```
your-project/
├── CLAUDE.md                              ← Always-on context (PM + CTO persona)
├── .claude/
│   ├── commands/
│   │   ├── strategy.md                    ← /strategy (Phase 0)
│   │   ├── discover.md                    ← /discover
│   │   ├── prioritize.md                  ← /prioritize
│   │   ├── design-conversation.md         ← /design-conversation
│   │   ├── explore.md                     ← /explore
│   │   ├── create-plan.md                 ← /create-plan
│   │   ├── execute.md                     ← /execute
│   │   ├── review.md                      ← /review
│   │   ├── validate.md                    ← /validate
│   │   ├── peer-review.md                 ← /peer-review
│   │   ├── document.md                    ← /document
│   │   ├── stakeholder-update.md          ← /stakeholder-update
│   │   ├── create-issue.md                ← /create-issue
│   │   └── learning-opportunity.md        ← /learning-opportunity
│   ├── agents/
│   │   ├── voice-ai-engineer.md
│   │   ├── executive.md
│   │   └── user-researcher.md
│   └── skills/
│       └── voice-conversation-designer/
│           ├── SKILL.md
│           └── references/
│               └── voice-design-principles.md
├── frameworks/
│   ├── rumelt-strategy-kernel.md
│   ├── gibson-biddle-dhm.md
│   ├── swot-analysis.md
│   ├── devils-advocate-strategy.md
│   ├── socratic-questioning.md
│   ├── impact-estimation-framework.md
│   └── Carls-PRD-Template.md
├── strategy/                              ← Strategy documents live here
├── ideas/                                 ← Rough notes (also captured in Notion)
├── prds/                                  ← Generated PRDs
├── conversation-designs/                  ← Dialog flow specs
├── prototypes/                            ← Built prototypes
└── outputs/                               ← Stakeholder-ready deliverables
```

---

## Phase 0: Define Strategy (Periodic)

**Command:** `/strategy`

**What it does:** Guides you through developing a product strategy using Rumelt's Strategy Kernel (Diagnosis → Guiding Policy → Coherent Actions), evaluated with Gibson-Biddle DHM and pressure-tested with Devil's Advocate. Searches your Notion research for competitive intelligence and market context.

**When to run it:** At quarterly/H-planning, when leadership asks for direction, when the competitive landscape shifts, or when your existing strategy feels stale. Not for every feature — features inherit the current strategy.

**How to use it:**
```
/strategy

Define our Voice AI strategy for H2 2026. Key question: should we go
deep on English-first with best-in-class resolution quality, or go wide
with multilingual support as a competitive wedge?
```

**Output:** A strategy document saved to `strategy/` with diagnosis, guiding policy, coherent actions, DHM assessment, critical assumptions, and explicit trade-offs.

**Frameworks used:** `frameworks/rumelt-strategy-kernel.md`, `frameworks/gibson-biddle-dhm.md`, `frameworks/swot-analysis.md`, `frameworks/devils-advocate-strategy.md`

---

## The Feature Journey: Steps 1–11

Once you have a strategic frame, individual features flow through these steps.

### Step 1: Capture the idea

Write a rough note — even 2-3 sentences — or capture it on the go via Claude mobile → Notion Note Database. Ideas land with `Type = "Idea"` and `Status = "💡 Raw"`.

**Example on mobile:**
> "Capture idea: what if the voice agent detected caller repetition and auto-surfaced help articles instead of asking them to explain again. Tag it voice and CX."

---

### Step 2: Discover — synthesise research

**Command:** `/discover`

**What it does:** Searches your Notion Note Database for relevant research (CS Briefs, AI Industry Briefs, Competitive Benchmark, Research Landscape), combines it with any manual inputs, and synthesises everything into a structured problem statement. Updates the Notion idea to `Status = "🔍 Discovered"` with evidence strength.

**How to use it:**
```
/discover

Here's what I'm exploring: [describe the idea or reference a Notion idea]
```

Claude will search Notion, pull relevant research, ask if you have additional inputs, and produce a Discovery Summary.

**When to skip:** If the problem is already well-understood and validated, jump to Step 3.

---

### Step 3: Prioritise — decide what to build

**Command:** `/prioritize`

**What it does:** Pulls all `🔍 Discovered` ideas from Notion, scores them against the current strategic goals using RICE or impact estimation. Writes RICE scores to Notion automatically. Status change to `🎯 Prioritized` requires your explicit approval.

**Key behaviour:** If a strategy document exists in `strategy/`, the scoring uses it as context — opportunities aligned with the guiding policy score higher. If no strategy exists and the decision feels directional, Claude suggests running `/strategy` first.

**When to skip:** If you only have one thing to build and it's already approved, jump to Step 4.

---

### Step 4: Write the PRD

**Skill:** `voice-ai-prd-generator` (triggers automatically when you say "write a PRD for...")

**What it does:** Runs a 4-phase workflow — gathers context from you, researches (web, competitors, internal docs, customer signals), generates the PRD using Voice AI-specific sections, then offers iteration and sub-agent review.

After the PRD is generated, run the sub-agents:
```
Run @.claude/agents/voice-ai-engineer.md, @.claude/agents/executive.md,
and @.claude/agents/user-researcher.md on this PRD.
```

Save the PRD to `prds/`.

---

### Step 5: Design the conversation (Voice AI features only)

**Command:** `/design-conversation`

**What it does:** Produces a complete conversation design — agent persona, dialog flow map, sample scripts (happy path, repair, escalation), technical specs (latency budgets, VAD settings), and success metrics.

Save to `conversation-designs/`.

**When to skip:** If the feature doesn't involve the voice agent's conversational behaviour.

---

### Step 6: Explore — understand before building

**Command:** `/explore`

**What it does:** Claude analyses the problem space, existing codebase, available APIs/SDKs, and architecture constraints. Asks clarifying questions until all ambiguities are resolved. No code is written. Updates Notion idea to `Status = "🔨 Building"`.

**Critical rule:** This is exploration, not implementation. The separation between thinking and building prevents wasted effort.

---

### Step 7: Plan — create the implementation roadmap

**Command:** `/create-plan`

**Output:** A markdown plan with TLDR, critical decisions, and modular steps with status tracking (🟩/🟨/🟥).

---

### Step 8: Build — execute the plan

**Command:** `/execute`

Implements the plan step by step, updating the tracking document as each step completes. Use **plan mode** (Shift+Tab) for complex multi-file changes.

---

### Step 9: Review — quality check

**Commands:** `/review` then `/peer-review`

Self-review checks for: leaked secrets, async issues, error handling, audio pipeline consistency, latency problems, resource cleanup, code quality, production readiness, security, and architecture. Peer-review evaluates findings from other AI models.

---

### Step 10: Validate — test and learn

**Command:** `/validate`

**What it does:** Structures a validation plan (what hypothesis are we testing, what's success, who's the audience), prepares the demo or test, then captures feedback in a structured format. Produces a clear decision: ship, iterate, or kill.

Based on the decision:
- **Ship:** Updates Notion to `✅ Shipped`. Proceed to Step 11.
- **Iterate:** Creates `/create-issue` entries. Loops back to Step 6 or 8.
- **Kill:** Updates Notion to `❌ Killed`. Learning preserved on the Notion page.
- **Need more data:** Loops back to Step 2 with new research questions.

**This is the step most workflows miss.** The point of prototyping is to learn, and validation is where that learning gets captured and fed back into the system.

---

### Step 11: Document and communicate

**Commands:** `/document` then `/stakeholder-update`

Update technical docs, then generate the right communication for the right audience (exec summary, demo script, EAP update, engineering handoff).

---

## Quick Reference: Which file does what

| File | Purpose | When to modify |
|------|---------|---------------|
| `CLAUDE.md` | Always-on context: who you are, domain, workflow | When your role, stack, or domain context changes |
| `commands/strategy.md` | Product strategy development | Rarely — this is a workflow template |
| `commands/*.md` | All other slash command prompts | Rarely — these are workflow templates |
| `agents/*.md` | Sub-agent personas for multi-perspective review | When you want to add a new reviewer perspective |
| `skills/voice-conversation-designer/` | Dialog flow and call flow design | Update `voice-design-principles.md` with Zendesk-specific guidelines |
| `frameworks/*.md` | PM thinking frameworks (Rumelt, DHM, RICE, etc.) | Add your own frameworks as you collect them |
| `strategy/` | Strategy documents produced by `/strategy` | After each strategy cycle |
| `ideas/` | Raw feature ideas and rough notes | Continuously — this is your inbox |
| `prds/` | Generated PRDs | After each PRD generation |
| `conversation-designs/` | Dialog flow specs | After each conversation design |
| `prototypes/` | Built code | After each build cycle |
| `outputs/` | Stakeholder-ready deliverables | After each communication generation |

---

## Shortcut Paths

Not every feature needs all 11 steps. Here are common shortcuts:

**Quick prototype (known problem, just need a demo):**
Step 1 → Step 6 → Step 7 → Step 8 → Step 10

**Strategy-first (leadership asks for direction):**
Phase 0 → Step 4 → Stop (strategy doc → PRD for the top initiative)

**Discovery only (validating whether a problem is worth solving):**
Step 1 → Step 2 → Step 3 → Stop

**Voice conversation design only (no code needed):**
Step 1 → Step 2 → Step 5 → Step 11

**Bug fix or improvement to existing prototype:**
`/create-issue` → Step 6 → Step 7 → Step 8 → Step 9

---

## Tips

1. **Strategy first, always.** If you don't have a current strategy document, your first `/prioritize` run will feel ungrounded. Run `/strategy` once to set the frame, then features flow from it naturally.

2. **Don't skip /explore.** The separation between thinking and building prevents you from coding yourself into a corner. Ten minutes exploring saves hours rebuilding.

3. **Don't skip /validate.** A prototype that nobody tests is a prototype that teaches nothing. Even a 5-minute demo with feedback capture is better than shipping into silence.

4. **Use sub-agents for review.** Getting the engineer, executive, and user-researcher perspectives on a PRD catches blind spots. Run all three — they take seconds.

5. **Keep CLAUDE.md updated.** As you learn more about Zendesk's internal architecture, add it. The more specific your domain context, the better Claude's recommendations.

6. **Capture ideas in flight.** When you're mid-build and think of something, use `/create-issue` immediately. Don't break your flow.

7. **Learn as you go.** When Claude uses a concept you don't fully understand, use `/learning-opportunity`. It explains at three levels of depth.

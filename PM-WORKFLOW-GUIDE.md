# PM-to-Prototype Guide

A step-by-step operating manual for going from "I have an idea" to "I have a working prototype I can demo" using the Voice AI PM × CTO workspace.

---

## Prerequisites

Before your first run, make sure your project is set up:

```
your-project/
├── CLAUDE.md                              ← Always-on context (PM + CTO persona)
├── .claude/
│   ├── commands/
│   │   ├── discover.md                    ← /discover
│   │   ├── prioritize.md                  ← /prioritize
│   │   ├── design-conversation.md         ← /design-conversation
│   │   ├── explore.md                     ← /explore
│   │   ├── create-plan.md                 ← /create-plan
│   │   ├── execute.md                     ← /execute
│   │   ├── review.md                      ← /review
│   │   ├── peer-review.md                 ← /peer-review
│   │   ├── document.md                    ← /document
│   │   ├── stakeholder-update.md          ← /stakeholder-update
│   │   ├── create-issue.md                ← /create-issue
│   │   └── learning-opportunity.md        ← /learning-opportunity
│   ├── agents/
│   │   ├── voice-ai-engineer.md           ← Technical feasibility reviewer
│   │   ├── executive.md                   ← Strategic communication reviewer
│   │   └── user-researcher.md             ← User insight reviewer
│   └── skills/
│       ├── voice-ai-prd-generator/        ← PRD generation skill
│       │   ├── SKILL.md
│       │   └── references/
│       │       ├── voice-ai-domain.md
│       │       └── prd-template.md
│       └── voice-conversation-designer/   ← Conversation design skill
│           ├── SKILL.md
│           └── references/
│               └── voice-design-principles.md
├── frameworks/                            ← PM thinking frameworks
│   ├── socratic-questioning.md
│   ├── impact-estimation-framework.md
│   ├── rumelt-strategy-kernel.md
│   ├── devils-advocate-strategy.md
│   └── Carls-PRD-Template.md
├── ideas/                                 ← Rough notes and inputs
├── prds/                                  ← Generated PRDs
├── conversation-designs/                  ← Dialog flow specs
├── prototypes/                            ← Built prototypes
└── outputs/                               ← Stakeholder-ready deliverables
```

---

## The Full Journey: 10 Steps from Idea to Demo

### Step 1: Capture the idea

**What you do:** Write a rough note — even just 2-3 sentences — describing what you want to explore. Drop it in `ideas/`.

**What to include:**
- What is the user problem?
- Who has this problem?
- Why does it matter now?

**No command needed.** This is just you thinking on paper. The messier the better at this stage — you'll sharpen it in the next step.

**Example:**
```
ideas/sentiment-routing.md

Rough idea: What if the voice agent could detect when a caller is getting
frustrated and automatically route them to a senior agent before they ask
to escalate? Current behaviour: callers have to explicitly say "let me
speak to a manager" which means we've already failed. Could sentiment
detection in real-time audio reduce escalation complaints?
```

---

### Step 2: Discover — synthesise research

**Command:** `/discover`

**What it does:** Automatically searches your Notion Note Database for relevant research (daily CS Briefs, AI Industry Briefs, Competitive Benchmarks, and Research notes published by Cowork), combines it with any manual inputs you provide, and synthesises everything into a structured problem statement with evidence assessment.

**How it works under the hood:** The `/discover` command knows your Notion Note Database structure — it searches by topic tags (`AI`, `Voice`, `CX/Support`, `Product`, `Market/Competitive`) and note type (`Research`), fetches the most relevant 3-5 notes, and cross-references them with your idea.

**How to use it:**
```
/discover

Here's what I'm exploring: [paste your idea note or describe it]

@ideas/sentiment-routing.md
```

Claude will then:
1. Search your Notion Note Database for research notes matching the topic
2. Pull relevant CS Briefs and AI Industry Briefs for recent market signals
3. Check the Voice AI Competitive Benchmark for competitor context
4. Reference the AI for CX — Research Landscape for technology feasibility
5. Ask you if you have any additional inputs (user interviews, tickets, etc.)
6. Synthesise everything into a Discovery Summary

**Output:** A Discovery Summary with problem statement, evidence strength rating, sources used (with Notion note titles and dates), key insights, competitive context from your benchmark data, technology readiness assessment citing relevant research, open questions, and a pursue/investigate/deprioritise recommendation.

**When to skip:** If the problem is already well-understood and validated (e.g., it came from leadership with clear data), jump to Step 3 or 4.

**What to modify:** If the discovery output identifies research gaps, ask Cowork to produce additional briefings or research notes on the topic before proceeding. The strength of everything downstream depends on this step.

**Key Notion references:**
- Note Database: `164d85ab-6ff6-4ad8-aa58-fa4b80812ef4`
- Data source: `collection://4bb4836a-b9ce-4d01-8e08-8c1b6f2eceff`
- Filters: `Type = "Research"` + relevant `Topics` tags

---

### Step 3: Prioritise — decide what to build

**Command:** `/prioritize`

**What it does:** Scores and ranks opportunities so you build the highest-impact thing first.

**How to use it:**
```
/prioritize

I have three potential Voice AI features to evaluate:
1. Sentiment-based call routing (from my discovery)
2. Multilingual greeting detection
3. Post-call summary auto-generation

Help me score these using RICE.
```

**Output:** A ranked table with scores, confidence levels, key risks, and an explicit recommendation including what you're saying no to.

**Which framework to use:**
- **RICE** — when you have multiple features competing for the same sprint
- **Impact Estimation (3 scenarios)** — when you need to justify a single feature to leadership
- **Strategic Fit** — when the decision is about direction, not individual features

**Frameworks file:** `frameworks/impact-estimation-framework.md` has the detailed formula and worked examples.

**When to skip:** If you only have one thing to build and it's already approved, jump to Step 4.

---

### Step 4: Write the PRD

**Skill:** `voice-ai-prd-generator` (triggers automatically when you say "write a PRD for...")

**What it does:** Runs a 4-phase workflow — gathers context from you, researches (web, competitors, internal docs, customer signals), generates the PRD using Voice AI-specific sections, then offers iteration.

**How to use it:**
```
Write a PRD for sentiment-based call routing in the Voice AI agent.
The problem: callers get frustrated before they escalate, and we only
react after explicit requests. I want proactive routing based on
real-time sentiment detection.
```

**What happens:**
1. Claude asks 2-3 clarifying questions (uses Socratic questioning from `frameworks/socratic-questioning.md`)
2. Claude researches the space (competitor approaches, technical feasibility, benchmarks)
3. Claude generates a full PRD using the Voice AI template
4. Claude offers a red-team pass and sub-agent review

**Sub-agent review (recommended):**
After the PRD is generated, ask Claude to run the three sub-agents on it:
```
Run @agents/voice-ai-engineer.md, @agents/executive.md, and
@agents/user-researcher.md on this PRD. I want technical feasibility,
strategic framing, and user insight perspectives.
```

**Output:** A complete PRD saved to `prds/`, plus multi-perspective feedback.

**What to modify:** Update `skills/voice-ai-prd-generator/references/voice-ai-domain.md` with internal Zendesk details as you learn them (real metrics, internal team names, actual architecture details).

---

### Step 5: Design the conversation (Voice AI features only)

**Command:** `/design-conversation`

**Skill:** `voice-conversation-designer` (triggers automatically for dialog design requests)

**What it does:** Produces a complete conversation design document — agent persona, dialog flow map, sample scripts (happy path + repair + escalation), technical specs (latency budgets, VAD settings, barge-in rules), and success metrics.

**How to use it:**
```
/design-conversation

Design the conversation flow for sentiment-based call routing.
Scenario: The voice agent detects rising frustration in a caller's
tone and proactively offers to connect them with a senior agent,
before the caller explicitly asks to escalate.
```

**Output:** A conversation design document saved to `conversation-designs/` with implementable dialog scripts and technical specifications.

**When to skip:** If the feature doesn't involve the voice agent's conversational behaviour (e.g., a backend analytics feature), skip this step.

**Reference file:** `skills/voice-conversation-designer/references/voice-design-principles.md` contains the design rules Claude follows.

---

### Step 6: Explore — understand before building

**Command:** `/explore`

**What it does:** Claude analyses the problem space, existing codebase, available APIs/SDKs, and architecture constraints. It asks clarifying questions until all ambiguities are resolved. No code is written.

**How to use it:**
```
/explore

I want to build a prototype of the sentiment-based call routing feature.
Here's the PRD: @prds/sentiment-routing-prd.md
Here's the conversation design: @conversation-designs/sentiment-routing.md

Explore how to build this as a working demo.
```

**What happens:** Claude reads the PRD and conversation design, maps out what APIs we'd use (OpenAI Realtime API for audio streaming, a sentiment detection model, WebSocket routing logic), identifies dependencies, and asks you clarifying questions until it's confident it understands what to build.

**Critical rule:** This is an exploration, not implementation. If Claude starts writing code, redirect it. The separation between thinking and building is what prevents wasted effort.

---

### Step 7: Plan — create the implementation roadmap

**Command:** `/create-plan`

**What it does:** Produces a markdown plan document with a TLDR, critical decisions, and modular steps with status tracking (🟩 Done / 🟨 In Progress / 🟥 To Do).

**How to use it:**
```
/create-plan
```

(Run this immediately after `/explore` — Claude has all the context from the exploration.)

**Output:** A plan document with overall progress percentage, phased steps, and clear scope boundaries.

**What to modify:** Review the plan. If anything looks wrong or over-scoped, push back now. It's cheaper to cut scope in the plan than in the code.

---

### Step 8: Build — execute the plan

**Command:** `/execute`

**What it does:** Implements the plan step by step, updating the tracking document as each step completes.

**How to use it:**
```
/execute
```

(Run this after you've approved the plan from Step 7.)

**Tips for the build:**
- Use **plan mode** (Shift+Tab) for complex multi-file changes
- Use **auto-accept mode** for straightforward implementations
- If you hit a concept you don't understand, use `/learning-opportunity` to pause and learn
- If you spot a bug or improvement idea mid-build, use `/create-issue` to capture it without losing flow

**Output:** Working code, updated plan with progress tracking.

---

### Step 9: Review — quality check

**Commands:** `/review` then `/peer-review`

**Self-review (`/review`):**
```
/review
```
Claude checks for: leaked secrets, async issues, error handling, audio pipeline consistency, latency problems, resource cleanup, code quality, production readiness, security, and architecture.

**Peer review (`/peer-review`):**
If you've run the code through another AI model (e.g., pasted it into ChatGPT or Gemini for a second opinion), feed their findings back:
```
/peer-review

Findings from ChatGPT review:
1. WebSocket connection isn't cleaned up on error
2. No rate limiting on sentiment API calls
3. Hardcoded API key on line 42
```

Claude will verify each finding against the actual code and produce a prioritised fix plan.

---

### Step 10: Document and communicate

**Commands:** `/document` then `/stakeholder-update`

**Update technical docs (`/document`):**
```
/document
```
Claude checks git diff, reads actual code, and updates CHANGELOG and relevant documentation.

**Generate stakeholder communication (`/stakeholder-update`):**
```
/stakeholder-update

I need a demo script for showing sentiment-based call routing to my
manager and the engineering lead. The demo is a 5-minute slot in our
weekly product review.
```

Claude asks about audience, channel, and purpose, then produces the right format.

---

## Quick Reference: Which file does what

| File | Purpose | When to modify |
|------|---------|---------------|
| `CLAUDE.md` | Always-on context: who you are, domain, workflow | When your role, stack, or domain context changes |
| `commands/*.md` | Slash command prompts | Rarely — these are workflow templates |
| `agents/*.md` | Sub-agent personas for multi-perspective review | When you want to add a new reviewer perspective |
| `skills/voice-ai-prd-generator/` | PRD generation with research | Update `voice-ai-domain.md` with real internal data |
| `skills/voice-conversation-designer/` | Dialog flow and call flow design | Update `voice-design-principles.md` with Zendesk-specific guidelines |
| `frameworks/*.md` | PM thinking frameworks (Socratic, RICE, Rumelt, etc.) | Add your own frameworks as you collect them |
| `ideas/` | Raw feature ideas and rough notes | Continuously — this is your inbox |
| `prds/` | Generated PRDs | After each PRD generation |
| `conversation-designs/` | Dialog flow specs | After each conversation design |
| `prototypes/` | Built code | After each build cycle |
| `outputs/` | Stakeholder-ready deliverables | After each communication generation |

---

## Shortcut Paths

Not every feature needs all 10 steps. Here are common shortcuts:

**Quick prototype (known problem, just need a demo):**
Step 1 → Step 6 → Step 7 → Step 8 → Step 10

**Strategic exploration (validating direction, not building yet):**
Step 1 → Step 2 → Step 3 → Stop (or proceed to Step 4 for a PRD)

**Voice conversation design only (no code needed):**
Step 1 → Step 2 → Step 5 → Step 10

**Bug fix or improvement to existing prototype:**
`/create-issue` → Step 6 → Step 7 → Step 8 → Step 9

---

## Tips for Getting the Most Out of This System

1. **Context is everything.** The more you feed into `/discover` (real data, real quotes, real metrics), the sharper everything downstream becomes. Garbage in, garbage out.

2. **Don't skip /explore.** The separation between thinking and building is what prevents you from coding yourself into a corner. Ten minutes exploring saves hours rebuilding.

3. **Use sub-agents for review.** Getting the engineer, executive, and user-researcher perspectives on a PRD catches blind spots you won't see yourself. Run all three — they take seconds.

4. **Keep CLAUDE.md updated.** As you learn more about Zendesk's internal architecture, add it. The more specific your domain context, the better Claude's technical recommendations.

5. **Capture ideas in flight.** When you're mid-build and think of something, use `/create-issue` immediately. Don't break your flow to explore a new thread.

6. **Learn as you go.** When Claude uses a concept you don't fully understand, use `/learning-opportunity`. It explains at three levels of depth. This is how you build technical depth as a PM.

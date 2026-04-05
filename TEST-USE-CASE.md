# Test Use Case: Sentiment-Based Proactive Escalation

An end-to-end test case to validate the PM-to-Prototype workflow. Run each step in Claude Code using the slash commands and skills. By the end, you will have a working prototype you can demo.

---

## The Feature Idea

**What if the Voice AI agent could detect caller frustration in real-time and proactively offer to connect them with a senior agent — before the caller asks to escalate?**

Today, Zendesk Voice AI agents wait for the caller to explicitly say "let me speak to a manager." By that point, the caller is already angry and the experience has failed. Proactive escalation based on sentiment could reduce complaint escalation rates, improve CSAT, and differentiate Zendesk from competitors.

---

## Pre-requisite: Check for Strategic Frame

Before running this test, check if you have a strategy document in `strategy/`. If you do, the prioritisation step will score against it. If not, this test still works — but note that in real usage you'd want to run `/strategy` first to set the frame.

---

## Step-by-Step Walkthrough

### Step 1: Capture the idea

Create the idea in your Notion Note Database via Claude mobile or Claude Code:
```
Capture idea: Voice AI agent detects caller frustration in real-time
and proactively offers to connect them with a senior agent before the
caller asks to escalate. Tag it voice, AI, and CX/Support.
```

Or create a local file:
```
ideas/proactive-sentiment-escalation.md
```

---

### Step 2: Run /discover

```
/discover

I want to explore proactive sentiment-based escalation for Voice AI agents.
Here's my rough idea: @ideas/proactive-sentiment-escalation.md
```

Claude will automatically:
1. Search your Notion Note Database for research tagged with `Voice`, `AI`, and `CX/Support`
2. Find and read the **AI for CX — Research Landscape** (section on Real-Time Sentiment & Emotion Analysis, citing Hume EVI)
3. Pull the **Voice AI Competitive Benchmark** for how Sierra AI and others handle sentiment
4. Check recent **CS Briefs** for market signals
5. Ask you for additional inputs — provide:
```
Additional context:
- Support tickets show "I've been trying to explain this for 10 minutes"
  as a recurring complaint theme
- 23% of voice calls result in human escalation
- Caller satisfaction drops 40 points when escalation happens after minute 3
```

**Expected output:** Discovery Summary with sources, evidence assessment, and recommendation.

**Checkpoint:** Notion idea updates to `🔍 Discovered` with evidence strength.

---

### Step 3: Run /prioritize

```
/prioritize

Score these three Voice AI feature candidates:

1. Proactive sentiment-based escalation (from my discovery)
2. Multilingual auto-detection and language switching
3. Post-call AI summary with next-best-action

Use RICE scoring with Voice AI-specific adjustments.
```

**Expected output:** Ranked table with RICE scores, confidence levels, and recommendation. Claude writes scores to Notion but waits for your approval before changing any idea's status to `🎯 Prioritized`.

**Checkpoint:** Approve the top-ranked idea to proceed.

---

### Step 4: Write the PRD

```
Write a PRD for proactive sentiment-based escalation in the Voice AI agent.

The feature should:
- Detect rising frustration through audio analysis (tone, pace, volume)
- Trigger a proactive offer to connect with a senior agent
- If caller accepts: warm transfer with full context
- If caller declines: adjust agent behaviour (slower pace, simpler language)
- Track containment rate impact and CSAT delta
```

After the PRD is generated, run sub-agents:
```
Run @.claude/agents/voice-ai-engineer.md, @.claude/agents/executive.md,
and @.claude/agents/user-researcher.md on this PRD.
```

Save to `prds/sentiment-escalation-prd.md`.

---

### Step 5: Design the conversation

```
/design-conversation

Design the conversation flow for proactive sentiment-based escalation.
The voice agent detects rising frustration and needs to:
1. Acknowledge the frustration naturally
2. Offer to escalate without making the caller feel judged
3. Handle acceptance (warm transfer with context)
4. Handle decline (adjust behaviour and continue)
5. Handle false positives (caller already calm)

Reference: @prds/sentiment-escalation-prd.md
```

Save to `conversation-designs/sentiment-escalation.md`.

---

### Step 6: Explore the build

```
/explore

Build a working prototype of sentiment-based proactive escalation.
Requirements:
- @prds/sentiment-escalation-prd.md
- @conversation-designs/sentiment-escalation.md

Constraints:
- Python + FastAPI prototype
- OpenAI Realtime API for voice pipeline
- Simplified sentiment detection (speech rate, keyword detection)
- Single HTML page showing live call simulation with sentiment indicator
- This is a demo, not production code
```

Answer Claude's clarifying questions until exploration is complete.

---

### Step 7: Create the plan

```
/create-plan
```

Review the plan. Push back if over-scoped. A good demo prototype should be buildable in 1-2 hours.

---

### Step 8: Build it

```
/execute
```

Tips during the build:
- Use `/learning-opportunity` if you hit a concept you don't understand
- Use `/create-issue` to capture bugs or ideas without losing flow

---

### Step 9: Review

```
/review
```

Fix CRITICAL and HIGH issues. Note MEDIUM and LOW for later.

---

### Step 10: Validate

```
/validate

I want to demo sentiment-based proactive escalation to my manager Rosana
and the engineering team. The demo is a 5-minute slot in our weekly product
review. I need to test whether:
1. The concept resonates (would this improve CX?)
2. The technical approach is feasible at Zendesk scale
3. There's appetite to invest engineering time in this
```

Claude will prepare a demo script with setup, flow, wow moment, closing, and anticipated Q&A. After the demo, run `/validate` again with the feedback:

```
/validate

Here's the feedback from the demo:
- Rosana liked the concept, asked about false positive rates
- Engineering flagged latency concerns with real-time sentiment in the pipeline
- Team agreed to a 2-week spike to test with real call data
- Decision: iterate — need to prove latency is manageable
```

**Expected output:** Structured validation results, decision captured, and next steps. If iterating, Claude creates issues and suggests looping back to Step 6.

---

### Step 11: Document and communicate

```
/stakeholder-update

Generate an exec summary of the sentiment escalation prototype results
for the broader product team. Include: what we built, what we learned
from the demo, and the decision to do a 2-week engineering spike.
```

```
/document
```

---

## Success Criteria

After running all steps, you should have:

- [ ] A strategic frame (or awareness that you need one)
- [ ] A discovery summary validated against your Notion research
- [ ] A prioritisation decision with RICE scores
- [ ] A complete PRD reviewed by three sub-agent perspectives
- [ ] A conversation design with sample dialog scripts
- [ ] A working prototype you can open in your browser
- [ ] A code review with issues triaged by severity
- [ ] Validation results with a clear decision (ship/iterate/kill)
- [ ] A stakeholder-ready communication

**Total estimated time:** 2-4 hours for the full end-to-end run.

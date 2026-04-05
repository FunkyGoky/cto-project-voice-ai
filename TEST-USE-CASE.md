# Test Use Case: Sentiment-Based Proactive Escalation

An end-to-end test case to validate the PM-to-Prototype workflow. Run each step in Claude Code using the slash commands and skills. By the end, you will have a working prototype you can demo.

---

## The Feature Idea

**What if the Voice AI agent could detect caller frustration in real-time and proactively offer to connect them with a senior agent — before the caller asks to escalate?**

Today, Zendesk Voice AI agents wait for the caller to explicitly say "let me speak to a manager" or similar. By that point, the caller is already angry and the experience has failed. Proactive escalation based on sentiment could reduce complaint escalation rates, improve CSAT, and differentiate Zendesk from competitors who all use reactive escalation.

---

## Step-by-Step Walkthrough

### Step 1: Capture the idea

Create this file in your project:

```
ideas/proactive-sentiment-escalation.md
```

Paste the feature idea above, plus any additional context you have — support ticket themes about frustrated callers, competitor examples, internal metrics on escalation rates.

---

### Step 2: Run /discover

```
/discover

I want to explore proactive sentiment-based escalation for Voice AI agents.
Here's my rough idea: @ideas/proactive-sentiment-escalation.md
```

Claude will automatically:
1. Search your Notion Note Database for research tagged with `Voice`, `AI`, and `CX/Support`
2. Find and read the **AI for CX — Research Landscape** (which has a section on "Real-Time Sentiment & Emotion Analysis" citing Hume EVI and voice emotion detection approaches)
3. Pull the **Voice AI Competitive Benchmark** for how Sierra AI, PolyAI, and others handle sentiment
4. Check recent **CS Briefs** for market signals about voice AI sentiment capabilities
5. Ask you if you have additional inputs (support tickets, user interviews, internal metrics)

When Claude asks for additional context, provide:
```
Additional context I have:
- Zendesk support tickets show "I've been trying to explain this for 10 minutes"
  as a recurring complaint theme
- Internal data: 23% of voice calls result in human escalation, average caller
  satisfaction drops 40 points when escalation happens after minute 3
```

**Expected output:** A Discovery Summary with problem statement, evidence assessment, sources used (Notion note titles with dates), key insights citing your Research Landscape findings on Hume EVI and prosody-based emotion detection, competitive context from your Benchmark, technology readiness assessment, and a recommendation.

**Checkpoint:** Does the discovery confirm this is worth building? If the recommendation is "investigate further," ask Cowork to produce a deeper research note on real-time sentiment detection before continuing.

---

### Step 3: Run /prioritize

```
/prioritize

Score these three Voice AI feature candidates:

1. Proactive sentiment-based escalation (from my discovery)
   - Affects all inbound voice calls
   - Could reduce complaint escalations by 30-50%
   - Requires real-time audio sentiment analysis in the pipeline

2. Multilingual auto-detection and language switching
   - Affects non-English callers (~15% of volume)
   - Currently callers must navigate English IVR to request another language
   - Requires STT language detection + dynamic TTS voice switching

3. Post-call AI summary with next-best-action
   - Affects all calls that reach a human agent
   - Reduces after-call work by 2-3 minutes per call
   - Requires call transcript + LLM summarisation

Use RICE scoring with Voice AI-specific adjustments.
```

**Expected output:** Ranked table with RICE scores, confidence levels, and a recommendation. Sentiment escalation should score well on impact but may have medium confidence due to novelty.

**Checkpoint:** Is sentiment escalation the top priority? If not, you can still proceed with it as a learning exercise, but note what scored higher and why.

---

### Step 4: Write the PRD

```
Write a PRD for proactive sentiment-based escalation in the Voice AI agent.

Context:
- @ideas/proactive-sentiment-escalation.md
- Discovery showed strong evidence of caller frustration before explicit escalation
- RICE score ranked this #1 on impact

The feature should:
- Detect rising frustration through audio analysis (tone, pace, volume patterns)
- Trigger a proactive offer: "I can hear this is frustrating. Would you like me
  to connect you with a senior agent who can help?"
- If caller accepts: warm transfer with full conversation context
- If caller declines: continue with adjusted agent behaviour (slower pace,
  more empathetic tone, simpler language)
- Track containment rate impact and CSAT delta
```

**Expected output:** A full PRD with problem statement, user stories, call flow, technical requirements, success metrics, risks, and rollout plan.

After the PRD is generated, run the sub-agent review:

```
Run @.claude/agents/voice-ai-engineer.md, @.claude/agents/executive.md,
and @.claude/agents/user-researcher.md on the PRD I just created.
```

**Checkpoint:** Review the three perspectives. The engineer should flag latency concerns (adding sentiment analysis to the real-time pipeline). The executive should validate the business case. The user researcher should challenge whether proactive escalation might feel patronising to some callers.

Save the PRD to `prds/sentiment-escalation-prd.md`.

---

### Step 5: Design the conversation

```
/design-conversation

Design the conversation flow for proactive sentiment-based escalation.

Scenario: During an ongoing support call, the voice agent detects that the
caller's frustration is rising (elevated pitch, faster speech, repeated
phrases, sighing). The agent needs to:
1. Acknowledge the frustration naturally (not robotically)
2. Offer to escalate without making the caller feel judged
3. Handle acceptance (warm transfer with context)
4. Handle decline (adjust behaviour and continue)
5. Handle edge cases (false positive detection, caller already calm)

Reference: @prds/sentiment-escalation-prd.md
```

**Expected output:** A conversation design document with persona definition, dialog flow map, three sample scripts (happy path escalation, decline path, false positive recovery), technical specs (sentiment model latency budget, threshold tuning), and success metrics.

Save to `conversation-designs/sentiment-escalation.md`.

---

### Step 6: Explore the build

```
/explore

I want to build a working prototype of sentiment-based proactive escalation.

Requirements:
- @prds/sentiment-escalation-prd.md
- @conversation-designs/sentiment-escalation.md

Build constraints:
- Python + FastAPI prototype
- Use OpenAI Realtime API for the voice pipeline
- Use a sentiment analysis model (can be a simple heuristic for the prototype:
  speech rate change, keyword detection for frustration markers)
- Single HTML page for the demo UI showing:
  - Live call simulation
  - Real-time sentiment indicator (green/yellow/red)
  - Transcript with sentiment annotations
  - Escalation trigger moment highlighted
- This is a demo, not production code. Latency shortcuts are acceptable.
```

**Expected output:** Claude explores the problem space, identifies APIs to use, maps the architecture, and asks clarifying questions. Answer them until Claude has no more questions.

---

### Step 7: Create the plan

```
/create-plan
```

**Expected output:** A markdown plan with TLDR, critical decisions (which sentiment model, how to simulate voice input, what the demo UI shows), and 5-8 implementation steps with status tracking.

**Checkpoint:** Review the plan. Is the scope right for a demo? Push back if it's over-engineered. A good demo prototype should be buildable in 1-2 hours.

---

### Step 8: Build it

```
/execute
```

**Expected output:** Working code. The prototype should include:
- A FastAPI backend handling WebSocket audio streaming
- Sentiment analysis logic (even if simplified for demo)
- A demo HTML page showing the live conversation, sentiment gauge, and escalation trigger
- Sample audio or text input to simulate a call

**Tips during the build:**
- If Claude proposes something complex, ask: "Is there a simpler way to demo this?"
- If you hit a concept you don't understand (e.g., WebSocket frames, PCM encoding), run `/learning-opportunity` to learn it
- If you spot a bug idea, run `/create-issue` to capture it

---

### Step 9: Review

```
/review
```

**Expected output:** A code review covering secrets, async handling, error handling, audio pipeline, latency, resource cleanup, code quality, production readiness flags, and security.

Fix any CRITICAL or HIGH issues. MEDIUM and LOW can be noted for later.

---

### Step 10: Document and communicate

```
/stakeholder-update

I need a 5-minute demo script for showing sentiment-based proactive
escalation to my manager Rosana and the engineering team. The audience
is technical and product-savvy. I want to show the prototype and get
feedback on whether to pursue this for the roadmap.
```

**Expected output:** A demo script with setup narration, step-by-step demo flow, the "wow moment" (seeing the sentiment shift and proactive escalation trigger), closing with business impact, and anticipated Q&A.

```
/document
```

**Expected output:** Updated CHANGELOG and any relevant documentation.

---

## Success Criteria for This Test

After running all 10 steps, you should have:

- [ ] A discovery summary validating the problem (`ideas/` → discovery output)
- [ ] A prioritisation decision with RICE scores
- [ ] A complete PRD reviewed by three sub-agent perspectives (`prds/`)
- [ ] A conversation design with sample dialog scripts (`conversation-designs/`)
- [ ] A working prototype you can open in your browser (`prototypes/`)
- [ ] A code review with issues triaged by severity
- [ ] A stakeholder-ready demo script (`outputs/`)

**Total estimated time:** 2-4 hours for the full end-to-end run.

---

## What to Do After

Once you've validated the workflow with this test case, use it for real features. The first few runs will feel deliberate as you learn the commands. After 3-4 features, the workflow becomes muscle memory:

- Spot a problem → `/discover`
- Decide what to build → `/prioritize`
- Design the voice experience → `/design-conversation`
- Write the spec → "Write a PRD for..."
- Build it → `/explore` → `/create-plan` → `/execute`
- Ship it → `/review` → `/document` → `/stakeholder-update`

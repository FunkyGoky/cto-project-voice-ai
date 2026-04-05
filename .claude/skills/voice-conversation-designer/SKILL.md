---
name: voice-conversation-designer
description: >
  Generates complete conversation design documents for Voice AI features,
  including dialog flows, agent persona specs, sample scripts, fallback
  logic, escalation paths, and technical specifications. Use this skill
  whenever the user wants to design a voice agent conversation, map a call
  flow, write voice agent prompts, define dialog branches, create a
  conversation spec, or plan how a voice AI agent should handle a specific
  scenario. Also trigger when the user says "design the conversation",
  "map the call flow", "write the agent script", "how should the agent
  handle X", or mentions dialog design for voice. This skill is specifically
  for voice (spoken) interactions, not text chatbots. It works hand-in-hand
  with the voice-ai-prd-generator skill — use the PRD skill for the overall
  feature requirements, and this skill for the detailed conversation design
  that specifies exactly how the agent speaks and listens.
---

# Voice Conversation Designer

A Claude Code skill that produces implementation-ready conversation design
documents for Zendesk Voice AI features. It covers persona, dialog flow,
sample scripts, repair strategies, escalation paths, and technical specs.

## When to use this skill

- Designing how a voice AI agent handles a specific customer scenario
- Mapping dialog flows for new voice features
- Writing voice agent system prompts and instructions
- Defining fallback, repair, and escalation logic for voice interactions
- Creating sample call scripts for stakeholder review or QA testing
- Specifying turn-level latency budgets and VAD settings

## When NOT to use this skill

- Text chatbot design (voice has fundamentally different constraints)
- Overall feature requirements (use voice-ai-prd-generator instead)
- Implementation/coding of the voice agent (use /explore → /create-plan → /execute)

## Workflow

### Phase 1: Understand the scenario

Before designing anything, establish:

1. **Call trigger** — What brings the caller to this agent? (inbound to support line, IVR routing, proactive outbound)
2. **Caller intent** — What is the caller trying to accomplish? Get as specific as possible.
3. **Resolution criteria** — What does success look like for the caller AND the business?
4. **Scope boundaries** — What should the agent explicitly NOT try to handle?
5. **Caller profile** — Who is the typical caller? (tech-savvy admin, frustrated end-user, first-time caller)

If the user's brief is vague, ask 2-3 targeted clarifying questions. Don't proceed with assumptions.

### Phase 2: Design the agent persona

Reference `references/voice-design-principles.md` for best practices.

Define:
- **Name/identifier** for this agent configuration
- **Tone:** Professional empathetic | Efficient friendly | Warm conversational
- **Verbosity level:** Minimal (transactional calls) | Moderate (support) | Detailed (complex troubleshooting)
- **AI disclosure:** How and when the agent identifies itself as AI
- **Brand voice alignment:** Zendesk brand guidelines compliance

### Phase 3: Map the dialog flow

Structure the conversation as a state machine with these states:

**GREETING** → **INTENT_CAPTURE** → **SLOT_FILLING** → **CONFIRMATION** → **ACTION** → **RESOLUTION** → **CLOSING**

For each state, define:
- Entry conditions (what triggers arrival at this state)
- Agent utterance (what the agent says)
- Expected caller responses (happy path + common variants)
- Exit conditions (what triggers transition to next state)
- Error/repair transitions (what happens on misrecognition, silence, or unexpected input)

Also map the parallel paths:
- **REPAIR** states (misrecognition recovery, clarification)
- **ESCALATION** path (when and how to hand off to human)
- **ABORT** path (caller hangs up, caller requests to end)

### Phase 4: Write sample scripts

Produce at least three complete dialog scripts:

**Script 1 — Happy path:** Caller states intent clearly, all slots fill cleanly, resolution delivered first try.

**Script 2 — Repair path:** Caller's intent is misrecognised on first attempt, agent uses repair strategy, conversation gets back on track.

**Script 3 — Escalation path:** Caller's issue exceeds agent capability or caller becomes frustrated, agent performs warm handoff with full context.

Format each script as:
```
[STATE: GREETING]
AGENT: "Hi, thanks for calling Zendesk support. How can I help you today?"

[STATE: INTENT_CAPTURE]
CALLER: "Yeah, I'm having trouble with my voice agent, it keeps hanging up on callers."

[STATE: ACKNOWLEDGEMENT]
AGENT: "I understand — your voice agent is disconnecting calls unexpectedly. Let me help you troubleshoot that."
...
```

### Phase 5: Technical specifications

For the voice pipeline, specify:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Target TTFR | <300ms | Standard for natural conversation feel |
| VAD silence threshold | 700ms-1200ms | Adjust based on scenario complexity |
| Barge-in enabled | Yes/No | Based on turn type |
| Max no-input retries | 3 | Before escalation |
| Max no-match retries | 2 | Before offering alternatives |
| Context window | N previous turns | Based on slot dependencies |
| STT model | [recommendation] | Based on expected vocabulary |
| TTS voice | [recommendation] | Based on persona definition |

### Phase 6: Define success metrics

- Containment rate target (% resolved without human)
- Average turns to resolution
- Caller satisfaction target (CSAT)
- Fallback/repair rate threshold
- Time to resolution target
- First-call resolution rate

## Output format

Produce a single markdown document titled `conversation-design-[scenario-name].md` with all six phases as sections. The document should be:
- Readable by a non-technical stakeholder (sample scripts tell the story)
- Implementable by an engineer (technical specs provide exact parameters)
- Testable by QA (scripts define expected behaviour for test cases)

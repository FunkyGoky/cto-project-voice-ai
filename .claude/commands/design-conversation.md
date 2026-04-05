# Voice AI Conversation Design

You are in Product Partner + CTO hybrid mode. We are designing the conversational experience for a Voice AI feature — how the agent speaks, listens, decides, and recovers.

## Your Goal

Produce a complete conversation design document that an engineer can implement and a stakeholder can understand. This covers the dialog flow, agent persona, prompt design, fallback logic, and escalation paths.

## Conversation Design Process

### Step 1 — Define the call scenario

Ask me to clarify:
- **Trigger:** What causes this call or conversation to start? (inbound customer call, outbound notification, mid-call handoff)
- **User intent:** What is the caller trying to accomplish?
- **Resolution:** What does a successful outcome look like?
- **Scope boundary:** What is explicitly out of scope for the voice agent?

### Step 2 — Design the agent persona

Define the voice agent's character for this scenario:
- **Tone:** Professional, empathetic, efficient, casual — pick the right register for the use case
- **Pacing:** How verbose or concise should responses be? (Voice is time-bound — every second counts)
- **Disclosure:** How does the agent identify itself as AI?
- **Brand alignment:** Does this match Zendesk's voice guidelines?

### Step 3 — Map the dialog flow

Create a structured call flow covering:

**Opening:**
- Greeting (keep under 5 seconds of spoken time)
- Intent capture (open-ended question vs. menu)
- Acknowledgement of intent

**Core resolution path (happy path):**
- Information gathering turns (what slots need filling?)
- Confirmation turns (echo back what was understood)
- Action execution (API calls, knowledge base lookups)
- Resolution delivery

**Repair paths:**
- Misrecognition recovery ("You mean X?")
- Ambiguity clarification (when confidence is low)
- Partial understanding (work with what you got)
- No-input timeout (progressive escalation: prompt → re-prompt → offer help → escalate)

**Escalation path:**
- When to escalate (complexity threshold, emotional escalation, explicit request)
- Context handoff (what gets passed to the human agent)
- Warm transfer vs. cold transfer
- Post-escalation wrap-up

**Closing:**
- Resolution confirmation
- Anything-else check (keep it brief)
- Sign-off

### Step 4 — Write sample dialog scripts

For each major path, write out a sample conversation as a script:

```
AGENT: [greeting]
CALLER: [intent expression]
AGENT: [acknowledgement + first question]
CALLER: [response]
...
```

Include at least:
- 1 happy path script
- 1 repair/recovery script
- 1 escalation script

### Step 5 — Define technical specifications

For each turn in the flow, specify:
- **Expected latency budget:** How long can this turn take? (target: first token under 300ms)
- **STT considerations:** Expected vocabulary, accent handling, background noise sensitivity
- **TTS voice selection:** Which voice model and voice ID?
- **Barge-in behaviour:** Can the caller interrupt? When?
- **VAD settings:** How long a silence before the agent takes the floor?
- **Context window:** What prior conversation context does this turn need?

### Step 6 — Specify metrics

Define how we measure the quality of this conversation:
- **Containment rate target:** What percentage should resolve without human escalation?
- **Average turns to resolution:** How many exchanges should the happy path take?
- **CSAT/sentiment target:** What caller satisfaction do we aim for?
- **Fallback rate:** What percentage of turns should trigger repair vs. clean resolution?
- **Time to resolution:** Total call duration target

## Output Format

Produce a markdown document with these sections:
1. Scenario overview (who, what, when, why)
2. Agent persona definition
3. Dialog flow diagram (use indented text or mermaid if appropriate)
4. Sample scripts (happy path, repair, escalation)
5. Technical specifications table
6. Success metrics
7. Edge cases and known limitations

## Behaviour Rules

- Voice is time-bound — every word costs the caller's patience. Ruthlessly cut filler.
- Design for the ear, not the eye. Read every agent line aloud and check if it sounds natural.
- Anticipate implicit answers — callers rarely answer exactly as designed.
- Always include a graceful exit. The caller must never feel trapped.
- Flag any turn where latency could break the experience.

$ARGUMENTS

# Voice Design Principles for AI Agents

Quick reference for designing natural, effective voice AI conversations. Sourced from Google's VUI design guidelines, Zendesk conversation design best practices, and industry standards.

## Core Rules

### 1. Design for the ear, not the eye
- Read every agent line aloud. If it sounds robotic, rewrite it.
- Keep individual agent turns under 10-15 seconds of spoken time.
- Avoid lists longer than 3 items — callers can't scroll back.
- Use contractions ("I'll" not "I will", "can't" not "cannot").

### 2. Respect the caller's time
- Get to the first useful question within 5 seconds of greeting.
- Never repeat information the caller already provided.
- Acknowledge what was understood before asking the next question.
- If you need to process, say so: "Let me look that up for you" — silence kills trust.

### 3. Guide the conversation, don't interrogate
- End every agent turn with a clear next step for the caller.
- Prefer open-ended questions for intent capture: "How can I help?" over "Press 1 for billing."
- Use closed questions for slot-filling: "Which account — personal or business?"
- Never stack multiple questions in one turn.

### 4. Recover gracefully
- Use "You mean X?" over "I didn't catch that."
- Give callers agency to self-repair — don't dictate how they should rephrase.
- After 2 failed recognition attempts, offer concrete options.
- After 3 failures, offer human escalation without making the caller feel like they failed.

### 5. Handle implicit answers
- Callers often answer indirectly. "It says I can't see old data" implies they reached the right screen.
- Design for what callers actually say, not what you wish they'd say.
- Train for common phrasings of the same intent.

### 6. Maintain context
- Reference earlier turns: "You mentioned billing — is this about the same invoice?"
- Never ask for information already provided.
- On escalation, pass FULL context to the human agent.

## Voice AI-Specific Considerations

### Latency
- Target TTFR (time to first response): under 300ms for natural feel.
- 500ms feels "thoughtful." 800ms+ feels broken.
- If processing takes time, use a filler: "One moment..." then stream the response.

### Barge-in
- Enable barge-in for confirmations and menus (caller already knows what they want).
- Disable barge-in for critical information delivery (account numbers, instructions).

### Turn detection (VAD)
- Silence threshold: 700ms for simple exchanges, up to 1200ms for complex questions.
- Account for "thinking pauses" — not every silence means the caller is done.

### Acknowledgements
- "Got it," "No problem," "Sure thing" — vary these to avoid sounding like a loop.
- Mirror back key information: "A refund for order 4-5-2-7, got it."

## Anti-Patterns to Avoid

- **The monologue:** Agent talks for 20+ seconds without letting caller respond.
- **The interrogation:** Rapid-fire questions with no acknowledgement between them.
- **The dead end:** Conversation reaches a state with no exit path.
- **The loop:** Agent keeps asking the same thing after failed recognition.
- **The cold transfer:** Handing off to a human without passing any context.
- **The robot tell:** "I'm sorry, I didn't understand your request. Please try again." (This screams bad AI.)
- **FAQ dump:** Copy-pasting help articles verbatim. Rewrite for conversational delivery.

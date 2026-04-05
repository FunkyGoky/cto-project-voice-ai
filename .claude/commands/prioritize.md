# Prioritisation & Opportunity Sizing

You are in Product Partner mode. We need to decide what to build next from a set of discovered opportunities.

## Your Goal

Help me score, rank, and make a defensible prioritisation decision. The output should be clear enough to present to leadership and rigorous enough to survive scrutiny.

## Check for Strategic Frame First

Before scoring, check if a strategy document exists in `strategy/`. If one exists, use its guiding policy and coherent actions as the scoring context — opportunities that align with the strategy should score higher on strategic fit.

If no strategy document exists and the prioritisation feels directional (choosing between fundamentally different areas), suggest running `/strategy` first. If it's tactical (choosing between features within a known area), proceed without one.

## Input Source — Notion Opportunity Pipeline

Before I provide a manual list, search the Note Database for all ideas with `Status = "🔍 Discovered"`:

**Data source:** `collection://4bb4836a-b9ce-4d01-8e08-8c1b6f2eceff`

Fetch each discovered idea and use their content as the input set for scoring. If I provide additional ideas manually, include those too.

## Frameworks Available

Use whichever framework fits the decision. Ask me which I prefer, or recommend one based on the situation:

### RICE Scoring
- **Reach:** How many users/customers will this affect in a given period?
- **Impact:** How much will it move the needle per user? (3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal)
- **Confidence:** How sure are we about reach and impact estimates? (100% = high, 80% = medium, 50% = low)
- **Effort:** Person-weeks of engineering, design, and PM work
- **Score:** (Reach × Impact × Confidence) / Effort

### Impact Estimation (Three Scenarios)
For each opportunity, estimate:
- **Pessimistic:** Conservative assumptions, minimal adoption
- **Realistic:** Best-guess based on available evidence
- **Optimistic:** Best case if everything goes right
- Formula: Users Affected × Current Action Rate × Expected Lift × Value per Action

### Strategic Fit Assessment
When the decision is more strategic than tactical:
- Does this strengthen our competitive moat?
- Does this serve our highest-value customer segment?
- Does this align with the strategy document's guiding policy?
- What is the cost of waiting 6 months?

## How to Run This

**Step 1 — List opportunities.** Pull discovered ideas from Notion. If I only have one, help me generate 2-3 alternatives so we're comparing, not just validating.

**Step 2 — Gather scoring inputs.** For each opportunity, ask me targeted questions to fill in the scoring variables. Use available data; flag where we're guessing.

**Step 3 — Score and rank.** Apply the chosen framework. Show the math transparently. If a strategy document exists, add a "Strategic Alignment" column.

**Step 4 — Stress-test the ranking.** Challenge the top pick:
- What assumption, if wrong, would flip the ranking?
- Are we underweighting effort or overweighting impact?
- Is there a dependency or risk not captured in the score?

**Step 5 — Produce the recommendation.**

### Prioritisation Output

| Rank | Opportunity | Score | Confidence | Strategic Fit | Key Risk |
|------|-------------|-------|------------|---------------|----------|
| 1 | [name] | [score] | [H/M/L] | [H/M/L] | [risk] |
| 2 | [name] | [score] | [H/M/L] | [H/M/L] | [risk] |
| 3 | [name] | [score] | [H/M/L] | [H/M/L] | [risk] |

**Recommendation:** [Which to pursue first and why]
**What we're saying no to (and why that's OK):** [Explicit trade-off]

## After Scoring — Update Notion (Requires My Approval)

After producing the ranked output:
1. Update ALL scored ideas with their `RICE Score` value in Notion — this is informational and can be done automatically
2. Do NOT change any idea's `Status` to `🎯 Prioritized` automatically
3. Instead, present me the ranking and ask: "Which idea should I mark as Prioritized? Or would you like to adjust the scores first?"
4. Only after I explicitly confirm which idea to prioritize, update that idea's `Status` to `🎯 Prioritized`
5. Confirm: "Marked [idea title] as Prioritized (RICE: [score]). [N] other ideas scored and remain in Discovered."

## Voice AI-Specific Scoring Adjustments

When scoring Voice AI features, also factor:
- **Containment rate impact** — will this reduce human agent escalations?
- **AHT impact** — will this reduce average handling time?
- **Latency budget** — does this add processing time to the voice pipeline?
- **Multilingual scalability** — will this work across languages or is it English-only?
- **EAP customer demand** — are current EAP customers asking for this?

## Behaviour Rules

- Make trade-offs explicit — every "yes" is a "no" to something else
- If I'm anchoring on a favourite, challenge it constructively
- Show the math so I can defend the decision upstream
- Keep the final output under 400 words, with the table as the centrepiece

$ARGUMENTS

# Templates

Use these when Capturing. Fill from the learner’s decisions and wording.

## Architecture doc — `docs/<topic>.md`

```markdown
# <Topic>

## What it is
<!-- 2–4 sentences -->

## Why it exists
<!-- Problem it solves in a canvas editor -->

## How it works here
<!-- Concrete to this repo: types, flow, example -->

## Alternatives considered
<!-- Brief; link ADR if one exists -->

## What I would do differently

## Open questions

## Trade-offs

## How Mural probably solves this

## References
```

## ADR — `docs/decisions/NNN-<slug>.md`

Number sequentially (`001`, `002`, …). Title = decision, not topic.

```markdown
# ADR NNN: <Decision title>

- **Status:** Proposed | Accepted | Superseded by ADR NNN
- **Date:** YYYY-MM-DD
- **Topic:** <e.g. Document model>

## Context
<!-- What forced a choice -->

## Options
1. **Option A** — pros / cons
2. **Option B** — pros / cons
3. **Option C** (optional)

## Decision
<!-- What we chose -->

## Why
<!-- Learner’s reasoning; keep honest and short -->

## Consequences
<!-- What becomes easier / harder; follow-ups -->
```

## Engineering note — `docs/engineering-notes/YYYY-MM-DD-<slug>.md`

Short diary entry. Not an article.

```markdown
# YYYY-MM-DD — <One-line insight>

<!-- 3–8 sentences: what you tried, what clicked, what surprised you -->

**Interview one-liner:** <!-- How you’d say this in 20 seconds -->
```

## Roadmap row

In `docs/roadmap.md`, keep status as one of: `todo` | `teaching` | `building` | `done` | `doc-only`.

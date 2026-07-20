# Goal

Build a small **Interactive Canvas Engine** to learn — and demonstrate — the engineering behind tools like Mural, not to clone the product.

This project exists as interview preparation for [Senior Software Engineer, Canvas Core @ Mural](https://jobs.ashbyhq.com/mural/a88e5ba1-8a57-4096-ae84-294cc78d96d5). The win is a clear story:

> I wanted to understand how collaborative canvas editors work internally, so I built a motor from scratch and documented every architectural decision.

## What success looks like

By the end of the build week, the repo should feel like an engineering project, not a portfolio demo:

- Working core: document model, scene graph, renderer, camera, hit testing
- Optional stretch: spatial index (QuadTree)
- Collaboration: documented deeply (OT / CRDT / presence), not fully implemented
- Every major choice captured as docs + ADRs + short engineering notes

Interview signal: judgment, trade-offs, and how you think — not feature count.

## Scope (build vs document)

| Area | Build | Document |
|------|-------|----------|
| Document model (nodes, CRUD, JSON) | Yes | Yes |
| Scene graph (hierarchy, transforms) | Yes | Yes |
| Renderer (Canvas draw loop) | Yes | Yes |
| Camera (pan, zoom, viewport) | Yes | Yes |
| Hit testing / selection | Yes | Yes |
| QuadTree | Stretch | Yes |
| Real-time collaboration / CRDT | No | Yes — design for future integration |

## How we show the learning

1. **Architecture docs** — short (≤2 pages), one topic each
2. **ADRs** — alternatives considered, decision, why
3. **Engineering notes** — brief dated learning entries (not articles)
4. **Fixed closing sections** on each doc:
   - What I would do differently
   - Open questions
   - Trade-offs
   - How Mural probably solves this
   - References

## Alignment with Canvas Core

The role owns infinite canvas, document editing, spatial interaction, rendering performance, real-time collaboration, and platform APIs. This engine practices the same fundamentals at a smaller scale: rich object models, hierarchical scenes, spatial querying, selection, performance-minded interaction paths, and collaboration design without pretending to ship CRDTs.

## Non-goals

- Building Mural, Figma, or Excalidraw
- Shipping production collaboration
- Hiding the interview-prep origin — the README should state it openly

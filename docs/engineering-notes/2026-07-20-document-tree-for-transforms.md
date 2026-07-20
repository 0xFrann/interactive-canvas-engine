# 2026-07-20 — Tree for transforms, not because it looks like the DOM

Locked ADR 001: the document is a tree so **frame → children** makes group transforms cheap and correct. Rejected the shallow Why (“I’ve seen trees in the DOM / Peacevoid windows”). Peacevoid OS was DOM-first for an interactive shell; Mural’s article shows DOM-as-paint failing at thousands of elements — useful context for **presentation vs structure**, not the reason for the data shape. Revisit paths written down: O(1) id map, flat-as-canonical if patches win, **tree + edge list** for connectors (don’t throw away the tree). First slice shipped: `@canvas-engine/document` with CRUD + JSON round-trip of a frame and two stickies.

**Interview one-liner:** We store the board as a tree because containment and inherited transforms are first-class; lookup indexes and connector edges are add-ons when those ops dominate — not a reason to abandon hierarchy.

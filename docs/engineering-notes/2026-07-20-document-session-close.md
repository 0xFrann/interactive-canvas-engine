# 2026-07-20 — Tree + Map share one object; session closed with TBDs

Built `DocumentModel` from discovery: document-as-root, nested `children` Maps, flat `nodeReferences` for O(1) get, `activeNode` as a live reference. Learned that a Map index must hold the **same** object as the tree — a spread `{...node}` created a silent twin; `toEqual` passed, `toBe` would not. Recursion for get-by-id isn’t required once the phone book exists; path/merkle ideas were parked. Teaching process mattered as much as code: no solo-ship, no API recipes before aha.

**TBDs left explicitly:** subtree delete + index cleanup, JSON round-trip, richer CRUD, then scene graph.

**Interview one-liner:** I keep a containment tree and a Map of id→node pointing at the same objects — hierarchy for transforms, hash lookup for identity.

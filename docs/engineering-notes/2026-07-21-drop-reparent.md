# 2026-07-21 — Drop reparent: cursor adopts, cursor leaving parent detaches

On drag end, `resolveDropParent` either adopts the node under the cursor (if it isn’t the current parent) or, if the **cursor** left the current parent box, reparents to root. `reparentNode` still rewrites locals to keep world still. Ignored subtree on hit-test avoids parenting under yourself.

**Interview one-liner:** Drop targeting is a hit-test policy on top of preserve-world reparent — separate “move” from “change container,” and use the pointer for leave/adopt, not the node’s center.

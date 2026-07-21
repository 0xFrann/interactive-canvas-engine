# Subtree delete keeps tree + index honest

- **Date:** 2026-07-21
- **Topic:** Document model

## Context

`deleteNode` used to unlink one node and drop only that id from `nodeReferences`. Descendants stayed in the index as ghosts.

## What I learned

Deleting a frame must clear the whole subtree from the flat index, not only the selected node. A recursive walk over `children`, deleting each id from `nodeReferences`, then unlinking the deleted root from its parent, keeps both structures consistent. We only mutate the index during the walk (not the `children` Map being iterated), so a plain `for…of` over `values()` is enough — no need to copy the entries first.

## How I'd explain it in an interview

"Our document is a tree plus an id map that holds the same object refs. On delete we post-order clear the map for the subtree, then splice the node out of the parent's children — otherwise lookup by id would return objects that are no longer on the board."

# 2026-07-21 — Engine owns identity

Callers should not invent `"1"` / `"2"`. `addNode` now takes only local `{ x, y }`; the document assigns a UUID and sets `parentId` from `activeNode`. That removes the old “parentId must match active” footgun at the API boundary. Load still uses ids from the flat file as-is.

**Interview one-liner:** Identity is a document concern — generate stable unique ids on create; serialize them; don’t make the UI invent keys.

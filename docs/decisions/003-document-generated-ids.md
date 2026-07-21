# ADR 003: Document generates node ids (UUID)

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Document model

## Context

Callers were inventing string ids (`"1"`, `"2"`). That invites collisions, clashes with reserved `"root"`, and forces every UI path to own identity. After load, a simple incrementing counter must also avoid colliding with ids already on disk.

## Options

1. **Caller-provided ids** — flexible; easy collisions and `"root"` mistakes  
2. **Monotonic counter on the document** — readable in tests; must persist or resync after load  
3. **UUID (`crypto.randomUUID`)** — opaque; no counter state; effectively unique across load + add  

## Decision

`addNode({ x, y })` — document assigns `id` via `crypto.randomUUID()` and sets `parentId` from `activeNode`. Load still trusts ids from the file.

## Why

Stop inventing ids at the call site. UUID avoids a serialized counter and does not collide with restored boards. Parent is the insert cursor, so callers no longer pass `parentId` either.

## Consequences

- Tests assert returned ids / parent links, not hardcoded `"1"`.  
- Reparent remains separate (still TBD).  
- Collab later may want client-prefixed ids; UUID remains a fine local default.

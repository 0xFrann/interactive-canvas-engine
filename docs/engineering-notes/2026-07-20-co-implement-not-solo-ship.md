# 2026-07-20 — Coach must not solo-ship the implementation

Called out a real failure mode: after locking ADR 001, “Ready!” led to a full `@canvas-engine/document` implementation in one pass — decisions learned, **algorithms not**. Learning goal is both technical judgment *and* writing the logic (tree walk, reparent/remove, JSON clone). Coach skill + project rule updated: co-implement one behavior at a time; scaffold/tests OK; no pasting a finished package. Code reset to TODOs so the learner owns `findById` → CRUD → JSON.

**Interview one-liner:** I’d rather walk an interviewer through a recursive `findById` I wrote than recite that we “chose a tree.”

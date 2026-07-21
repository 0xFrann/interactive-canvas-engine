# Interactive Canvas Engine

Interview prep for [Mural Canvas Core](https://jobs.ashbyhq.com/mural/a88e5ba1-8a57-4096-ae84-294cc78d96d5): a small canvas motor with documented decisions — not a product clone.

North star: [`docs/goal.md`](./docs/goal.md) · Roadmap: [`docs/roadmap.md`](./docs/roadmap.md)

## Packages

| Package | Role |
|---------|------|
| `@canvas-engine/document` | Tree + locals + maintained world |
| `@canvas-engine/scene-graph` | Render-facing spatial reads |
| `@canvas-engine/renderer` | Canvas 2D paint (temp hardcoded node size) |
| `@canvas-engine/demo` | Runnable board UI |

## Demo

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (default http://localhost:5173). Click stickies to select; add under active / nudge to see nested world updates without rewriting child locals.

## Scripts

- `pnpm test` — unit tests
- `pnpm typecheck` — TypeScript across packages + demo
- `pnpm lint` / `pnpm format`

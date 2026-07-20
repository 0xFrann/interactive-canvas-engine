Me parece una idea excelente.

Y hay algo que creo que puede marcar una diferencia enorme: no documentar el resultado, sino el aprendizaje.

Los ingenieros de empresas como Mural, Figma o Linear suelen escribir RFCs, design docs y ADRs (Architecture Decision Records). Si tu repositorio transmite esa forma de pensar, no solo muestra código; muestra cómo razonás.

Yo incluso haría que el repositorio se sintiera como un proyecto de ingeniería, no como un portfolio.

⸻

Objetivo de la semana

No construir Mural.

Construir un Interactive Canvas Engine que demuestre que entendiste las decisiones fundamentales.

Al final de la semana deberías poder decir:

“Quise entender cómo funcionan internamente herramientas como Mural, así que construí un motor desde cero documentando cada decisión arquitectónica.”

Eso es una historia muy fuerte en una entrevista.

⸻

Estructura del repo

canvas-engine/
├── apps/
│   └── demo
│
├── packages/
│   ├── document
│   ├── renderer
│   ├── camera
│   ├── history
│   └── spatial
│
├── docs/
│
│   architecture.md
│   scene-graph.md
│   rendering.md
│   hit-testing.md
│   quadtree.md
│   undo-redo.md
│   collaboration.md
│
├── decisions/
│
│   001-document-model.md
│   002-renderer.md
│   003-hit-testing.md
│
└── README.md

⸻

README

No quiero un README típico.

Quiero algo parecido a esto:

Canvas Engine
Learning project inspired by
Mural
Figma
Excalidraw
Goals
✅ Scene Graph
✅ Rendering Engine
✅ Camera
✅ Hit Testing
⬜ QuadTree
⬜ Collaboration
⬜ CRDT

Y abajo:

Architecture
↓
(link)
↓
Scene Graph
↓
(link)
↓
Rendering
↓
(link)

Cada feature lleva directamente al documento que explica por qué existe.

⸻

Plan de 7 días

Día 1 — Document Model

Código

Implementar

Document
Node
Rectangle
Text
Sticky

CRUD completo.

Guardar JSON.

Cargar JSON.

⸻

Documento

docs/document-model.md

Explicar:

* ¿Qué es un Document Model?
* ¿Por qué separar datos de UI?
* ¿Por qué IDs?
* ¿Por qué un árbol?

No más de dos páginas.

⸻

ADR

001
Why a tree?
Alternativas
Flat list
Graph
Tree
Decisión
Tree

⸻

Día 2 — Scene Graph

Código

Grupos.

Transformaciones.

Jerarquía.

⸻

Documento

scene-graph.md

Explicar:

Local coordinates

World coordinates

Traversal

Transform propagation

⸻

ADR

Scene Graph
vs
Flat Scene

⸻

Día 3 — Renderer

Canvas.

Primitives.

Draw Loop.

⸻

Documento

rendering.md

Explicar

DOM

Canvas

SVG

WebGL

¿Por qué Canvas?

¿Por qué separar Renderer?

⸻

ADR

Renderer independiente

⸻

Día 4 — Camera

Pan.

Zoom.

Viewport.

⸻

Documento

camera.md

Explicar

Viewport

World

Camera

Transform Matrix

⸻

Día 5 — Hit Testing

Click.

Selection.

Bounding Box.

⸻

Documento

hit-testing.md

Explicar

¿Cómo sabe el editor qué tocaste?

¿Por qué recorrer de atrás hacia adelante?

¿Qué pasa con las rotaciones?

⸻

Día 6 — QuadTree

Implementación sencilla.

⸻

Documento

quadtree.md

Explicar

Complejidad

O(n)

vs

O(log n)

No hace falta matemática pesada.

⸻

Día 7 — Collaboration

No implementaría CRDT.

Haría un documento excelente.

collaboration.md

Explicar

Problema

OT

CRDT

Yjs

Automerge

Conflictos

Presence

Optimistic Updates

Y al final:

“Esta arquitectura fue diseñada para poder integrar un CRDT en el futuro.”

Eso demuestra visión sin prometer algo que todavía no existe.

⸻

Una idea que me parece brillante

Agregaría una sección llamada:

docs/engineering-notes/

Con entradas breves, casi como un diario técnico.

Por ejemplo:

2026-07-20
Hoy entendí por qué
Figma no renderiza componentes React.

⸻

2026-07-21
Aprendí que un Scene Graph
no pertenece al renderer.

⸻

2026-07-22
Intenté hacer hit testing
recorriendo todos los nodos.
Fue demasiado lento.

No son artículos.

Son notas de aprendizaje.

A un entrevistador le muestran evolución intelectual.

⸻

Y haría algo más

Al final de cada documento agregaría una sección fija:

## What I would do differently
## Open questions
## Trade-offs
## How Mural probably solves this
## References

Esa estructura obliga a pensar como un ingeniero de producto: no solo “cómo funciona”, sino “qué alternativas había y por qué elegí esta”.

Un último consejo que creo que puede multiplicar el valor del proyecto

No intentes esconder que nació como preparación para una entrevista. Al contrario.

En el README escribiría algo como:

“Este proyecto nació mientras me preparaba para entrevistas en empresas que construyen herramientas colaborativas como Mural. Mi objetivo no fue clonar un producto, sino entender los principios de ingeniería detrás de los editores modernos: document models, scene graphs, render pipelines, hit testing y colaboración en tiempo real.”

Esa motivación hace que el proyecto tenga una narrativa clara. Y, por experiencia, los proyectos con una buena narrativa suelen generar conversaciones mucho más interesantes en una entrevista que los que solo acumulan funcionalidades.
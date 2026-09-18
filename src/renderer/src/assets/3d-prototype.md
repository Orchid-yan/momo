# 3D Momo visual prototype

This folder keeps the **2D PNG** (`momo-idle.png`) as the comparison art.

The 3D pet is an **original stylized mesh** built at runtime in `src/renderer/src/pet/MomoCat3D.tsx` (spheres / capsules, apricot + cream, Three.js sheen). It is **not** a downloaded GLB.

## Why not a GLB?

No small **sitting fluffy ginger kitten** with a clear **CC0 / redistributable** license was available that matched Momo’s silhouette. Low-poly public-domain cats are toy-blocky; photoreal cats are typically not free to re-ship. A coherent stylized procedural cat is the asset that actually ships.

## License

- 3D kitten geometry & materials: original to this repo (MIT, same as the app).
- 2D PNG: existing Momo idle art in this repository.
- Libraries: Three.js + React Three Fiber (MIT).

## Known limits

- Not photoreal, not strand-level fur.
- Sheen + round blobs approximate a soft coat.
- This is a look-and-feel spike: accept or reject after running it on a real desktop.

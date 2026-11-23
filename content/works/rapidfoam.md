---
title: RapidFOAM
subtitle: An OpenFOAM automation suite and browser Web Studio that turns a raw STL and a short JSON config into a runnable external-aerodynamics case — with geometry-derived meshing, y+-sized boundary layers, live force telemetry, and remote HPC submission.
short_description: OpenFOAM external-aerodynamics automation and Web Studio built for Rapidamente Formula Student — from STL to HPC solve with live aero telemetry.
date: 2026-10
category: technical
card_tag: CFD Platform · OpenFOAM & Python
header_tag: CFD Scientific Computing · OpenFOAM Automation & Tooling
icon: 🌊
thumbnail: /images/rapidfoam-studio-card.webp
banner: /images/rapidfoam-studio.webp
meta_items:
  - label: Role / Type
    value: Lead Developer & Maintainer
    link: ''
  - label: Timeline / Context
    value: Rapidamente Formula Student, Chulalongkorn University (2026)
    link: ''
  - label: Core Skills & Tools
    value: Python (stdlib), FastAPI, Three.js, OpenFOAM, SLURM/MPI
    link: ''
  - label: GitHub Repo
    value: Visit Repo ↗
    link: https://github.com/tadtapongc/RapidFOAM
---

<!-- Pillar 1: Background & Objective -->

### 1. The Challenge & Engineering Objectives

OpenFOAM is one of the most capable open-source CFD solvers available, but its power comes with a setup surface that is hostile to iteration. An external-aerodynamics case is not one file: it is a web of interdependent dictionaries—<code>blockMeshDict</code>, <code>snappyHexMeshDict</code>, <code>fvSchemes</code>, <code>fvSolution</code>, <code>decomposeParDict</code>—plus boundary-condition fields for every patch. Each new CAD export can invalidate the domain size, wake refinement, surface refinement, boundary-layer stack, and parallel decomposition at once.

For a Formula Student team, that cost is paid on every front-wing, rear-wing, sidepod, or undertray revision. The bottleneck is rarely the solver; it is the hours of manual editing between a geometry change and a trustworthy result—and the silent failure modes that come with it: non-orthogonal cells, negative-volume cells, boundary layers that <code>snappyHexMesh</code> quietly refuses to extrude, and solvers that diverge after hours of walltime.

I built <strong>RapidFOAM</strong> to remove that layer of manual work without hiding the physics. The objectives were deliberately strict:

- <strong>One declarative configuration.</strong> A JSON file plus an ASCII STL should fully define a case.
- <strong>Physics-aware defaults, not magic.</strong> Domain padding, wake refinement, y+ targets, and numerics should follow the geometry and flow conditions.
- <strong>Honest diagnostics.</strong> If a mesh misses its near-wall target or a boundary-layer stack is incomplete, the tool should say so instead of silently degrading.
- <strong>Two ways to work.</strong> A headless CLI for batch work and HPC, and a browser Studio for visual setup and live monitoring.
- <strong>No lock-in.</strong> Output is native OpenFOAM, runnable with standard tools and inspectable in ParaView.

<!-- Pillar 2: Approach, Methodology & Execution -->

### 2. System Architecture & Core Engineering Decisions

RapidFOAM is organised as bounded contexts—<code>core</code>, <code>geometry</code>, <code>meshing</code>, <code>casegen</code>, <code>runtime</code>, <code>postproc</code>, and <code>web</code>—with a single-direction dependency graph and an AST-based architecture test that fails if a layer imports upward. The core generator has <strong>zero runtime dependencies</strong> beyond the Python standard library; FastAPI, Uvicorn, Paramiko, and Matplotlib are optional extras for the Studio and plotting.

- <strong>One-pass geometry analysis, geometry-derived meshing.</strong> A streaming ASCII STL parser computes the exact bounding box, the edge-length distribution, and the dihedral-angle distribution in a single pass, with memory independent of facet count. From those bounds and statistics the generator derives the virtual wind-tunnel domain (fidelity-scaled padding along the flow, ground, and lateral axes), two-stage wake refinement (<code>nearWakeBox</code> for the diffuser and wing vortices, <code>farWakeBox</code> for downstream transport), distance-based refinement shells, and—when enabled—per-surface refinement from each part's own feature size. Fidelity presets (<code>fast</code>, <code>standard</code>, <code>fine</code>) scale the base cell from the model length rather than hard-coding metre values.

- <strong>A single, inspectable mesh contract.</strong> All derivation runs on a private copy and returns an immutable <code>MeshPlan</code>. The CLI dry-run, the Studio preview, and the dictionary writers all consume that same plan, so the preview and the generated case cannot drift. When automatic grading or auto-sizing is enabled, its cell-count and quality cost is reported before anything is written.

- <strong>Boundary layers sized from y+, with provenance.</strong> Rather than asking for a first-layer thickness, the config specifies a near-wall y+ target. RapidFOAM estimates the flat-plate friction velocity for the flow conditions, converts the target into an absolute first-cell height, and writes the stack with <code>relativeSizes false</code>. Because <code>snappyHexMesh</code> caps a layer at a fraction of the local face, the result can be clamped; when it is, the pipeline reports the realised y+ and the surface level responsible instead of pretending the target was met. An optional fit mode raises the face-thickness ratio to reach the target, and two-pass layering—castellate and snap first, then add layers with a bounded relaxed quality gate—avoids snappy's undo iterations stripping prisms from complex geometry.

- <strong>Conservative numerics and automated run control.</strong> Cases are initialised with <code>potentialFoam</code>, then solved with SIMPLEC (<code>consistent true</code>), bounded <code>limitedLinear 1</code> momentum, upwind turbulence, two non-orthogonal correctors, and k-ω SST with Spalding wall functions. A background monitor watches the force history: it stops cleanly once drag and downforce vary within ±0.5% over a 200-iteration window, and independently stops a diverging run when a force exceeds 50× its trailing median—preserving the last good state instead of losing it to a floating-point exception. The same monitor kernel is used by the local CLI and the script shipped to the cluster.

- <strong>Diagnostics as a first-class output.</strong> RapidFOAM parses <code>checkMesh</code> and snappyHexMesh's per-patch layer table, then reports non-orthogonality, skewness, aspect ratio, concave cells, boundary-layer count and thickness coverage, and first-layer coverage—the fraction of wetted faces that carry any prism layer, which is what actually predicts the y+ tail. It cross-checks the realised <code>yPlus</code> field against the sizing target, reports surface integrity from <code>surfaceCheck</code>, and can write <code>wallShearStress</code>, the <code>yPlus</code> field, the max-y+ location via <code>fieldMinMax</code>, and an optional vorticity field. Multi-part cases also emit per-component force outputs, so drag and downforce can be read as a build-up rather than a single number.

- <strong>Web Studio and HPC orchestration.</strong> The Studio is a FastAPI backend with a vanilla-JS, Three.js, and Chart.js front end: STL upload, a live 3D domain wireframe, a five-section case editor, a four-tab workspace, 5-second telemetry polling, symmetry-projected coefficients, aero balance and centre-of-pressure, component history, solver health, and mesh and surface panels. The same UI connects over SSH, uploads a case, submits it with <code>sbatch</code>, polls <code>squeue</code>, cancels gracefully (stop the solver, then <code>scancel</code>), and downloads results as a streamed tar extracted into a staging directory and published with an atomic rename—so an interrupted transfer never leaves a half-written case.

- <strong>An engineering baseline, not a demo.</strong> The repository carries 491 Python tests and 89 JSDOM front-end tests, including golden snapshots of the generated OpenFOAM dictionaries, an architecture-boundary test, and regression coverage for the CLI and HTTP API. CI runs on Ubuntu and Windows across Python 3.9–3.14 with Ruff and a coverage gate, plus a separate Node front-end job. The project reached v1.7.1 over 274 commits and nine tagged releases.

<!-- Highlight Card / Insight -->

> #### Key Engineering Takeaway
> "Automating CFD is not a dictionary-writing problem. The hard part is encoding geometry-dependent physics and the failure modes that follow it—then making every assumption visible: what y+ was actually achieved, how much of the surface is layered, why a mesh verdict failed, and which configuration produced the run. A generated case is only useful when an engineer can trust it, inspect it, and reproduce it on a cluster."

<!-- Pillar 3: Results, Impact & Takeaways -->

### 3. Results, Validation & Practical Impact

RapidFOAM is the aero automation suite developed for <strong>Rapidamente Formula Student</strong> at Chulalongkorn University, and has been used for component and full-car half-model studies on multi-million-cell meshes. The practical change is structural: a geometry revision becomes a config change and a single generation command, and the resulting case is reproducible from the configuration snapshot stored beside it.

The engineering claims are backed by measurement rather than assertion:

- <strong>A 24-case aero map (~10M cells per case)</strong> exposed a real meshing defect: the original two-pass layering gate admitted meshes pinned at ~80° non-orthogonality and a "Bad" verdict on every case. Replacing it with a bounded relaxation of the main gate kept the final mesh in the practical good and usable bands while preserving as much layer coverage as quality allowed.
- <strong>A nine-run, same-geometry layer campaign</strong> tested each candidate lever in isolation. Reducing the standard expansion ratio from 1.15 to 1.1 raised full-stack layer coverage from 44% to 50% at unchanged quality (skewness 4.94, non-orthogonality 65, realised y+ 32 on the body and 404 on the wheels). That coverage threshold removes a measured 2–4% downforce bias; the residual mesh-to-mesh scatter at standard fidelity is ~1.3%.
- <strong>The diagnostics have their own verification.</strong> A grid-independence workflow compares the <code>fast</code>, <code>standard</code>, and <code>fine</code> meshes, reports the discretisation deltas and a Richardson-style extrapolation, and flags whether the forces are mesh-converged. The test suite pins the generated dictionaries and API behaviour, so a change that silently alters a case fails before it reaches a cluster.

The system is not a black box or a replacement for CFD judgement. The flat-plate friction-velocity estimate is typically 30–40% away from the local value on a real car, which is exactly why the realised y+ is measured after the solve and reported next to the target. Geometry still has to be watertight; defaults still have to be validated per case. RapidFOAM makes those limits visible, then gets out of the way: native OpenFOAM dictionaries, standard <code>Allrun</code> scripts, a <code>test.foam</code> marker for ParaView, and no proprietary wrapper around the solver.

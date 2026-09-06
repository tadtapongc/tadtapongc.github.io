---
title: OpenFOAM Case Generator
subtitle: A production-ready Python automation pipeline and CLI for external aerodynamics CFD, generating watertight OpenFOAM cases, conformal multi-region meshes, and real-time telemetry from raw STL geometries.
short_description: Zero-dependency Python CFD pipeline for automated meshing, solving, and live force monitoring of OpenFOAM cases.
date: 2026-05
category: technical
card_tag: CFD Tool · OpenFOAM
header_tag: CFD Scientific Computing · OpenFOAM & Python
icon: 🌊
thumbnail: /images/openfoam.webp
banner: /images/openfoam.webp
meta_items:
  - label: Role / Type
    value: Lead Developer & CFD Pipeline Architect
    link: ''
  - label: Timeline / Context
    value: Formula Student (TSAE) & Open Source (2026)
    link: ''
  - label: Core Skills & Tools
    value: Python (Stdlib), OpenFOAM, snappyHexMesh, HPC (SLURM/MPI)
    link: ''
  - label: GitHub Repo
    value: Visit Repo ↗
    link: https://github.com/tadtapongc/OpenFOAM-CaseGenerator
---

<!-- Pillar 1: Background & Objective -->

### 1. The Challenge & Engineering Objectives

OpenFOAM is one of the most capable open-source CFD solvers in computational fluid dynamics, but setting up external aerodynamics simulations requires manually configuring dozens of complex, interdependent C++ dictionary files—including <code>blockMeshDict</code>, <code>snappyHexMeshDict</code>, <code>fvSchemes</code>, <code>fvSolution</code>, <code>decomposeParDict</code>, and individual boundary condition vector fields. For Formula Student (FSAE) race teams rapidly iterating through front wings, rear wings, sidepods, and undertrays, this manual workflow creates a severe engineering bottleneck prone to human error, mesh non-orthogonality, and divergence.

To eliminate this friction, I developed <strong>OpenFOAM Case Generator</strong>—a standalone, zero-dependency Python engineering pipeline that automates the entire external aerodynamics workflow from raw ASCII STL geometry to converged force post-processing using standard OpenFOAM commands.

<!-- Pillar 2: Approach, Methodology & Execution -->

### 2. Technical Architecture & Core Innovations

The pipeline is architected around a declarative JSON specification (<code>configs/config.json</code>) and built exclusively with the Python standard library, requiring no external package installations for core case generation or force extraction:

- <strong>Zero-Dependency Core & Streaming STL Ingestion:</strong> Implemented a memory-efficient streaming ASCII STL parser that calculates exact 3D bounding boxes, vertex extents, and sanitizes solid headers line-by-line without loading millions of facets into memory.
- <strong>Automated Domain & Boundary Physics:</strong> Computes virtual wind tunnel bounds dynamically derived from geometry extents (4L upstream, 8L downstream, 4H ceiling, 4W lateral far-wall). Supports ground-plane snapping, relative ride-height clearances (e.g., 35 mm front wing ground clearance), offset symmetry planes (e.g., x = -0.1185) with automatic domain and wake-box clipping, and moving road boundary conditions (U = U<sub>∞</sub>) coupled with continuous Spalding wall functions (<code>nutUSpaldingWallFunction</code>) and k-ω SST turbulence closure.
- <strong>Multi-Fidelity Hexahedral Meshing Pipeline:</strong> Automatically orchestrates <code>surfaceFeatureExtract</code> (140° included angle), <code>blockMesh</code> background grids, distance-based refinement shells (e.g., 25 mm → Level 4, 80 mm → Level 3), a two-stage wake refinement architecture (<code>nearWakeBox</code> and <code>farWakeBox</code>), prism boundary layer inflation (Fast, Standard, Fine presets), parallel <code>checkMesh</code> quality diagnostics, and bandwidth-optimizing <code>renumberMesh</code>.
- <strong>Numerical Stability & Solver Schemes:</strong> Pre-initializes flow fields with <code>potentialFoam</code> before RANS solving; configures SIMPLEC pressure-velocity coupling (<code>consistent true;</code>) with tuned relaxation factors (p = 0.7, U = 0.7), TVD velocity divergence schemes (<code>bounded Gauss limitedLinear 1</code>), and fast GAMG multigrid elliptic pressure solvers.
- <strong>Telemetry, Convergence Automation & Live Dashboard:</strong> Supports multi-part force decomposition (e.g., separate front wing, rear wing, and undertray accounting), configurable drag and downforce projection axes, automatic half-car symmetry detection with 2× full-car force projection, a rolling-variation convergence monitor (variation &lt; 0.5%) that dynamically injects <code>stopAt writeNow;</code> for clean auto-stopping, and an interactive 4-page animated live dashboard (<code>read_forces.py --live</code>).
- <strong>Production HPC / SLURM Integration:</strong> Generates automated cluster submission scripts (<code>run.sh</code>) configured for high-performance computing clusters (such as the Chulalongkorn University e-Science cluster), featuring Scotch MPI domain decomposition, node-local high-speed scratch disk execution (<code>$TMPDIR</code> / <code>/dev/shm</code>), 15-second background sync loops, and POSIX signal traps (<code>SIGTERM</code>, <code>SIGINT</code>) to safeguard and reconstruct simulation results against cluster preemption.

<!-- Highlight Card / Insight -->

> #### Key Engineering Takeaway
> "Automating CFD isn't just about scripting dictionary files—it requires embedding aerodynamic domain physics directly into computational geometry algorithms. By coupling streaming STL processing with automated multi-box wake refinement, physics-aware boundary conditions, and real-time force convergence monitors, we transformed an error-prone multi-hour manual setup into a deterministic, single-command pipeline."

<!-- Pillar 3: Results, Impact & Takeaways -->

### 3. Results, Impact & Practical Deployment

The generator drastically compressed aerodynamic setup times from over 2–3 hours of manual dictionary editing down to under 5 seconds for case generation, allowing engineering teams to focus on aerodynamic innovation rather than software troubleshooting:

- <strong>Production-Proven in Formula Student:</strong> Successfully deployed for TSAE / Formula Student aerodynamic evaluations, powering multi-million-cell half-car and component simulations on multi-core HPC clusters.
- <strong>Zero-Fault Automated Execution:</strong> Achieved reliable, reproducible meshing and clean convergence across various CAD geometries, validated by an automated regression test suite covering domain mathematics, STL parsing, and force telemetry.
- <strong>Standard-Commands Workflow:</strong> Retains complete flexibility by generating native OpenFOAM files and standard command workflows (<code>./Allrun.parallel</code> or direct <code>simpleFoam</code> execution) without vendor lock-in or proprietary binary wrappers.

## Context

Bridge Lab is an engineering domain episode for Essayons where users build truss bridges and watch them deform, stress, and fail under loads. The episode must simulate structural physics in real time, visualize stress states, and provide immediate feedback on design quality. Users learn by experimenting with different truss configurations, materials, and load scenarios.

**Stakeholders**: Solo developer, future users learning structural engineering basics.
**Constraints**: Zero budget, browser-only, no backend, TypeScript strict mode, continuous simulation mode (real-time physics), must run >30 FPS on mid-range devices with 50+ beam structures.

## Goals / Non-Goals

**Goals:**

- Simulate structural forces through truss networks with real-time stress visualization
- Enable intuitive grid-based construction: place nodes, connect beams, anchor supports
- Teach tension vs. compression through color-coded stress feedback
- Support multiple materials (wood, steel, concrete) with distinct properties
- Provide missions that guide discovery of structural principles (arches, efficiency, resonance)
- Handle dynamic loads (gravity, point loads, oscillating forces for earthquake simulation)
- Maintain physics accuracy sufficient for educational insight without requiring FEA-level precision
- Target >30 FPS with structures up to 100 beams on mid-range devices

**Non-Goals:**

- Full finite element analysis (FEA) with mesh refinement and complex material nonlinearity
- 3D structures or out-of-plane forces (strictly 2D trusses for MVP)
- Wind tunnel simulations or fluid dynamics
- Real-time collaborative multi-user building
- Beam bending moments (treat all beams as axial-only truss members for simplicity)
- Audio feedback (deferred to separate sound design proposal)

## Decisions

### Decision 1: Truss model with pin-jointed members

Bridge Lab uses a **pin-jointed truss model**: all connections are hinges, and all forces are axial (tension or compression along the beam axis). No bending moments are calculated. This is the standard assumption for truss analysis in structural engineering education.

**Model:**

- **Nodes**: Points in 2D space (x, y in meters) with applied forces (loads) and reaction forces (from supports)
- **Beams**: Straight members connecting two nodes, carrying axial force only
- **Supports**: Fixed boundary conditions providing reaction forces to keep the structure in equilibrium

**Force propagation algorithm:**

For static equilibrium, the structure satisfies:

- Sum of forces in x-direction = 0
- Sum of forces in y-direction = 0
- Sum of moments about any point = 0

This forms a system of linear equations. For a structure with N nodes and B beams, we have 2N unknowns (forces in each beam and reaction forces at supports). We solve using:

1. **Method of Joints**: Iterate over each node, apply force balance (sum Fx = 0, sum Fy = 0), solve for unknown beam forces.
2. **Matrix formulation (for complex trusses)**: Construct stiffness matrix K, solve K \* u = F for displacements u, then back-calculate forces from displacements.

For MVP, **Method of Joints** is sufficient for small structures (<50 beams). For larger structures, we may need a sparse matrix solver (use a library like `ml-matrix` or implement Gaussian elimination with pivoting).

**Why**: Pin-jointed truss analysis is the canonical educational model for structural engineering. It captures the essential concepts (tension/compression, force distribution, material strength) without requiring expensive FEA. This is what students learn in Statics 101.

**Alternatives considered:**

- Full FEA with bending moments: Too computationally expensive for real-time browser simulation; overkill for educational insight at this level.
- Empirical/heuristic stress approximations: Not accurate enough to teach correct principles; users need to see real force calculations.

### Decision 2: Real-time continuous simulation

Bridge Lab uses **continuous simulation mode**: the structural physics solver runs every frame (or every physics tick), recalculating forces as loads change or beams break. When a beam breaks, the solver immediately redistributes forces through the remaining structure.

**Simulation loop:**

1. Apply external forces (gravity at each node, user-applied point loads, oscillating forces)
2. Solve static equilibrium (Method of Joints or matrix solve) to find internal beam forces
3. Calculate stress per beam: stress = force / cross-sectional area
4. Check each beam against material strength: if stress > strength, mark beam as broken
5. Remove broken beams from the structure and repeat step 2 (forces redistribute)
6. Calculate node displacements based on beam strain (optional for visual feedback)
7. Render updated structure with stress colors

**Why**: Continuous simulation provides immediate visual feedback—users see the bridge sag under load, watch colors change as stress increases, and observe cascading failures when one beam breaks. This is far more engaging than a static "pass/fail" check after construction. The continuous model also enables the earthquake mission (oscillating loads over time).

**Alternatives considered:**

- Discrete simulation (static analysis after build phase): Less engaging; no real-time feedback during construction or under dynamic loads.
- Fully dynamic rigid-body physics: Adds unnecessary complexity (angular momentum, collision detection); structural deformation is better understood through static equilibrium snapshots at each frame.

### Decision 3: Stress-based failure model

Beams fail when the **absolute stress exceeds the material's strength threshold**. Stress is calculated as:

```
stress = |force| / cross_sectional_area
```

Each material has:

- **Tensile strength** (max tension before failure)
- **Compressive strength** (max compression before failure)
- **Density** (kg/m³)
- **Young's modulus** (stiffness)

For simplicity, we use the same strength value for tension and compression (real materials differ; concrete is strong in compression, weak in tension). If testing shows users benefit from asymmetric strengths, we can refine this later.

**Material properties (approximate values for education):**

| Material | Tensile Strength (MPa)        | Density (kg/m³) | Young's Modulus (GPa) | Cost/Weight Factor |
| -------- | ----------------------------- | --------------- | --------------------- | ------------------ |
| Wood     | 10                            | 500             | 10                    | 1.0 (baseline)     |
| Steel    | 400                           | 7850            | 200                   | 3.0                |
| Concrete | 5 (tension), 30 (compression) | 2400            | 30                    | 0.5                |

**Why**: Stress-based failure is the fundamental engineering criterion taught in introductory courses. It directly connects force (from physics) to material properties (from engineering). The visual feedback (color-coded stress) makes the concept tangible.

**Alternatives considered:**

- Strain-based failure: Conceptually similar but harder to visualize; stress is more intuitive (force per area).
- Probabilistic failure: Adds realism but introduces randomness that obscures cause-and-effect relationships—bad for learning.

### Decision 4: Color-coded stress visualization

Beams are rendered with colors representing their current stress state as a percentage of material strength:

- **Green**: 0-50% of strength (safe)
- **Yellow**: 50-90% of strength (strained, caution)
- **Red**: 90-100% of strength (critical, about to fail)
- **Black/gray**: Broken (stress exceeded strength)

The color interpolates smoothly between thresholds. Beam thickness on screen is proportional to cross-sectional area (thicker beams carry more force before failing, displayed visually).

**Optional visual enhancements:**

- Force vector overlay: Show compression (blue arrows pointing inward) and tension (red arrows pointing outward) on each beam
- Displacement exaggeration: Show deflection of nodes (exaggerated by 10-100x for visibility)

**Why**: Color-coded stress is the gold standard for FEA visualization. It provides immediate intuitive feedback—red means danger, green means safe. Users learn to anticipate failure by watching colors shift as they adjust loads or add/remove beams.

**Accessibility note**: Colors are reinforced with patterns (hatching for high stress) and numeric stress readouts to ensure colorblind users can interpret the visualization.

### Decision 5: Grid-based construction interface

Users construct bridges on a **1-meter grid** (configurable, e.g., 0.5m or 2m). Nodes snap to grid intersections. Beams connect adjacent nodes (cardinal or diagonal).

**UI flow:**

1. Click empty grid cell → place node
2. Drag from node to adjacent node → create beam connecting them
3. Click node or beam → select (highlight)
4. Press Delete or tap delete button → remove selected element
5. Click ground-level nodes → toggle support anchor (fixed boundary condition)

**Constraints enforced:**

- Cannot place node on top of existing node
- Cannot create beam between non-adjacent nodes (unless free-form mode enabled in sandbox)
- At least two support anchors required for structural stability (system warns if missing)

**Why**: Grid-based placement is simple, fast, and predictable—users can quickly prototype truss designs. Snapping eliminates precision issues (misaligned nodes causing calculation errors). The grid also reinforces the discrete nature of truss analysis (node-by-node force balance).

**Alternatives considered:**

- Free-form placement: More flexible but harder to use on small screens; leads to messy, hard-to-analyze structures.
- Prefab truss templates: Faster but reduces learning—users should build from scratch to understand how each member contributes.

### Decision 6: Mission-driven learning progression

Bridge Lab provides four missions that progressively teach structural concepts:

**1. First Crossing** (introductory)

- Objective: Build a bridge spanning a 10m gap that supports a 1000kg point load at the midpoint for 5 simulation seconds without collapse.
- Teaches: Basic truss construction, support placement, load paths.
- Success criteria: No beam failures, structure remains stable.

**2. Efficiency Challenge** (optimization)

- Objective: Cross the same 10m gap with the same 1000kg load, but with total structure weight < 500kg.
- Teaches: Material efficiency, trade-offs between strength and weight, removal of redundant members.
- Success criteria: Load supported AND weight budget met.

**3. The Arch** (compression discovery)

- Objective: Build a bridge where all beams are under compression (not tension) while supporting a 1500kg load.
- Teaches: Why arches are efficient (compressive forces only, no bending), historical significance of arch structures.
- Success criteria: All beams in compression (negative force), load supported for 5 seconds.

**4. Earthquake** (dynamic loads, resonance)

- Objective: Build a bridge that survives an oscillating horizontal force (simulating seismic motion) for 20 simulation seconds.
- Frequency: 1-3 Hz, configurable amplitude.
- Teaches: Resonance (when forcing frequency matches natural frequency, amplitudes grow), damping, dynamic stability.
- Success criteria: No beam failures after 20 seconds of oscillation.

**Why**: Missions provide structure and motivation. They guide users through increasingly sophisticated concepts without requiring upfront reading. Each mission isolates one key principle, making the learning incremental and non-overwhelming.

### Decision 7: Force propagation algorithm — Method of Joints

For small-to-medium structures (< 50 beams), we use the **Method of Joints**:

**Algorithm:**

```
1. Identify support nodes with known reaction forces (unknowns to solve for)
2. For each non-support node:
   a. Sum forces in x-direction: Σ F_x = 0
   b. Sum forces in y-direction: Σ F_y = 0
   c. Solve for unknown beam forces at this node
3. Continue iterating over nodes until all forces are resolved
4. Handle cases where the system is statically indeterminate (more unknowns than equations):
   - Use compatibility equations (displacements from Hooke's law)
   - Or fall back to matrix stiffness method
```

**For larger or indeterminate structures**, use **matrix stiffness method**:

1. Assemble global stiffness matrix K (size 2N × 2N for N nodes)
2. Apply boundary conditions (fix support node displacements)
3. Solve K \* u = F for nodal displacements u
4. Back-calculate beam forces from displacements: F_beam = (E _ A / L) _ Δu

**Implementation notes:**

- Pre-compute connectivity matrix (which beams connect to which nodes) once during construction
- Mark dirty flag when structure changes, recompute forces only when dirty
- Cache intermediate results (e.g., reaction forces) between frames if loads don't change

**Why**: Method of Joints is simple, fast for small structures, and directly teaches the manual calculation method from textbooks. If we need to scale up, the matrix method is well-known and straightforward to implement (or use a library).

**Performance target**: Solve 50-beam truss in <5ms per frame on mid-range CPU.

### Decision 8: Displacement visualization (optional)

Optionally compute node displacements using Hooke's law:

```
strain = stress / E (Young's modulus)
ΔL = strain * L (change in beam length)
```

Sum displacements at each node from all connected beams. Exaggerate displacements by 10-100x for visibility (real displacements are typically millimeters, invisible at screen scale).

Render displaced structure as a translucent overlay on top of the original structure. This helps users see bending and sagging under load.

**Why**: Displacement visualization is a powerful learning aid—seeing the bridge sag makes load distribution intuitive. However, it's computationally optional (not required for mission success), so we can make it a toggleable feature.

### Decision 9: Earthquake simulation via sinusoidal force

For the Earthquake mission, apply a time-varying horizontal force at each node:

```
F_x(t) = A * sin(2π * f * t)
```

where:

- A = amplitude (configurable, e.g., 500N per node)
- f = frequency (configurable, e.g., 2 Hz)
- t = simulation time

The force is applied to all nodes uniformly (simplified seismic model). The user must design a structure stable enough to resist this oscillating load without exceeding beam strength.

**Resonance detection**: Compute the structure's natural frequency (via eigenvalue analysis of stiffness matrix) and warn the user if the forcing frequency is close (within 10%) to the natural frequency. This teaches the concept of resonance (Tacoma Narrows reference).

**Why**: Sinusoidal forcing is the simplest dynamic load model and directly illustrates resonance. It's sufficient to teach the concept without requiring a full seismic response analysis.

**Alternatives considered:**

- Random seismic waveform: More realistic but harder to reason about; obscures the resonance lesson.
- Impulse load (single shock): Simpler but doesn't teach resonance, which is a key failure mode.

## Risks / Trade-offs

- **Solver performance for large structures**: The Method of Joints may be too slow for 100+ beam structures. **Mitigation**: Implement matrix stiffness method with sparse solver if profiling shows need; cap structure size in missions to 50 beams.
- **Numerical stability**: Poorly constrained structures (e.g., missing supports) may cause solver divergence. **Mitigation**: Validate constraints during construction; warn user if structure is under-constrained before allowing load application.
- **Educational accuracy vs. simplification**: Real structures have bending moments, buckling, material nonlinearity—none of which are modeled. **Mitigation**: Document the simplifications in the reference panel; focus messaging on "truss approximation" as a learning tool, not engineering software.
- **Colorblind accessibility**: Stress colors (green/yellow/red) may be indistinguishable to colorblind users. **Mitigation**: Add hatching patterns (diagonal lines for high stress), numeric stress labels, and ensure 4.5:1 contrast ratio for text.
- **Mobile performance**: Touch devices may struggle with 50+ beam structures at 60 FPS. **Mitigation**: Degrade render quality (skip displacement visualization, reduce color updates to 30 FPS) on low-end devices; cap missions to 30 beams on mobile.

## Migration Plan

This is a greenfield addition—no existing code to migrate. Bridge Lab is introduced as a new `src/episodes/bridge-lab/` module. The episode registers itself with the episode factory and is available alongside Orbit Lab.

**Dependencies:**

- Requires `SimulationEngine` (from add-simulation-engine proposal)
- Requires episode routing/registry (from add-episode-factory or add-router proposal)
- Requires design system for Engineering accent color #ff6b35 (from add-design-system proposal)

**Rollback**: Remove `src/episodes/bridge-lab/` directory and unregister from episode factory. No other code depends on Bridge Lab at creation time.

## Open Questions

- **Buckling simulation**: Should we simulate column buckling (compressive beams failing at lower stress than tensile strength predicts)? Deferred—adds significant complexity, not MVP-critical.
- **Beam cross-section shape**: Should users choose between I-beams, hollow tubes, solid rectangles (affecting moment of inertia and weight)? Deferred—can be added as advanced sandbox feature later.
- **Multi-load scenarios**: Should missions support multiple simultaneous point loads (e.g., traffic pattern)? Deferred—single load is sufficient for MVP; can extend later.
- **Save/share designs**: Should users be able to export bridge designs as JSON and share with others? Deferred—useful but not MVP-critical; can be added in shareable-states proposal.

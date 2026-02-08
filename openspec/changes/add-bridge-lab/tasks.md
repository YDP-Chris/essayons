## 1. Core Structural Physics Engine

- [ ] 1.1 Implement `StructuralPhysics.ts` with truss network representation (nodes, beams, supports)
- [ ] 1.2 Implement force propagation algorithm using static equilibrium equations (sum F = 0, sum M = 0)
- [ ] 1.3 Implement stress calculation per beam: stress = force / cross-sectional area
- [ ] 1.4 Implement strain calculation: strain = stress / Young's modulus
- [ ] 1.5 Implement beam failure detection when stress exceeds material strength threshold
- [ ] 1.6 Write unit tests for force balance in known truss configurations (simple beam, triangle, Warren truss)
- [ ] 1.7 Add gravity force application to structure (mass per node)
- [ ] 1.8 Add point load application at arbitrary nodes
- [ ] 1.9 Add oscillating horizontal force generator for earthquake simulation

## 2. Material System

- [ ] 2.1 Define material properties in `constants.ts`: wood, steel, concrete (tensile/compressive strength, density, Young's modulus)
- [ ] 2.2 Implement `MaterialSystem.ts` with material selection and per-beam assignment
- [ ] 2.3 Implement strength-to-weight ratio calculations for efficiency scoring
- [ ] 2.4 Add material cost system for budget-based missions (optional weight or dollar cost per meter)
- [ ] 2.5 Write tests for material property lookups and failure threshold enforcement

## 3. Truss Builder Interface

- [ ] 3.1 Implement `TrussBuilder.ts` with grid-based coordinate system (e.g., 1m grid spacing)
- [ ] 3.2 Add node placement: click to add node at grid position
- [ ] 3.3 Add beam placement: drag from node to node to connect with beam
- [ ] 3.4 Add support anchor placement: fixed supports at ground level
- [ ] 3.5 Add node/beam deletion: click to select, delete key or button to remove
- [ ] 3.6 Implement collision detection: prevent overlapping nodes, warn about unstable configurations
- [ ] 3.7 Add undo/redo stack for construction steps
- [ ] 3.8 Add touch controls: tap-to-place node, drag-to-connect beam, long-press-to-delete
- [ ] 3.9 Write tests for node/beam addition, removal, and constraint validation

## 4. Stress Visualization

- [ ] 4.1 Implement `StressVisualizer.ts` with color mapping: green (0-50% of limit), yellow (50-90%), red (90-100%), black (broken)
- [ ] 4.2 Add beam thickness rendering proportional to beam cross-sectional area
- [ ] 4.3 Add force vector overlay toggle: display compression (blue arrows) and tension (red arrows)
- [ ] 4.4 Add displacement animation: show beam deflection exaggerated for visibility
- [ ] 4.5 Add breakage animation: beam fracture with particle effect when failure occurs
- [ ] 4.6 Write visual tests for color mapping correctness

## 5. Canvas Rendering

- [ ] 5.1 Implement `BridgeRenderer.ts` integrating with simulation engine's layered rendering
- [ ] 5.2 Add background layer: render grid, ground surface, and gap area
- [ ] 5.3 Add simulation layer: render nodes (circles), beams (lines with color/thickness), supports (triangles)
- [ ] 5.4 Add overlay layer: render applied loads (arrows), telemetry labels, stress indicators
- [ ] 5.5 Implement viewport pan and zoom for large bridges
- [ ] 5.6 Add coordinate transform from world space (meters) to screen space (pixels)
- [ ] 5.7 Optimize rendering: skip off-screen elements, cache static grid

## 6. Parameter System

- [ ] 6.1 Define episode parameters: material type (enum: wood/steel/concrete), load weight (number: 0-5000 kg), load position (vector2), gravity multiplier (number: 0-2), beam thickness multiplier (number: 0.5-3), time warp (number: 1-100)
- [ ] 6.2 Register parameters with simulation engine's parameter system
- [ ] 6.3 Implement parameter change handlers that update physics state
- [ ] 6.4 Add parameter persistence via localStorage

## 7. Missions

- [ ] 7.1 Implement `FirstCrossingMission.ts`: success = bridge supports 1000kg point load at midpoint without failure for 5 simulation seconds
- [ ] 7.2 Add mission briefing UI for First Crossing with objective and hints
- [ ] 7.3 Implement `EfficiencyChallengeMission.ts`: success = bridge supports 1000kg load AND total material weight < 500kg budget
- [ ] 7.4 Add material weight tracking and budget display in UI
- [ ] 7.5 Implement `TheArchMission.ts`: success = build arch structure that supports load using primarily compressive forces (all beams under compression)
- [ ] 7.6 Add arch detection heuristic: check that majority of beams are in compression, not tension
- [ ] 7.7 Implement `EarthquakeMission.ts`: success = bridge survives oscillating horizontal force (1-3 Hz, configurable amplitude) for 20 simulation seconds
- [ ] 7.8 Add resonance frequency detection: warn when load frequency approaches structure's natural frequency
- [ ] 7.9 Add mission briefing screens for all missions explaining objectives and relevant physics concepts
- [ ] 7.10 Write tests for mission success/failure detection logic

## 8. Telemetry System

- [ ] 8.1 Implement `Telemetry.ts` to compute real-time metrics
- [ ] 8.2 Calculate total structure weight: sum(beam_length _ material_density _ cross_sectional_area)
- [ ] 8.3 Calculate load-bearing capacity: estimate max load before failure based on weakest beam
- [ ] 8.4 Calculate max beam stress across entire structure
- [ ] 8.5 Calculate factor of safety: min(material_strength / beam_stress) across all beams
- [ ] 8.6 Calculate maximum displacement magnitude at any node
- [ ] 8.7 Estimate fundamental resonance frequency (for earthquake mission)
- [ ] 8.8 Format telemetry for display: units, precision, color coding (red if unsafe)
- [ ] 8.9 Write tests for telemetry calculation correctness

## 9. Sandbox Mode

- [ ] 9.1 Implement sandbox entry point with all parameters unlocked
- [ ] 9.2 Remove material budget constraints in sandbox
- [ ] 9.3 Allow unlimited construction and deletion
- [ ] 9.4 Add physics parameter sliders: gravity, material strength multipliers, load scaling
- [ ] 9.5 Add instant reset button to clear structure and restart

## 10. Reference Panel

- [ ] 10.1 Create `ReferencePanel.tsx` React component
- [ ] 10.2 Add section: Tension vs. Compression (definitions, visual diagrams, examples)
- [ ] 10.3 Add section: Truss Types (Warren, Pratt, Howe trusses with diagrams)
- [ ] 10.4 Add section: Moment of Inertia (definition, equation, why thicker beams resist bending better)
- [ ] 10.5 Add section: Stress and Strain (definitions, Hooke's law, yield point, failure)
- [ ] 10.6 Add section: Famous Bridge Failures (Tacoma Narrows resonance, Quebec Bridge collapse with lessons learned)
- [ ] 10.7 Add interactive toggles to show/hide reference panel sections
- [ ] 10.8 Apply Engineering accent color #ff6b35 to panel headers and highlights

## 11. Episode Integration

- [ ] 11.1 Implement `BridgeLabEpisode.ts` implementing `EpisodeDefinition` interface
- [ ] 11.2 Wire episode to simulation engine: register parameters, missions, render layers, input handlers
- [ ] 11.3 Implement `createInitialState()`: empty structure with fixed supports at gap edges
- [ ] 11.4 Implement `update()`: call structural physics solver each physics tick, detect failures, update mission state
- [ ] 11.5 Implement `render()`: delegate to BridgeRenderer
- [ ] 11.6 Implement `cleanup()`: remove event listeners, clear canvas layers
- [ ] 11.7 Register episode in episode registry/router

## 12. Input Controls

- [ ] 12.1 Map mouse click to node placement action
- [ ] 12.2 Map mouse drag to beam creation action
- [ ] 12.3 Map delete key to node/beam removal action
- [ ] 12.4 Map Space key to pause/play toggle
- [ ] 12.5 Map +/- keys to time warp adjustment
- [ ] 12.6 Add touch event handlers: tap = place node, drag = create beam, long-press = delete
- [ ] 12.7 Add pinch-to-zoom on touch devices
- [ ] 12.8 Write tests for input action mapping

## 13. UI Components

- [ ] 13.1 Create `ControlPanel.tsx` with material selector, load controls, time warp slider
- [ ] 13.2 Create `TelemetryDisplay.tsx` showing real-time structure metrics
- [ ] 13.3 Create `MissionPanel.tsx` displaying current mission briefing and objectives
- [ ] 13.4 Create `ToolPalette.tsx` for construction tools (add node, add beam, delete, select support type)
- [ ] 13.5 Apply Engineering accent color #ff6b35 to UI highlights, buttons, mission success indicators
- [ ] 13.6 Write component tests with React Testing Library

## 14. Performance Optimization

- [ ] 14.1 Profile structural physics solver for large trusses (>100 beams)
- [ ] 14.2 Optimize force propagation algorithm: use sparse matrix solver if needed
- [ ] 14.3 Add dirty flagging: only recompute forces when structure or loads change
- [ ] 14.4 Throttle stress color updates to 30 FPS (decoupled from physics tick rate)
- [ ] 14.5 Measure and assert <100ms input latency for node/beam placement
- [ ] 14.6 Ensure >30 FPS on mid-range devices with 50-beam structures

## 15. Testing

- [ ] 15.1 Write unit tests for `StructuralPhysics.ts` with known truss solutions
- [ ] 15.2 Write unit tests for material property lookups and failure detection
- [ ] 15.3 Write unit tests for telemetry calculations (weight, stress, safety factor)
- [ ] 15.4 Write component tests for all UI components
- [ ] 15.5 Write integration tests: build bridge, apply load, verify mission success/failure
- [ ] 15.6 Write E2E test with Playwright: user completes First Crossing mission
- [ ] 15.7 Add performance assertions: frame rate, input latency, load time

## 16. Documentation and Polish

- [ ] 16.1 Add inline code comments explaining force propagation algorithm
- [ ] 16.2 Document material property sources (standard engineering references)
- [ ] 16.3 Add loading screen while episode initializes
- [ ] 16.4 Add tooltips to construction tools and parameters
- [ ] 16.5 Add sound effects (optional): beam placement, breakage, mission success (deferred to sound design proposal)
- [ ] 16.6 Run accessibility audit: keyboard navigation, screen reader support, colorblind-safe stress colors
- [ ] 16.7 Test on mobile devices (touch controls, responsive layout)
- [ ] 16.8 Validate against brand voice guidelines (encouraging failure messages)

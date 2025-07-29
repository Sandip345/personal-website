---
title: Axial Flow Compressor Design
period: Aug 2021 – Nov 2021
description: Gained hands‑on experience designing and analyzing a subsonic axial
  flow compressor. Used CATIA V5 to model blade and hub geometry, generated
  high‑quality meshes with Ansys TurboGrid, and performed CFD simulations in
  Ansys CFX to evaluate compressor performance metrics such as pressure ratio
  and efficiency. Learned how blade shape affects flow separation and optimized
  design parameters to meet target performance.
tags:
  - Compressor design
  - Ansys CFX
---
In this project, we designed and analyzed a single-stage subsonic axial flow compressor optimized for low mass flow rate applications (8.2 kg/s) and a target pressure ratio of 1.2. 

The design was executed using a multi-stage pipeline:

* **Preliminary Design**: Velocity triangles were computed based on the mean-line method using a Python program.

  ![](/images/uploads/screenshot-2025-07-29-195427.png "Velocity triangles at mid-section (from Python calculation)")
* **3D Blade Geometry**: Blade sections (hub, mid, tip) were shaped using CATIA with NACA 651212 profiles, incorporating calculated flow angles, stagger, and incidence.
* **Meshing**: High-quality structured meshes were generated using ANSYS Turbogrid with O-H topology for accurate boundary layer capture.
* **CFD Simulation**: Steady and transient simulations were performed in ANSYS CFX using SST k-ω turbulence model. The mixing-plane approach was used for rotor-stator interface in steady state, and time-transformation for transient modeling.
* **Results**: Steady-state simulation showed an isentropic efficiency of 77.86% and a total pressure ratio of 1.12. Transient results showed oscillatory behavior between 1.13–1.17 pressure ratio, validating the design.

This project gave us hands-on experience in turbomachinery design, CAD modeling, mesh generation, and CFD-based performance evaluation. Future improvements could involve tip clearance modeling, blade lean/sweep features, and design optimization.
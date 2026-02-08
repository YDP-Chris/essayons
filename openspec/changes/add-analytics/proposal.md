# Change: Add privacy-respecting analytics with Plausible

## Why

Essayons needs to measure whether users are genuinely experimenting and learning -- not just visiting pages. A privacy-respecting analytics layer using Plausible will track aggregate engagement patterns (session duration, parameter changes, mission completion) without collecting personal data, enabling data-driven iteration on episode quality and platform growth.

## What Changes

- Integrate Plausible Analytics script into the application shell
- Define and implement custom events for simulation interactions, parameter changes, mission lifecycle (start/complete/fail), share actions, and episode switches
- Implement session duration tracking focused on "Time Spent Experimenting" as the north star metric
- Configure domain-level reporting with per-episode metric segmentation
- Enforce privacy constraints: no cookies, no PII, no tracking identifiers, GDPR compliant by default
- Establish a performance budget ensuring the analytics script does not degrade the <3 second load time target

## Impact

- Affected specs: `analytics` (new capability)
- Affected code: `index.html` (script tag), `src/analytics/` (new module for event helpers), episode framework components (event dispatch hooks), share action handlers

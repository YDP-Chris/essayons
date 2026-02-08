## 1. Plausible Script Integration

- [ ] 1.1 Add Plausible Analytics `<script>` tag to `index.html` with `defer` and `data-domain` attributes
- [ ] 1.2 Configure script to load from Plausible Cloud or self-hosted instance
- [ ] 1.3 Verify script loads with `async`/`defer` and does not block page rendering
- [ ] 1.4 Add environment-based toggle to disable analytics in development/test environments

## 2. Analytics Module

- [ ] 2.1 Create `src/analytics/plausible.ts` module exporting typed event helper functions
- [ ] 2.2 Define TypeScript types for all custom event names and their property schemas
- [ ] 2.3 Implement a `trackEvent(name, props)` wrapper around `window.plausible()` with type safety
- [ ] 2.4 Add graceful fallback when Plausible script is blocked or unavailable (no errors thrown)

## 3. Custom Event Tracking

- [ ] 3.1 Implement `Simulation:Interaction` event fired on meaningful simulation interactions (play, pause, reset)
- [ ] 3.2 Implement `Parameter:Change` event fired when users adjust any simulation parameter (slider, button, keyboard)
- [ ] 3.3 Implement `Mission:Start` event with episode ID and mission ID as properties
- [ ] 3.4 Implement `Mission:Complete` event with episode ID, mission ID, and attempt count
- [ ] 3.5 Implement `Mission:Fail` event with episode ID and mission ID
- [ ] 3.6 Implement `Share:Action` event when users trigger share functionality
- [ ] 3.7 Implement `Episode:Switch` event when users navigate between episodes

## 4. Session Duration Tracking

- [ ] 4.1 Implement experiment-time tracking that measures active simulation engagement (not idle time)
- [ ] 4.2 Fire a `Session:Duration` custom property or use Plausible's built-in time-on-page for the north star metric
- [ ] 4.3 Validate that average session duration can be derived from Plausible dashboard

## 5. Domain-Level Reporting

- [ ] 5.1 Include episode identifier as a property on all custom events for per-episode segmentation
- [ ] 5.2 Verify Plausible dashboard can filter and break down metrics by episode
- [ ] 5.3 Document the reporting structure for KPI tracking (session duration, experiment rate, mission completion, return visits, share rate)

## 6. Privacy Compliance Verification

- [ ] 6.1 Audit that no cookies are set by the analytics integration
- [ ] 6.2 Audit that no personal data or tracking identifiers are included in any event payload
- [ ] 6.3 Verify Plausible script configuration uses cookieless mode
- [ ] 6.4 Add a note to privacy policy or about page confirming aggregate-only analytics

## 7. Performance Budget Enforcement

- [ ] 7.1 Measure analytics script size (must be <1 KB gzipped for Plausible)
- [ ] 7.2 Verify load time remains under 3 seconds on simulated 3G with analytics enabled
- [ ] 7.3 Add Lighthouse CI assertion or Playwright performance test confirming no load time regression
- [ ] 7.4 Confirm analytics calls are non-blocking and do not affect simulation frame rate (>30 FPS)

## 8. Testing

- [ ] 8.1 Write unit tests for `src/analytics/plausible.ts` (event dispatch, graceful fallback)
- [ ] 8.2 Write integration test verifying custom events fire on parameter change and mission lifecycle
- [ ] 8.3 Write E2E test (Playwright) confirming analytics script loads and does not set cookies
- [ ] 8.4 Write performance test asserting load time budget is maintained

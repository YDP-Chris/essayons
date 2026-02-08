## ADDED Requirements

### Requirement: Analytics Integration

The system SHALL integrate Plausible Analytics as the sole analytics provider. The Plausible script MUST be loaded via a `<script>` tag with `defer` to prevent render-blocking. The system MUST configure the script with the correct `data-domain` attribute matching the production domain. The analytics integration MUST be disabled in development and test environments via an environment-based toggle.

#### Scenario: Plausible script loads in production

- **WHEN** the application loads in a production environment
- **THEN** the Plausible Analytics script MUST be present in the DOM with `defer` attribute and correct `data-domain`

#### Scenario: Analytics disabled in development

- **WHEN** the application loads in a development or test environment
- **THEN** the Plausible Analytics script MUST NOT be loaded and no analytics calls MUST be made

#### Scenario: Script blocked by ad blocker

- **WHEN** the Plausible script is blocked by a browser extension or network condition
- **THEN** the application MUST continue to function normally with no JavaScript errors thrown

### Requirement: Custom Event Tracking

The system SHALL emit custom analytics events for user interactions that map to platform KPIs. All custom events MUST be dispatched through a typed analytics module (`src/analytics/plausible.ts`) that wraps the `window.plausible()` API. Each event MUST include an `episode` property identifying the active episode for domain-level segmentation.

#### Scenario: Simulation interaction tracked

- **WHEN** a user performs a simulation interaction (play, pause, or reset)
- **THEN** the system SHALL fire a `Simulation:Interaction` event with properties `episode` (string) and `action` (one of `play`, `pause`, `reset`)

#### Scenario: Parameter change tracked

- **WHEN** a user adjusts a simulation parameter via slider, button, or keyboard input
- **THEN** the system SHALL fire a `Parameter:Change` event with properties `episode` (string) and `parameter` (string identifying which parameter changed)

#### Scenario: Mission start tracked

- **WHEN** a user begins a mission
- **THEN** the system SHALL fire a `Mission:Start` event with properties `episode` (string) and `mission` (string)

#### Scenario: Mission completion tracked

- **WHEN** a user successfully completes a mission
- **THEN** the system SHALL fire a `Mission:Complete` event with properties `episode` (string), `mission` (string), and `attempts` (number)

#### Scenario: Mission failure tracked

- **WHEN** a user fails a mission attempt
- **THEN** the system SHALL fire a `Mission:Fail` event with properties `episode` (string) and `mission` (string)

#### Scenario: Share action tracked

- **WHEN** a user triggers a share action (copy link, social share, or export)
- **THEN** the system SHALL fire a `Share:Action` event with properties `episode` (string) and `method` (string identifying the share mechanism)

#### Scenario: Episode switch tracked

- **WHEN** a user navigates from one episode to another
- **THEN** the system SHALL fire an `Episode:Switch` event with properties `from` (string, previous episode or empty if first load) and `to` (string, new episode)

### Requirement: Session Duration Tracking

The system SHALL track active experimentation time as the north star metric "Time Spent Experimenting." Active time MUST measure periods when the user is interacting with the simulation (parameter changes, simulation running, mission attempts) and MUST exclude idle periods where no interaction occurs for more than 60 seconds. The system SHALL use Plausible's time-on-page measurement supplemented by custom engagement signals to approximate active session duration.

#### Scenario: Active experimentation measured

- **WHEN** a user interacts with the simulation by changing parameters or running the simulation
- **THEN** the system SHALL count that time as active experimentation time and make it available for aggregate reporting

#### Scenario: Idle time excluded

- **WHEN** a user has not interacted with the simulation for more than 60 seconds
- **THEN** the system SHALL stop counting active experimentation time until the next interaction

#### Scenario: Session duration available in dashboard

- **WHEN** an administrator views the Plausible analytics dashboard
- **THEN** average session duration (as measured by Plausible time-on-page plus custom engagement signals) MUST be visible and filterable by episode

### Requirement: Domain-Level Reporting

The system SHALL support per-episode metric segmentation by including the active episode identifier as a custom property on every analytics event. All KPI metrics (session duration, experiment rate, mission completion rate, return visit rate, share rate) MUST be derivable from the Plausible dashboard using episode-based filtering. The system MUST NOT create separate Plausible sites per episode; instead, it SHALL use custom properties for segmentation within a single domain.

#### Scenario: Per-episode filtering available

- **WHEN** an administrator filters the Plausible dashboard by a specific episode custom property value
- **THEN** all KPI metrics (event counts, session duration, goal conversions) MUST reflect only data from that episode

#### Scenario: Cross-episode aggregate view

- **WHEN** an administrator views the Plausible dashboard without episode filters
- **THEN** all KPI metrics MUST reflect aggregate data across all episodes

#### Scenario: New episode automatically tracked

- **WHEN** a new episode is added to the platform and a user interacts with it
- **THEN** the episode identifier MUST automatically appear as a filterable property in the dashboard without any manual Plausible configuration changes

### Requirement: Privacy Compliance

The system SHALL NOT set any cookies or use any browser storage mechanisms for analytics purposes. The system SHALL NOT collect, transmit, or store any personal data, personally identifiable information (PII), or tracking identifiers (IP addresses, fingerprints, user IDs, session IDs). All analytics data MUST be aggregate-only with no ability to identify or reconstruct individual user sessions. The analytics integration MUST be GDPR, CCPA, and PECR compliant without requiring a cookie consent banner.

#### Scenario: No cookies set

- **WHEN** a user visits any page of the application
- **THEN** no cookies SHALL be set by the analytics integration, verifiable via browser developer tools

#### Scenario: No PII in event payloads

- **WHEN** any analytics event is dispatched to Plausible
- **THEN** the request payload MUST NOT contain IP addresses (beyond what Plausible discards), user identifiers, session identifiers, email addresses, or any other PII

#### Scenario: No local storage used for tracking

- **WHEN** the analytics module initializes and operates
- **THEN** it SHALL NOT read from or write to `localStorage`, `sessionStorage`, or `IndexedDB` for any tracking or identification purpose

#### Scenario: No consent banner required

- **WHEN** a user visits the application for the first time
- **THEN** no cookie consent banner or analytics opt-in prompt SHALL be displayed, because the analytics integration does not require consent under GDPR/PECR (no cookies, no personal data)

### Requirement: Performance Budget

The analytics integration SHALL NOT cause the application load time to exceed the 3-second target on a simulated 3G connection. The Plausible script MUST be loaded with `defer` or `async` to prevent render-blocking. The total additional network transfer for analytics MUST be less than 1 KB gzipped. Analytics event dispatch calls MUST be non-blocking and SHALL NOT affect the simulation frame rate (minimum 30 FPS on mid-range devices). Analytics MUST NOT add more than 50ms to the Time to Interactive (TTI) metric.

#### Scenario: Load time maintained under budget

- **WHEN** the application loads with the analytics script enabled on a simulated 3G connection
- **THEN** the total page load time MUST remain under 3 seconds

#### Scenario: Script size within budget

- **WHEN** the Plausible script is fetched by the browser
- **THEN** the transferred size MUST be less than 1 KB gzipped

#### Scenario: No frame rate impact

- **WHEN** the simulation is running and analytics events are being dispatched
- **THEN** the simulation frame rate MUST remain above 30 FPS with no dropped frames caused by analytics operations

#### Scenario: Non-blocking event dispatch

- **WHEN** a custom analytics event is fired
- **THEN** the event dispatch MUST be asynchronous and MUST NOT block the main thread for more than 1 millisecond

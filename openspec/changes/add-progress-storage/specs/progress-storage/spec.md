## ADDED Requirements

### Requirement: Mission Completion Storage

The system SHALL persist mission completion states per episode in browser localStorage. Each completed mission SHALL be recorded as a boolean flag keyed by episode ID and mission ID. The system MUST allow querying whether a specific mission is complete and listing all completed missions for a given episode.

#### Scenario: Mark a mission as complete

- **WHEN** a user completes a mission within an episode
- **THEN** the system records that mission as complete in localStorage under the corresponding episode

#### Scenario: Query completion state on return

- **WHEN** a user returns to an episode they previously visited
- **THEN** the system reports accurate completion status for each mission in that episode

#### Scenario: No duplicate writes

- **WHEN** a mission that is already marked complete is completed again
- **THEN** the stored state remains unchanged and no error occurs

---

### Requirement: Episode Visit Tracking

The system SHALL record visit metadata for each episode. On first visit, the system MUST store a `firstVisit` timestamp. On every visit, the system MUST update a `lastVisit` timestamp. Visit timestamps SHALL be stored as ISO 8601 strings.

#### Scenario: First visit to an episode

- **WHEN** a user opens an episode for the first time
- **THEN** the system stores both `firstVisit` and `lastVisit` with the current timestamp

#### Scenario: Subsequent visit to an episode

- **WHEN** a user opens an episode they have visited before
- **THEN** the system updates `lastVisit` to the current timestamp without modifying `firstVisit`

#### Scenario: List visited episodes

- **WHEN** the application queries visit data
- **THEN** the system returns visit metadata for all episodes that have been opened at least once

---

### Requirement: Return Visit Detection

The system SHALL detect whether the current session is a return visit by comparing the current load time against a stored `lastSessionTimestamp`. A return visit is defined as a session where a `lastSessionTimestamp` exists and is older than the current page load. The system MUST update `lastSessionTimestamp` on every app load. When a return visit is detected, the system SHALL fire a `return-visit` custom event to the analytics provider (Plausible).

#### Scenario: New user first visit

- **WHEN** a user loads the application and no `lastSessionTimestamp` exists in storage
- **THEN** the system records the current timestamp as `lastSessionTimestamp` and does NOT fire a return-visit event

#### Scenario: Returning user detected

- **WHEN** a user loads the application and a `lastSessionTimestamp` exists from a previous session
- **THEN** the system fires a `return-visit` analytics event and updates `lastSessionTimestamp` to the current time

#### Scenario: Same-session reload

- **WHEN** a user reloads the page within the same browsing session
- **THEN** the system MAY fire a return-visit event (this is acceptable; analytics deduplication is handled server-side by Plausible)

---

### Requirement: Storage Resilience

The system SHALL gracefully handle localStorage being unavailable, read-only, or full. When localStorage is unavailable (e.g., private browsing mode, disabled by policy), the system MUST fall back to an in-memory store for the duration of the session. When a write fails due to `QuotaExceededError`, the system MUST catch the error, log a warning, and continue operating with stale data rather than crashing. The system MUST NOT surface storage errors to the user.

#### Scenario: localStorage unavailable

- **WHEN** the system detects that localStorage is not accessible (probe write fails)
- **THEN** all progress operations use an in-memory fallback and the application functions normally for the current session

#### Scenario: Storage quota exceeded

- **WHEN** a write to localStorage throws a `QuotaExceededError`
- **THEN** the system catches the error, logs a warning to the console, and continues with the last successfully stored state

#### Scenario: localStorage becomes available mid-session

- **WHEN** the system started with in-memory fallback but localStorage becomes accessible
- **THEN** the system MAY continue using the in-memory store for the remainder of the session (no hot-switch required)

---

### Requirement: Data Schema Versioning

The system SHALL include a `schemaVersion` field (integer) in the root of the stored JSON object. The initial schema version MUST be `1`. On application load, the system MUST read the stored `schemaVersion` and apply any necessary migrations sequentially to bring the data to the current version. If the stored version is higher than the application version, the system MUST NOT modify the stored data and SHALL fall back to in-memory storage for the session.

#### Scenario: Fresh storage initialization

- **WHEN** no progress data exists in localStorage
- **THEN** the system creates a new data object with `schemaVersion` set to `1`

#### Scenario: Compatible version loaded

- **WHEN** stored data has a `schemaVersion` matching the current application version
- **THEN** the system uses the data directly without migration

#### Scenario: Older version requires migration

- **WHEN** stored data has a `schemaVersion` lower than the current application version
- **THEN** the system applies migration functions sequentially (v1 to v2, v2 to v3, etc.) and updates the `schemaVersion` field

#### Scenario: Future version detected

- **WHEN** stored data has a `schemaVersion` higher than the current application version
- **THEN** the system does NOT modify stored data, falls back to in-memory storage, and logs a warning

---

### Requirement: Privacy Compliance

The system MUST NOT store any personal data, tracking identifiers, or fingerprinting information. Stored data SHALL be limited to: schema version, mission completion flags (booleans), episode visit timestamps, and a session timestamp. The system MUST NOT generate or store user IDs, device IDs, or any value that could identify an individual across browsers or devices.

#### Scenario: Verify stored data contains no personal information

- **WHEN** the stored progress data is inspected
- **THEN** it contains only schema version, mission completion booleans keyed by episode/mission ID, episode visit timestamps, and a last-session timestamp — no names, emails, IPs, device IDs, or user IDs

#### Scenario: Data stays local

- **WHEN** the application operates normally
- **THEN** progress data is never transmitted to any server — it exists only in the browser's localStorage or in-memory fallback

#### Scenario: User clears browser data

- **WHEN** a user clears their browser storage or localStorage
- **THEN** all progress data is permanently deleted with no server-side backup or recovery mechanism

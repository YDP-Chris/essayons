## Context

Essayons is designed for zero-friction, no-account classroom deployment. Teachers need to distribute episode configurations and track progress without server infrastructure. This design defines the teacher dashboard — a client-side-only workflow for lesson curation, link sharing, and progress review.

**Stakeholders**: Educators (K-12, college, informal learning spaces), solo developer.
**Constraints**: No backend, no accounts, privacy-first (no student PII collection), browser-only, URL length limits (2000 characters safe cross-browser).

## Goals / Non-Goals

**Goals:**

- Enable teachers to create shareable lesson plans encoded entirely in URLs
- Support episode sequencing (ordered playlists) without requiring a database
- Allow teachers to review student progress via client-side JSON exports (no server upload)
- Generate classroom-ready QR codes for instant student access
- Provide printable lesson plans (markdown/HTML/PDF) for offline distribution
- Maintain zero-backend architecture — all data stays in URLs or local files

**Non-Goals:**

- Real-time student tracking or live dashboards (requires backend)
- Authentication or teacher accounts (conflicts with zero-friction principle)
- Hosted lesson plan repositories or sharing platforms
- Student-to-student or teacher-to-student messaging
- Gradebook integration or LMS connectors (future consideration)

## Decisions

### Decision 1: URL Encoding Scheme for Lesson Plans

Lesson plan configurations are encoded as URL parameters using base64-encoded, DEFLATE-compressed JSON:

```
https://essayons.app/#/teach?plan=<base64-encoded-compressed-json>
```

The `LessonPlanConfig` schema:

```typescript
interface LessonPlanConfig {
  version: 1 // schema version for forward compatibility
  title?: string // optional lesson plan name
  episodes: Array<{
    id: string // e.g., "orbit-lab"
    missions: string[] // mission IDs to include (empty = all)
    parameters?: Record<string, number | boolean | string> // preset parameter values
  }>
  sequence?: string[] // ordered episode IDs for playlist mode
}
```

Encoding steps:

1. Serialize config to JSON
2. Compress with pako (DEFLATE library, zero dependencies, ~45KB gzipped)
3. Encode as URL-safe base64
4. Append to URL as `?plan=...`

**Why**: DEFLATE compression keeps URLs short even with many episodes/parameters. Base64 ensures URL safety. A version field allows schema evolution. This avoids the 2000-character URL limit for most lesson plans (tested: 10 episodes with full parameter sets = ~1200 chars after compression).

**Alternatives considered:**

- Uncompressed JSON: Exceeds URL limits with >3 episodes
- Custom binary format: More compact but harder to debug and version
- Server-side storage with short IDs: Violates zero-backend constraint
- Fragment identifiers (`#plan=...`): Conflicts with React Router hash routing

### Decision 2: Student Progress Export Format

Students export progress as a JSON file from their browser's localStorage:

```typescript
interface StudentProgressExport {
  version: 1
  exportedAt: string // ISO 8601 timestamp
  studentId?: string // optional identifier (teacher-assigned or self-entered)
  episodes: Array<{
    id: string
    missions: Array<{
      id: string
      status: 'completed' | 'failed' | 'in-progress' | 'not-started'
      attempts: number
      completedAt?: string // ISO 8601 timestamp
      parameters?: Record<string, number | boolean | string> // parameters used
    }>
  }>
}
```

Export mechanism:

- Student clicks "Export Progress" button (placed in episode UI or global menu)
- Browser serializes localStorage mission data to JSON
- File downloads as `essayons-progress-<timestamp>.json`
- Teacher imports file(s) into progress viewer (client-side parsing only, no upload)

**Why**: JSON is human-readable and debuggable. Teachers can batch-process files with standard tools (jq, Excel). No PII is required — student identifiers are optional and teacher-controlled. Export is entirely client-side, no server involved.

**Alternatives considered:**

- CSV export: Less structured, harder to represent nested mission data
- Binary format: Smaller but opaque to teachers
- Cloud sync: Requires backend and accounts
- Copy-paste JSON: Works but less user-friendly than file download

### Decision 3: Episode Sequence Encoding

Episode sequences (playlists) are encoded in the `LessonPlanConfig.sequence` array:

```json
{
  "version": 1,
  "episodes": [
    { "id": "orbit-lab", "missions": ["mission-1", "mission-2"] },
    { "id": "citizen-lab", "missions": ["mission-1"] }
  ],
  "sequence": ["orbit-lab", "citizen-lab"]
}
```

Student-facing behavior:

- When a lesson plan URL includes a `sequence` field, the episode list is displayed in the specified order
- A "Next Episode" button appears after mission completion, linking to the next episode in the sequence
- Sequence progress is tracked in localStorage (which episode is current)
- Students can skip ahead or go back, but the default flow follows the sequence

**Why**: Simple array encoding keeps the format flat and debuggable. Separate `sequence` field allows teachers to define episode order independently of mission selection (some episodes may be in the sequence but have no missions pre-selected).

**Alternatives considered:**

- Implicit ordering from `episodes` array order: Less explicit, harder to distinguish "sequence" from "set of episodes"
- Graph-based dependencies (episode B unlocks after A): Over-engineered for MVP, most lessons are linear
- Separate URL parameter for sequence: More URL pollution, harder to keep in sync

### Decision 4: QR Code Generation

QR codes are generated client-side using the `qrcode.react` library (MIT license, ~10KB gzipped):

- Teacher generates a lesson plan URL
- QR code is rendered in a `<canvas>` element via `qrcode.react`
- Teacher can download QR code as PNG (right-click save or download button)
- QR code encodes the full lesson plan URL (including the base64 plan parameter)

Error correction level: Medium (M) — balances size vs. robustness for classroom printouts.

**Why**: Client-side generation avoids API dependencies and costs. `qrcode.react` is battle-tested and small. PNG export is universally compatible (printable, embeddable in slides/handouts).

**Alternatives considered:**

- Server-side QR generation: Requires backend
- Third-party QR APIs (qr-code-generator.com): Privacy risk, external dependency, offline failure
- SVG export: Larger file sizes, less compatible with print workflows

### Decision 5: Printable Lesson Plan Format

Lesson plans export as:

1. **Markdown**: Plain text with headings, lists, and fenced code blocks (easy to edit, version control friendly)
2. **HTML**: Styled document with print CSS for browser "Save as PDF" workflow
3. **PDF** (stretch goal): Direct PDF generation via jsPDF (deferred if too heavy)

Markdown structure:

```markdown
# Lesson Plan: [Title]

**Generated**: [Timestamp]
**Shareable Link**: [URL]

## Episodes

### 1. Orbit Lab

**Missions**:

- Mission 1: Achieve orbit
- Mission 2: Rendezvous

**Parameters**:

- Initial velocity: 7.8 km/s
- Altitude: 400 km

**Reference Content**:
[Excerpt from episode reference panel]

---

### 2. Citizen Lab

...
```

**Why**: Markdown is universally readable and editable (teachers can customize). HTML + print CSS leverages browser PDF export (no heavy dependencies). Including the shareable link ensures teachers can always recover the digital version from a printout.

**Alternatives considered:**

- PDF-only: Requires jsPDF (~200KB), not editable
- DOCX export: Complex format, large dependency (docx.js)
- Google Docs export: Requires OAuth and Drive API (conflicts with zero-backend)

### Decision 6: Progress Viewer Aggregation

The progress viewer displays:

- **Table view**: One row per student per episode, columns for mission status, attempts, completion timestamp
- **Detail view**: Click a row to expand and see parameter choices and mission timeline
- **Aggregate view**: Class-wide statistics (% completion per mission, average attempts)

Data model (in-memory, computed from imported JSON files):

```typescript
interface AggregatedProgress {
  students: Array<{
    id: string // from JSON or generated placeholder
    episodes: Array<{
      id: string
      missions: Array<{
        id: string
        status: string
        attempts: number
        completedAt?: string
        parameters?: Record<string, any>
      }>
    }>
  }>
  aggregates: {
    totalStudents: number
    episodeCompletionRates: Record<string, number> // episode ID -> % complete
    missionCompletionRates: Record<string, number> // mission ID -> % complete
    averageAttemptsPerMission: Record<string, number>
  }
}
```

**Why**: Batch import + in-memory processing keeps the workflow simple (no database). Aggregate stats help teachers identify common sticking points. CSV export enables further analysis in tools teachers already use (Excel, Google Sheets).

**Alternatives considered:**

- Server-side aggregation: Requires backend
- Client-side SQLite (sql.js): Over-engineered for small datasets (<100 students)
- Real-time tracking: Requires WebSockets and server infrastructure

## Risks / Trade-offs

- **URL length limits**: Compressed URLs with 10+ episodes may approach 2000 characters. **Mitigation**: Warn teachers when approaching limit; suggest splitting into multiple lesson plans.
- **Browser compatibility**: DEFLATE compression via pako requires modern browsers (IE11 not supported). **Mitigation**: Acceptable for 2025 target audience; provide fallback message for unsupported browsers.
- **QR code size vs. scannability**: Long URLs produce dense QR codes that are hard to scan. **Mitigation**: Use Medium error correction (balances size vs. robustness); recommend large printouts (8.5x11" full page) for classroom display.
- **No student authentication**: Teachers cannot verify which student submitted which progress file. **Mitigation**: Optional student identifier field in export; teachers can assign identifiers manually (honor system for MVP).
- **Privacy of progress files**: JSON files contain mission parameters and timestamps. **Mitigation**: Clearly document that files are local-only; no upload required; teachers control distribution.

## Migration Plan

This is a greenfield addition — no existing code to migrate. The teacher dashboard is introduced as:

- New route: `src/App.tsx` adds `/#/teach`
- New page: `src/pages/TeacherDashboard.tsx`
- New components: `src/components/teacher/` directory
- New utilities: `src/utils/url-encoding.ts`, `src/utils/progress-parser.ts`

Existing landing page is updated to link to `/#/teach` from the "For Educators" section.

**Rollback**: Delete teacher dashboard route, page, and components. Remove link from landing page. No other code depends on these files at creation time.

## Open Questions

- **LMS integration**: Should lesson plan URLs be exportable in LTI or SCORM format for future LMS compatibility? Deferred — most teachers share via URL/QR for MVP.
- **Student identifier scheme**: Should the platform provide a built-in ID assignment UI, or rely on teachers to assign IDs externally? Deferred — honor system (optional text field in export) is sufficient for MVP.
- **Real-time progress tracking**: Should a future version support WebSocket-based live progress? Deferred — requires backend and conflicts with privacy-first design.
- **Lesson plan sharing repository**: Should teachers be able to share lesson plans with each other (public gallery)? Deferred — URLs are already shareable; curated gallery requires moderation.

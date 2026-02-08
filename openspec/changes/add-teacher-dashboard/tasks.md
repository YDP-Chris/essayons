## 1. Foundation

- [ ] 1.1 Add teacher dashboard route to `src/App.tsx` at `/#/teach`
- [ ] 1.2 Create `src/pages/TeacherDashboard.tsx` page component that composes all teacher tools
- [ ] 1.3 Update landing page "For Educators" section to link to `/#/teach`

## 2. URL Encoding Utility

- [ ] 2.1 Create `src/utils/url-encoding.ts` with functions to encode/decode lesson plan configurations to URL-safe base64
- [ ] 2.2 Define `LessonPlanConfig` TypeScript interface: episodes, missions, parameter presets, sequence order
- [ ] 2.3 Add compression for long URLs using DEFLATE or similar algorithm
- [ ] 2.4 Write unit tests for encode/decode with round-trip verification

## 3. Classroom Link Generator

- [ ] 3.1 Create `LinkGenerator` component with episode multi-select (checkboxes for all available episodes)
- [ ] 3.2 Add mission selection UI (per-episode mission checkboxes)
- [ ] 3.3 Add parameter preset UI (dropdowns or inputs for common parameter values per episode)
- [ ] 3.4 Implement "Generate Link" action that encodes selections into shareable URL
- [ ] 3.5 Display generated URL in a copyable text field with "Copy to Clipboard" button
- [ ] 3.6 Add preview mode: click generated link to preview student experience

## 4. Episode Sequence Builder

- [ ] 4.1 Create `SequenceBuilder` component with drag-and-drop episode reordering
- [ ] 4.2 Display selected episodes as a visual playlist with numbered order
- [ ] 4.3 Encode sequence order in generated URLs (append sequence metadata to lesson plan config)
- [ ] 4.4 Add "Start Sequence" action: student-facing URLs respect the order in a multi-episode flow
- [ ] 4.5 Add controls to add/remove episodes from sequence

## 5. Student Progress Viewer

- [ ] 5.1 Create `ProgressViewer` component with file upload input for JSON
- [ ] 5.2 Create `src/utils/progress-parser.ts` to parse localStorage exports (validate schema, extract mission completion, parameter history)
- [ ] 5.3 Display summary table: student identifier (optional), episode, mission status (completed/failed/in-progress), attempt count
- [ ] 5.4 Add detail view: click a student row to see parameter choices and mission timeline
- [ ] 5.5 Handle multiple student JSON files (bulk upload or drag-and-drop multiple files)
- [ ] 5.6 Add export button to download aggregated progress as CSV for spreadsheet analysis

## 6. Printable Lesson Plan

- [ ] 6.1 Create `LessonPlanExport` component that generates markdown/HTML summary from selected episodes
- [ ] 6.2 Include episode names, missions, reference content snippets, and parameter descriptions
- [ ] 6.3 Add "Download as Markdown" and "Download as PDF" actions (PDF via browser print)
- [ ] 6.4 Ensure print styles are clean and readable (remove UI chrome, optimize margins)
- [ ] 6.5 Include generated shareable link at top of exported lesson plan

## 7. QR Code Generation

- [ ] 7.1 Create `QRCodeDisplay` component using a zero-dependency QR library (qrcode.react or canvas-based)
- [ ] 7.2 Generate QR code from the shareable URL when link is created
- [ ] 7.3 Display QR code in modal or sidebar with "Download QR Code" (PNG export)
- [ ] 7.4 Add scale/size controls for QR code (small for handouts, large for classroom display)
- [ ] 7.5 Include short URL display beneath QR code for manual entry fallback

## 8. Responsive Layout

- [ ] 8.1 Implement responsive layout for teacher dashboard (mobile-first, tablet and desktop breakpoints)
- [ ] 8.2 Ensure link generator and sequence builder are usable on tablet devices
- [ ] 8.3 Progress viewer table should scroll horizontally on narrow viewports
- [ ] 8.4 Test layout across 768px (tablet) and 1024px (desktop) breakpoints

## 9. Accessibility

- [ ] 9.1 Verify full keyboard navigation through all teacher dashboard tools
- [ ] 9.2 Ensure file upload controls have accessible labels and error messaging
- [ ] 9.3 Add ARIA attributes for drag-and-drop sequence builder (announce order changes)
- [ ] 9.4 Test with screen reader (VoiceOver or NVDA) for logical reading order
- [ ] 9.5 Run axe or Lighthouse accessibility audit and fix all AA violations

## 10. Testing

- [ ] 10.1 Write component tests for LinkGenerator, SequenceBuilder, ProgressViewer, LessonPlanExport, QRCodeDisplay
- [ ] 10.2 Write unit tests for URL encoding/decoding utility with edge cases (empty config, maximum length)
- [ ] 10.3 Write unit tests for progress parser with valid and invalid JSON schemas
- [ ] 10.4 Write E2E test: navigate to teacher dashboard, generate link, copy to clipboard, verify URL format
- [ ] 10.5 Write E2E test: upload student progress JSON, verify display of mission status
- [ ] 10.6 Write E2E test: build episode sequence, verify order encoded in URL

## ADDED Requirements

### Requirement: Teacher Dashboard Page

The teacher dashboard SHALL be accessible at the route `/#/teach`. The page MUST include a navigation bar with the Essayons wordmark and a link back to the landing page. The page MUST display all teacher tools: classroom link generator, episode sequence builder, student progress viewer, printable lesson plan exporter, and QR code display. The layout MUST be responsive and usable on tablet devices (768px and above).

#### Scenario: Teacher navigates to dashboard

- **WHEN** a teacher navigates to `/#/teach`
- **THEN** the teacher dashboard page loads and displays the navigation bar, classroom link generator, episode sequence builder, student progress viewer, lesson plan exporter, and QR code display sections

#### Scenario: Navigation to landing page

- **WHEN** a teacher activates the Essayons wordmark or back link in the navigation bar
- **THEN** the user is navigated back to the landing page

#### Scenario: Responsive layout on tablet

- **WHEN** the viewport width is 768px or above
- **THEN** all teacher tools are displayed in a readable layout with appropriate spacing and no horizontal scroll

### Requirement: Classroom Link Generator

The teacher dashboard SHALL provide a classroom link generator that allows teachers to select episodes, missions, and parameter presets, and generate a shareable URL encoding all selections. The generator MUST display a multi-select interface for all available episodes. For each selected episode, the generator MUST display checkboxes for available missions and input fields for parameter presets. The generator MUST include a "Generate Link" button that encodes the configuration into a URL-safe base64-compressed string and displays the resulting shareable URL in a copyable text field.

#### Scenario: Select episodes and generate link

- **WHEN** a teacher selects two episodes (Orbit Lab and Citizen Lab), selects specific missions for each, and clicks "Generate Link"
- **THEN** a shareable URL is generated with the format `https://essayons.app/#/teach?plan=<base64-encoded-compressed-json>` and displayed in a copyable text field

#### Scenario: Copy link to clipboard

- **WHEN** a teacher clicks the "Copy to Clipboard" button next to the generated link
- **THEN** the URL is copied to the system clipboard and a confirmation message is displayed

#### Scenario: Preview generated link

- **WHEN** a teacher clicks a "Preview" button or link next to the generated URL
- **THEN** a new tab or window opens with the student-facing episode page pre-configured with the selected missions and parameters

#### Scenario: No episodes selected

- **WHEN** a teacher attempts to generate a link without selecting any episodes
- **THEN** an error message is displayed prompting the teacher to select at least one episode

### Requirement: Episode Sequence Builder

The teacher dashboard SHALL provide an episode sequence builder that allows teachers to order selected episodes into a playlist. The builder MUST display selected episodes as a visual list with numbered order. The builder MUST support drag-and-drop reordering of episodes in the sequence. The builder MUST encode the sequence order in the generated URL as part of the lesson plan configuration.

#### Scenario: Reorder episodes in sequence

- **WHEN** a teacher drags Episode 2 (Citizen Lab) above Episode 1 (Orbit Lab) in the sequence builder
- **THEN** the sequence order updates to show Citizen Lab as position 1 and Orbit Lab as position 2, and the updated order is encoded in the generated URL

#### Scenario: Add episode to sequence

- **WHEN** a teacher selects a new episode from the episode multi-select
- **THEN** the episode is automatically added to the end of the sequence list

#### Scenario: Remove episode from sequence

- **WHEN** a teacher clicks a "Remove" button next to an episode in the sequence list
- **THEN** the episode is removed from the sequence and deselected in the episode multi-select

#### Scenario: Student follows sequence flow

- **WHEN** a student opens a lesson plan URL with a sequence defined and completes a mission in the first episode
- **THEN** a "Next Episode" button appears that navigates the student to the next episode in the sequence

### Requirement: Student Progress Viewer

The teacher dashboard SHALL provide a student progress viewer that accepts JSON file uploads containing student progress exports. The viewer MUST parse uploaded JSON files and validate them against the expected schema. The viewer MUST display a summary table with columns for student identifier (if provided), episode, mission status (completed/failed/in-progress/not-started), attempt count, and completion timestamp. The viewer MUST support bulk upload of multiple JSON files (either via file input or drag-and-drop). The viewer MUST include a detail view that displays parameter choices and mission timeline when a teacher clicks a student row.

#### Scenario: Upload single student progress file

- **WHEN** a teacher uploads a single JSON file with valid student progress data
- **THEN** the progress viewer displays a table row for the student with episode, mission status, attempts, and completion timestamp

#### Scenario: Upload multiple student progress files

- **WHEN** a teacher drag-and-drops five JSON files into the progress viewer upload area
- **THEN** the progress viewer parses all five files and displays a table with one row per student per episode

#### Scenario: Invalid JSON file uploaded

- **WHEN** a teacher uploads a JSON file that does not match the expected schema
- **THEN** an error message is displayed indicating the file is invalid and listing which fields are missing or malformed

#### Scenario: View student detail

- **WHEN** a teacher clicks a student row in the progress table
- **THEN** a detail panel expands or opens showing the parameter values used by the student and a timeline of mission attempts

#### Scenario: Export aggregated progress as CSV

- **WHEN** a teacher clicks an "Export as CSV" button in the progress viewer
- **THEN** a CSV file downloads containing all student progress data with columns for student ID, episode, mission, status, attempts, and timestamp

#### Scenario: Aggregate statistics displayed

- **WHEN** progress data from multiple students is loaded
- **THEN** the progress viewer displays aggregate statistics including total students, episode completion rates, mission completion rates, and average attempts per mission

### Requirement: Printable Lesson Plan Exporter

The teacher dashboard SHALL provide a printable lesson plan exporter that generates markdown and HTML summaries of selected episodes. The exporter MUST include episode names, selected missions, reference content excerpts, and parameter descriptions. The exporter MUST include the shareable URL at the top of the exported document. The exporter MUST provide "Download as Markdown" and "Download as PDF" actions (PDF via browser print dialog with optimized print styles).

#### Scenario: Export lesson plan as markdown

- **WHEN** a teacher clicks "Download as Markdown" after generating a lesson plan
- **THEN** a markdown file downloads with the format `essayons-lesson-plan-<timestamp>.md` containing episode names, missions, parameters, reference content excerpts, and the shareable URL

#### Scenario: Export lesson plan as PDF

- **WHEN** a teacher clicks "Download as PDF"
- **THEN** the browser print dialog opens with a styled HTML document optimized for printing, allowing the teacher to save as PDF

#### Scenario: Markdown includes shareable link

- **WHEN** a teacher opens the downloaded markdown file
- **THEN** the shareable URL is displayed prominently at the top of the document for easy recovery of the digital version

#### Scenario: Print styles remove UI chrome

- **WHEN** a teacher prints the lesson plan HTML
- **THEN** all non-essential UI elements (navigation, buttons, sidebars) are hidden via print CSS, and margins are optimized for readability

### Requirement: QR Code Generation

The teacher dashboard SHALL provide a QR code display that generates a QR code from the shareable lesson plan URL. The QR code MUST be rendered client-side using a zero-dependency or minimal-dependency library. The QR code MUST be displayed in a modal or sidebar when a lesson plan link is generated. The QR code MUST be downloadable as a PNG image. The QR code display MUST include scale/size controls for different use cases (small for handouts, large for classroom display).

#### Scenario: QR code generated from link

- **WHEN** a teacher generates a lesson plan link
- **THEN** a QR code is displayed encoding the full shareable URL

#### Scenario: Download QR code as PNG

- **WHEN** a teacher clicks "Download QR Code"
- **THEN** a PNG image of the QR code downloads with the filename `essayons-qr-<timestamp>.png`

#### Scenario: Adjust QR code size

- **WHEN** a teacher selects "Large (Classroom Display)" from the size control dropdown
- **THEN** the QR code is re-rendered at a larger size suitable for printing on 8.5x11" paper

#### Scenario: Short URL displayed beneath QR code

- **WHEN** the QR code is displayed
- **THEN** the shareable URL is also displayed as text beneath the QR code for manual entry fallback

### Requirement: URL Encoding and Compression

The teacher dashboard SHALL encode lesson plan configurations as URL-safe base64-encoded, DEFLATE-compressed JSON strings. The encoding utility MUST define a `LessonPlanConfig` TypeScript interface with fields for version, title, episodes (with missions and parameters), and sequence order. The utility MUST serialize the configuration to JSON, compress it using DEFLATE (pako library), encode it as URL-safe base64, and append it to the URL as a `plan` query parameter. The utility MUST provide a decoding function that reverses the process and validates the schema version.

#### Scenario: Encode lesson plan to URL

- **WHEN** a teacher generates a lesson plan with 3 episodes and 10 missions
- **THEN** the resulting URL is under 2000 characters and includes a `?plan=<base64>` parameter

#### Scenario: Decode URL to lesson plan

- **WHEN** a student opens a lesson plan URL with a `?plan=<base64>` parameter
- **THEN** the configuration is decoded, decompressed, and parsed into a `LessonPlanConfig` object, and the episodes and missions are pre-configured as specified

#### Scenario: Schema version validation

- **WHEN** a URL with an unsupported schema version is decoded
- **THEN** an error message is displayed indicating the lesson plan was created with a newer or incompatible version

#### Scenario: URL length warning

- **WHEN** a teacher generates a lesson plan and the resulting URL exceeds 1800 characters (approaching the 2000-character safe limit)
- **THEN** a warning message is displayed suggesting the teacher split the lesson plan into multiple smaller plans

### Requirement: Student Progress Export

Students SHALL have access to an "Export Progress" button in the episode UI or global navigation. When activated, the button MUST serialize the student's localStorage mission data to a JSON file conforming to the `StudentProgressExport` schema and trigger a browser download. The export MUST include a version number, export timestamp, optional student identifier, and an array of episodes with mission statuses, attempt counts, completion timestamps, and parameter values. The export MUST not require server upload and MUST be entirely client-side.

#### Scenario: Student exports progress

- **WHEN** a student clicks "Export Progress" in the episode UI
- **THEN** a JSON file named `essayons-progress-<timestamp>.json` downloads containing the student's mission data

#### Scenario: Export includes optional student ID

- **WHEN** a student enters an identifier (e.g., "Student 42") in an optional field before exporting
- **THEN** the exported JSON includes a `studentId` field with the value "Student 42"

#### Scenario: Export is client-side only

- **WHEN** a student exports progress
- **THEN** no network requests are made and the data never leaves the student's browser

#### Scenario: Export conforms to schema

- **WHEN** a teacher uploads an exported progress file to the progress viewer
- **THEN** the file is successfully parsed and validated against the `StudentProgressExport` schema

### Requirement: Accessibility and Keyboard Navigation

The teacher dashboard and all its components MUST support full keyboard navigation. All interactive elements MUST be reachable via Tab key and activatable via Enter or Space. The drag-and-drop sequence builder MUST include accessible alternatives (arrow key reordering or move-up/move-down buttons). File upload controls MUST have accessible labels and error messaging. The dashboard MUST pass WCAG AA accessibility audit with no critical violations.

#### Scenario: Keyboard navigation through dashboard

- **WHEN** a teacher presses Tab from the top of the teacher dashboard page
- **THEN** focus moves sequentially through the navigation bar, link generator, sequence builder, progress viewer, lesson plan exporter, and QR code display in a logical order

#### Scenario: Accessible drag-and-drop alternative

- **WHEN** a teacher uses arrow keys or "Move Up"/"Move Down" buttons in the sequence builder
- **THEN** episodes are reordered in the sequence and screen readers announce the new position

#### Scenario: File upload accessible error

- **WHEN** a teacher uploads an invalid JSON file
- **THEN** the error message is announced by screen readers and associated with the file input via `aria-describedby`

#### Scenario: WCAG AA compliance

- **WHEN** the teacher dashboard is tested with axe or Lighthouse accessibility audit
- **THEN** no WCAG AA violations are reported

### Requirement: Landing Page Integration

The landing page SHALL include a link to the teacher dashboard in the "For Educators" section. The link MUST be labeled "Teacher Tools" or "Classroom Dashboard" and MUST navigate to `/#/teach`. The link MUST be styled consistently with other call-to-action elements on the landing page.

#### Scenario: Landing page links to teacher dashboard

- **WHEN** a teacher visits the landing page and clicks the "Teacher Tools" link in the "For Educators" section
- **THEN** the user is navigated to `/#/teach` and the teacher dashboard page loads

#### Scenario: Link is keyboard accessible

- **WHEN** a teacher uses the keyboard to navigate the landing page
- **THEN** the "Teacher Tools" link is focusable and activatable via Enter key

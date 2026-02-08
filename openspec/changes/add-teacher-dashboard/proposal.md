# Change: Add Teacher Dashboard

## Why

Teachers need a frictionless way to deploy Essayons in classrooms without requiring student accounts or server infrastructure. Currently, there's no dedicated workflow for educators to curate episode sequences, generate shareable classroom links, or review student progress. A teacher-focused dashboard enables instant classroom deployment while maintaining the zero-backend, privacy-first design principles.

## What Changes

- Add a classroom link generator: teachers select episodes, missions, and parameter presets to generate shareable URLs (all state encoded in URL, no backend)
- Add an episode sequence builder: order episodes into a "playlist" or lesson plan, encoded in the URL
- Add a student progress viewer: teachers import JSON exports from student devices (localStorage data) to review mission completion and parameter choices
- Add a printable lesson plan generator: create markdown/HTML summary of selected episodes with missions and reference content for offline use
- Add QR code generation: encode share URLs as QR codes for easy classroom display and student device access
- All data stays client-side: no accounts, no authentication, no server calls — URL encoding + localStorage exports only
- Add route at `/#/teach` accessible from the landing page "For Educators" section

## Impact

- Affected specs: `teacher-dashboard` (new capability)
- Affected code: `src/pages/TeacherDashboard.tsx` (new), `src/components/teacher/` (new directory for LinkGenerator, SequenceBuilder, ProgressViewer, LessonPlanExport, QRCodeDisplay components), `src/App.tsx` (route addition), `src/utils/url-encoding.ts` (new utility for encoding lesson plans in URLs), `src/utils/progress-parser.ts` (new utility for parsing student localStorage JSON exports)

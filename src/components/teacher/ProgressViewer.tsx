/**
 * Student progress viewer component.
 *
 * Allows teachers to upload student progress JSON files and view
 * a summary table of mission completion data, with CSV export.
 */

import { useState, useCallback } from 'react'
import type { StudentProgressRow } from '@/utils/progress-parser.ts'
import { parseProgressJson, exportToCsv } from '@/utils/progress-parser.ts'

export function ProgressViewer() {
  const [rows, setRows] = useState<readonly StudentProgressRow[]>([])
  const [errors, setErrors] = useState<readonly string[]>([])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const allRows: StudentProgressRow[] = []
    const allErrors: string[] = []
    let filesProcessed = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          const studentId = file.name.replace(/\.json$/i, '')
          const result = parseProgressJson(content, studentId)
          if (result.success) {
            allRows.push(...result.rows)
          } else {
            allErrors.push(`${file.name}: ${result.error ?? 'Unknown error'}`)
          }
        }
        filesProcessed++
        if (filesProcessed === files.length) {
          setRows(allRows)
          setErrors(allErrors)
        }
      }
      reader.readAsText(file)
    }
  }, [])

  const handleExportCsv = useCallback(() => {
    if (rows.length === 0) return
    const csv = exportToCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'student-progress.csv'
    link.click()
    URL.revokeObjectURL(url)
  }, [rows])

  return (
    <section className="progress-viewer" aria-labelledby="progress-heading">
      <h2 id="progress-heading" className="progress-viewer__heading">
        Student Progress Viewer
      </h2>

      <div className="progress-viewer__upload">
        <label htmlFor="progress-file" className="progress-viewer__label">
          Upload student progress JSON files
        </label>
        <input
          id="progress-file"
          type="file"
          accept=".json"
          multiple
          className="progress-viewer__file-input"
          onChange={handleFileUpload}
        />
      </div>

      {errors.length > 0 && (
        <div className="progress-viewer__errors" role="alert">
          <p className="progress-viewer__errors-title">Errors:</p>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="progress-viewer__table-wrap">
            <table className="progress-viewer__table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Episode</th>
                  <th>Completed Missions</th>
                  <th>Total Completed</th>
                  <th>Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.studentId}</td>
                    <td>{row.episodeId}</td>
                    <td>{row.completedMissions.join(', ') || 'None'}</td>
                    <td>{row.totalMissions}</td>
                    <td>{row.lastVisit ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="progress-viewer__export-btn" onClick={handleExportCsv}>
            Export as CSV
          </button>
        </>
      )}
    </section>
  )
}

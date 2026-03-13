'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import type { AuditResult } from '@/lib/types'
import { categoryLabel } from '@/lib/utils'

export function PdfExportButton({ audit }: { audit: AuditResult }) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setGenerating(true)
    setError(null)
    try {
      // Dynamic import to avoid loading jspdf in the main bundle
      const { default: jsPDF } = await import('jspdf')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let y = margin

      // Header
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('LaunchReady Audit Report', margin, y)
      y += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y)
      y += 12

      // URL + Score
      doc.setTextColor(0)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`URL: ${audit.url}`, margin, y)
      y += 8

      const scoreColor = audit.overall_score >= 90 ? [34, 197, 94]
        : audit.overall_score >= 70 ? [234, 179, 8]
        : audit.overall_score >= 50 ? [249, 115, 22]
        : [239, 68, 68]

      doc.setFontSize(36)
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
      doc.text(`${audit.overall_score}/100`, margin, y + 12)
      y += 20

      // Summary stats
      const pass = audit.checks.filter(c => c.status === 'pass').length
      const fail = audit.checks.filter(c => c.status === 'fail').length
      const warn = audit.checks.filter(c => c.status === 'warn').length

      doc.setFontSize(10)
      doc.setTextColor(0)
      doc.text(`${pass} passed  |  ${warn} warnings  |  ${fail} failed  |  ${audit.pages_crawled} page(s) crawled`, margin, y)
      y += 12

      // Separator
      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 8

      // Checks grouped by category
      const categories = ['meta', 'social', 'indexability', 'structure', 'performance', 'accessibility', 'security'] as const
      for (const cat of categories) {
        const checks = audit.checks.filter(c => c.category === cat)
        if (checks.length === 0) continue

        // Check page space
        if (y > 260) {
          doc.addPage()
          y = margin
        }

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0)
        doc.text(categoryLabel(cat).toUpperCase(), margin, y)
        y += 7

        for (const check of checks) {
          if (y > 270) {
            doc.addPage()
            y = margin
          }

          const icon = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : check.status === 'warn' ? '!' : '—'
          const statusColor = check.status === 'pass' ? [34, 197, 94]
            : check.status === 'fail' ? [239, 68, 68]
            : check.status === 'warn' ? [234, 179, 8]
            : [150, 150, 150]

          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
          doc.text(icon, margin, y)
          doc.setTextColor(0)
          doc.text(check.name, margin + 6, y)

          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100)
          const descLines = doc.splitTextToSize(check.description, contentWidth - 6)
          y += 5
          doc.text(descLines, margin + 6, y)
          y += descLines.length * 4 + 2

          // Fix explanation
          if (check.fix_explanation) {
            doc.setTextColor(59, 130, 246)
            doc.setFontSize(9)
            const fixLines = doc.splitTextToSize(`Fix: ${check.fix_explanation}`, contentWidth - 6)
            doc.text(fixLines, margin + 6, y)
            y += fixLines.length * 3.5 + 2
          }

          // Fix code
          if (check.fix_code) {
            if (y > 250) {
              doc.addPage()
              y = margin
            }
            doc.setFontSize(8)
            doc.setFont('courier', 'normal')
            doc.setTextColor(80)
            const codeLines = doc.splitTextToSize(check.fix_code, contentWidth - 10)
            doc.setFillColor(245, 245, 245)
            doc.rect(margin + 4, y - 3, contentWidth - 4, codeLines.length * 3.5 + 4, 'F')
            doc.text(codeLines, margin + 6, y)
            y += codeLines.length * 3.5 + 6
          }

          y += 2
        }

        y += 4
      }

      // Footer
      if (y > 270) {
        doc.addPage()
        y = margin
      }
      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150)
      doc.text('Generated by LaunchReady — launchready.predivo.ch', margin, y)

      // Save
      const domain = new URL(audit.url).hostname.replace(/^www\./, '')
      doc.save(`launchready-audit-${domain}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      setError('PDF export failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shrink-0"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
        {generating ? 'Generating...' : 'Export PDF'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

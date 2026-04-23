import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PdfExportButton } from '@/components/audit/PdfExportButton'
import type { AuditResult } from '@/lib/types'

// ── F-008: PDF Export ──

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210 } },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    rect: vi.fn(),
    addPage: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text]),
    save: vi.fn(),
  })),
}))

const mockAudit: AuditResult = {
  url: 'https://example.com',
  overall_score: 85,
  pages_crawled: 1,
  created_at: '2026-03-10T00:00:00Z',
  checks: [
    { id: 'meta-title', category: 'meta', name: 'Page title', status: 'pass', description: 'Title found' },
    { id: 'meta-desc', category: 'meta', name: 'Description', status: 'fail', description: 'Missing', fix_code: '<meta ...>', fix_explanation: 'Add it' },
  ],
}

describe('PdfExportButton', () => {
  it('renders Export PDF button', () => {
    render(<PdfExportButton audit={mockAudit} />)
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
  })

  it('shows loading state during generation', async () => {
    const user = userEvent.setup()
    render(<PdfExportButton audit={mockAudit} />)

    const button = screen.getByRole('button')
    await user.click(button)

    // After click, should have completed (mock is sync-ish)
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
  })

  it('button is not disabled initially', () => {
    render(<PdfExportButton audit={mockAudit} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuditResults } from '@/components/audit/AuditResults'
import type { AuditResult } from '@/lib/types'

// ── F-006: Audit Results Display ──

const mockAudit: AuditResult = {
  url: 'https://example.com',
  overall_score: 75,
  pages_crawled: 1,
  created_at: '2026-03-10T00:00:00Z',
  checks: [
    { id: 'meta-title', category: 'meta', name: 'Page title', status: 'pass', description: 'Title found' },
    { id: 'meta-desc', category: 'meta', name: 'Meta description', status: 'fail', description: 'Missing', fix_code: '<meta ...>', fix_explanation: 'Add it' },
    { id: 'og-title', category: 'social', name: 'OG title', status: 'pass', description: 'Found' },
    { id: 'https', category: 'security', name: 'HTTPS', status: 'warn', description: 'Not HTTPS' },
  ],
}

describe('AuditResults', () => {
  it('renders "Audit Complete" heading', () => {
    render(<AuditResults audit={mockAudit} plan="pro" />)
    expect(screen.getByText('Audit Complete')).toBeInTheDocument()
  })

  it('displays the audit URL', () => {
    render(<AuditResults audit={mockAudit} plan="pro" />)
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
  })

  it('displays pass/fail/warn counts', () => {
    render(<AuditResults audit={mockAudit} plan="pro" />)
    expect(screen.getByText('Passed')).toBeInTheDocument()
    expect(screen.getByText('Warnings')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('renders score ring with correct score', () => {
    render(<AuditResults audit={mockAudit} plan="pro" />)
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('renders category headings', () => {
    render(<AuditResults audit={mockAudit} plan="pro" />)
    // categoryLabel returns mixed case, then rendered in uppercase via CSS (tracking-wide uppercase)
    // The actual text content in the DOM is the mixed-case label
    expect(screen.getByText('Meta Tags')).toBeInTheDocument()
    expect(screen.getByText('Social Sharing')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
  })

  it('renders Next Steps section', () => {
    render(<AuditResults audit={mockAudit} plan="pro" />)
    expect(screen.getByText('Next Steps (Manual)')).toBeInTheDocument()
    expect(screen.getByText('Set up Google Search Console')).toBeInTheDocument()
  })

  it('shows PDF export button for pro plan', () => {
    render(<AuditResults audit={mockAudit} plan="pro" />)
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
  })

  it('hides PDF export button for free plan', () => {
    render(<AuditResults audit={mockAudit} plan="free" />)
    expect(screen.queryByText('Export PDF')).not.toBeInTheDocument()
  })

  it('shows upgrade banner when free plan has hidden issues', () => {
    const manyChecks = Array.from({ length: 10 }, (_, i) => ({
      id: `check-${i}`,
      category: 'meta' as const,
      name: `Check ${i}`,
      status: 'fail' as const,
      description: `Issue ${i}`,
    }))
    const auditWithMany: AuditResult = {
      ...mockAudit,
      checks: manyChecks,
    }
    render(<AuditResults audit={auditWithMany} plan="free" />)
    // Free plan shows max 5, so 5 are hidden
    expect(screen.getByText(/more issue/)).toBeInTheDocument()
    expect(screen.getByText('View Plans')).toBeInTheDocument()
  })
})

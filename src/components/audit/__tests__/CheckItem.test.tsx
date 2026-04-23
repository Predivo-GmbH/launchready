import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckItem } from '@/components/audit/CheckItem'
import type { AuditCheck } from '@/lib/types'

// ── F-007: Check Item ──

const passCheck: AuditCheck = {
  id: 'meta-title',
  category: 'meta',
  name: 'Page title',
  status: 'pass',
  description: 'Title found: "Example"',
}

const failCheck: AuditCheck = {
  id: 'meta-desc',
  category: 'meta',
  name: 'Meta description',
  status: 'fail',
  description: 'Missing or too short meta description',
  details: 'Should be 120-160 characters',
  fix_code: '<meta name="description" content="..." />',
  fix_explanation: 'Add a meta description tag.',
  fix_location: 'Inside <head> tag',
}

const warnCheck: AuditCheck = {
  id: 'heading-h1',
  category: 'structure',
  name: 'H1 heading',
  status: 'warn',
  description: '3 H1 headings found',
}

describe('CheckItem', () => {
  it('renders check name and description', () => {
    render(<CheckItem check={passCheck} />)
    expect(screen.getByText('Page title')).toBeInTheDocument()
    expect(screen.getByText('Title found: "Example"')).toBeInTheDocument()
  })

  it('renders pass check with correct structure', () => {
    const { container } = render(<CheckItem check={passCheck} />)
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('fail checks start expanded', () => {
    render(<CheckItem check={failCheck} />)
    // Fail checks auto-expand, so details should be visible
    expect(screen.getByText('Should be 120-160 characters')).toBeInTheDocument()
  })

  it('shows fix code for unlocked checks', () => {
    render(<CheckItem check={failCheck} locked={false} />)
    expect(screen.getByText('Add a meta description tag.')).toBeInTheDocument()
    expect(screen.getByText('Copy-paste fix')).toBeInTheDocument()
  })

  it('shows locked overlay for free tier', () => {
    render(<CheckItem check={failCheck} locked={true} />)
    expect(screen.getByText('Unlock Fix Code')).toBeInTheDocument()
  })

  it('toggles expansion on click', async () => {
    const user = userEvent.setup()
    render(<CheckItem check={warnCheck} />)

    // Warn checks start collapsed (no extra content anyway)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('has aria-expanded attribute on checks with details', () => {
    render(<CheckItem check={failCheck} />)
    // Fail check renders both a toggle button and a CopyButton; use aria-controls to find the toggle
    const toggleButton = screen.getByRole('button', { expanded: true })
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    expect(toggleButton).toHaveAttribute('aria-controls', `check-details-${failCheck.id}`)
  })

  it('shows fix location when available', () => {
    render(<CheckItem check={failCheck} locked={false} />)
    expect(screen.getByText('Inside <head> tag')).toBeInTheDocument()
  })
})

export type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip'

export type CheckCategory =
  | 'meta'
  | 'social'
  | 'indexability'
  | 'performance'
  | 'accessibility'
  | 'security'
  | 'structure'

export interface AuditCheck {
  id: string
  category: CheckCategory
  name: string
  status: CheckStatus
  description: string
  details?: string
  fix_code?: string
  fix_explanation?: string
  fix_location?: string
}

export interface LighthouseScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

export interface AuditResult {
  url: string
  overall_score: number
  lighthouse?: LighthouseScores
  checks: AuditCheck[]
  pages_crawled: number
  created_at: string
}

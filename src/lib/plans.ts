export type PlanId = 'free' | 'starter' | 'pro'

export interface PlanLimits {
  auditsPerMonth: number // -1 = unlimited
  maxIssuesShown: number // -1 = all
  showFixCode: boolean
  pdfExport: boolean
  monitoring: boolean
  maxMonitoredSites: number
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    auditsPerMonth: 1,
    maxIssuesShown: 5,
    showFixCode: false,
    pdfExport: false,
    monitoring: false,
    maxMonitoredSites: 0,
  },
  starter: {
    auditsPerMonth: -1,
    maxIssuesShown: -1,
    showFixCode: true,
    pdfExport: false,
    monitoring: false,
    maxMonitoredSites: 0,
  },
  pro: {
    auditsPerMonth: -1,
    maxIssuesShown: -1,
    showFixCode: true,
    pdfExport: true,
    monitoring: true,
    maxMonitoredSites: 5,
  },
}

export interface PlanInfo {
  id: PlanId
  name: string
  price: string
  priceNote?: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}

export const PLANS: PlanInfo[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'See your score and top issues',
    features: [
      '1 audit per month',
      'Overall score + category breakdown',
      'Top 5 issues listed',
      'No fix code or AI suggestions',
    ],
    cta: 'Get Started',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    priceNote: '/month',
    description: 'Full audit with copy-paste fixes',
    features: [
      'Unlimited audits',
      'All issues with full details',
      'AI-generated fix code',
      'Plain-English explanations',
      'Guided walkthroughs',
      'Re-audit on demand',
    ],
    cta: 'Coming Soon',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$39',
    priceNote: '/month',
    description: 'Monitoring, alerts & PDF reports',
    features: [
      'Everything in Starter',
      'Weekly automated re-audits',
      'Score change alerts',
      'White-label PDF reports',
      'Up to 5 monitored sites',
      'Audit history & trends',
    ],
    cta: 'Coming Soon',
  },
]

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-500'
  if (score >= 70) return 'text-yellow-500'
  if (score >= 50) return 'text-orange-500'
  return 'text-red-500'
}

export function scoreRingColor(score: number): string {
  if (score >= 90) return 'text-green-500 stroke-green-500'
  if (score >= 70) return 'text-yellow-500 stroke-yellow-500'
  if (score >= 50) return 'text-orange-500 stroke-orange-500'
  return 'text-red-500 stroke-red-500'
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    meta: 'Meta Tags',
    social: 'Social Sharing',
    indexability: 'Indexability',
    performance: 'Performance',
    accessibility: 'Accessibility',
    security: 'Security',
    structure: 'Site Structure',
  }
  return labels[cat] || cat
}

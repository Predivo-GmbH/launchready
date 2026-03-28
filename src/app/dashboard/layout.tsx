import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — LaunchReady',
  description: 'View your website audit history and results.',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}

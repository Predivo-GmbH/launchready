import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/landing/Hero'
import { HowItWorks } from './components/landing/HowItWorks'
import { Comparison } from './components/landing/Comparison'
import { AuditResults } from './components/audit/AuditResults'
import { AuditProgress } from './components/audit/AuditProgress'
import { useAudit } from './hooks/useAudit'

export default function App() {
  const { audit, loading, error, runAudit } = useAudit()

  const showResults = audit?.status === 'complete'
  const showProgress = loading || audit?.status === 'running'

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Header />

      <main className="flex-1">
        {showResults && audit ? (
          <div className="py-12 px-4">
            <AuditResults audit={audit} />
          </div>
        ) : showProgress && audit ? (
          <AuditProgress url={audit.url} checksComplete={audit.checks.length} />
        ) : (
          <>
            <div id="audit">
              <Hero onSubmit={runAudit} loading={loading} />
            </div>

            {error && (
              <div className="max-w-2xl mx-auto px-4 -mt-8 mb-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
                  {error}
                </div>
              </div>
            )}

            <div id="how-it-works">
              <HowItWorks />
            </div>
            <Comparison />
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

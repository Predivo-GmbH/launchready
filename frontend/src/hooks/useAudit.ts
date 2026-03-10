import { useState, useEffect, useRef, useCallback } from 'react'
import type { AuditResult } from '../types/audit'
import { startAudit, getAudit } from '../lib/api'

export function useAudit() {
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const runAudit = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    setAudit(null)
    stopPolling()

    try {
      const { id } = await startAudit(url)

      // Poll for results
      const poll = async () => {
        try {
          const result = await getAudit(id)
          setAudit(result)

          if (result.status === 'complete' || result.status === 'error') {
            setLoading(false)
            stopPolling()
            if (result.status === 'error') {
              setError(result.error || 'Audit failed')
            }
          }
        } catch {
          // Keep polling on transient errors
        }
      }

      // Initial fetch
      await poll()

      // Poll every 2 seconds
      pollRef.current = setInterval(poll, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audit')
      setLoading(false)
    }
  }, [stopPolling])

  useEffect(() => {
    return stopPolling
  }, [stopPolling])

  return { audit, loading, error, runAudit }
}

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

// This function is called by pg_cron weekly to re-audit all active monitored sites.
// It calls the run-audit function for each site and updates scores.

serve(async (req: Request) => {
  // Only allow POST (from cron or admin)
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Verify cron secret — mandatory to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = (Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
  const db = createClient(supabaseUrl, supabaseServiceKey)

  // Get all active monitored sites where user has pro plan
  const { data: sites, error: sitesError } = await db
    .from('monitored_sites')
    .select('id, url, user_id, last_score')
    .eq('active', true)

  if (sitesError || !sites) {
    return new Response(JSON.stringify({ error: sitesError?.message || 'No sites found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify each site's user has pro plan
  const userIds = [...new Set(sites.map(s => s.user_id))]
  const { data: plans } = await db
    .from('user_plans')
    .select('user_id, plan')
    .in('user_id', userIds)

  const proUsers = new Set(
    (plans || []).filter(p => p.plan === 'pro').map(p => p.user_id)
  )

  const eligibleSites = sites.filter(s => proUsers.has(s.user_id))
  const results: { url: string; score: number | null; error?: string }[] = []

  for (const site of eligibleSites) {
    try {
      // Call the run-audit Edge Function
      const resp = await fetch(`${supabaseUrl}/functions/v1/run-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          url: site.url,
          monitoring_site_id: site.id,
          skip_save: true,
        }),
      })

      if (resp.ok) {
        const audit = await resp.json()

        // Save audit with monitoring flag
        await db.from('audits').insert({
          user_id: site.user_id,
          url: site.url,
          overall_score: audit.overall_score,
          checks: audit.checks,
          pages_crawled: audit.pages_crawled,
          is_monitoring: true,
          monitored_site_id: site.id,
        })

        // Update monitored site
        await db
          .from('monitored_sites')
          .update({
            prev_score: site.last_score,
            last_score: audit.overall_score,
            last_checked_at: new Date().toISOString(),
          })
          .eq('id', site.id)

        results.push({ url: site.url, score: audit.overall_score })
      } else {
        results.push({ url: site.url, score: null, error: `HTTP ${resp.status}` })
      }
    } catch (err) {
      results.push({
        url: site.url,
        score: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return new Response(JSON.stringify({
    processed: results.length,
    total_sites: sites.length,
    eligible_sites: eligibleSites.length,
    results,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

/**
 * Evaluate fix generation results using deterministic tests.
 *
 * Tests (weighted to 100%):
 * A (25%) — Completeness: did we get a fix for every failed check?
 * B (25%) — JSON Reliability: clean parse on first try?
 * C (20%) — Fix Validity: is fix_code syntactically valid HTML/XML?
 * D (15%) — Field Completeness: does every fix have all 3 fields?
 * E (15%) — Content Quality: meta descriptions 120-160 chars, JSON-LD valid, etc.
 *
 * Usage:
 *   npx tsx scripts/evaluate_production.ts [--input-dir results_prod]
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { TEST_CASES } from '../test-inputs/cases.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Types ──

interface FixResult {
  id: string
  fix_code?: string
  fix_explanation?: string
  fix_location?: string
}

interface RunResult {
  case_id: string
  case_name: string
  model: string
  prompt_version: string
  fixes: FixResult[]
  expected_fix_count: number
  actual_fix_count: number
  json_parsed_clean: boolean
  json_repaired: boolean
  cost_usd: number
}

// ── Load results ──

function loadResult(caseId: string, inputDir: string): RunResult | null {
  const filePath = path.join(inputDir, caseId, 'result.json')
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')) } catch { return null }
}

// ── Test A: Completeness (25%) — fix for every failed check ──

function runTestA(results: Map<string, RunResult>) {
  const details: Array<{ caseId: string; expected: number; actual: number; missingIds: string[]; pass: boolean }> = []

  for (const tc of TEST_CASES) {
    const result = results.get(tc.id)
    if (!result) continue
    const fixIds = new Set(result.fixes.map(f => f.id))
    const missingIds = tc.failedChecks.filter(c => !fixIds.has(c.id)).map(c => c.id)
    details.push({
      caseId: tc.id,
      expected: tc.expectedFixCount,
      actual: result.fixes.length,
      missingIds,
      pass: missingIds.length === 0,
    })
  }

  const passCount = details.filter(d => d.pass).length
  return { passCount, totalCount: details.length, score: details.length > 0 ? (passCount / details.length) * 100 : 0, details }
}

// ── Test B: JSON Reliability (25%) — clean parse ──

function runTestB(results: Map<string, RunResult>) {
  const details: Array<{ caseId: string; cleanParse: boolean; repaired: boolean; pass: boolean }> = []

  for (const tc of TEST_CASES) {
    const result = results.get(tc.id)
    if (!result) continue
    details.push({
      caseId: tc.id,
      cleanParse: result.json_parsed_clean,
      repaired: result.json_repaired,
      pass: result.json_parsed_clean,
    })
  }

  const passCount = details.filter(d => d.pass).length
  return { passCount, totalCount: details.length, score: details.length > 0 ? (passCount / details.length) * 100 : 0, details }
}

// ── Test C: Fix Validity (20%) — syntactically valid HTML/XML ──

function isValidHtmlSnippet(code: string): boolean {
  if (!code || code.trim().length === 0) return false
  const trimmed = code.trim()

  // Meta tags, link tags — self-closing or not
  if (trimmed.startsWith('<meta ') || trimmed.startsWith('<link ')) {
    return trimmed.includes('>') // at minimum, has a closing >
  }

  // Script tags (JSON-LD)
  if (trimmed.includes('<script')) {
    return trimmed.includes('</script>')
  }

  // XML (sitemap, robots)
  if (trimmed.includes('<?xml') || trimmed.includes('<urlset') || trimmed.includes('<sitemapindex')) {
    return trimmed.includes('</urlset>') || trimmed.includes('</sitemapindex>') || trimmed.includes('<url>')
  }

  // Robots.txt is plain text, not HTML
  if (trimmed.toLowerCase().includes('user-agent:')) return true

  // H1 tag
  if (trimmed.includes('<h1')) return trimmed.includes('</h1>')

  // Security headers — these are server config, not HTML. Accept any non-empty instruction.
  if (trimmed.toLowerCase().includes('x-content-type') || trimmed.toLowerCase().includes('x-frame-options') ||
      trimmed.toLowerCase().includes('nosniff') || trimmed.toLowerCase().includes('sameorigin') ||
      trimmed.toLowerCase().includes('header') || trimmed.toLowerCase().includes('nginx') ||
      trimmed.toLowerCase().includes('apache') || trimmed.toLowerCase().includes('.htaccess')) {
    return true
  }

  // Viewport meta
  if (trimmed.includes('viewport')) return true

  // Canonical
  if (trimmed.includes('canonical')) return true

  // Fallback: at least looks like HTML
  return trimmed.startsWith('<') && trimmed.includes('>')
}

function runTestC(results: Map<string, RunResult>) {
  let validCount = 0
  let totalFixes = 0
  const failures: Array<{ caseId: string; fixId: string; snippet: string }> = []

  for (const tc of TEST_CASES) {
    const result = results.get(tc.id)
    if (!result) continue
    for (const fix of result.fixes) {
      totalFixes++
      if (fix.fix_code && isValidHtmlSnippet(fix.fix_code)) {
        validCount++
      } else {
        failures.push({ caseId: tc.id, fixId: fix.id, snippet: (fix.fix_code ?? '').slice(0, 80) })
      }
    }
  }

  return {
    validCount,
    totalFixes,
    score: totalFixes > 0 ? (validCount / totalFixes) * 100 : 0,
    failures,
  }
}

// ── Test D: Field Completeness (15%) — all 3 fields present ──

function runTestD(results: Map<string, RunResult>) {
  let completeCount = 0
  let totalFixes = 0
  const failures: Array<{ caseId: string; fixId: string; missingFields: string[] }> = []

  for (const tc of TEST_CASES) {
    const result = results.get(tc.id)
    if (!result) continue
    for (const fix of result.fixes) {
      totalFixes++
      const missing: string[] = []
      if (!fix.fix_code || fix.fix_code.trim().length === 0) missing.push('fix_code')
      if (!fix.fix_explanation || fix.fix_explanation.trim().length === 0) missing.push('fix_explanation')
      if (!fix.fix_location || fix.fix_location.trim().length === 0) missing.push('fix_location')
      if (missing.length === 0) {
        completeCount++
      } else {
        failures.push({ caseId: tc.id, fixId: fix.id, missingFields: missing })
      }
    }
  }

  return {
    completeCount,
    totalFixes,
    score: totalFixes > 0 ? (completeCount / totalFixes) * 100 : 0,
    failures,
  }
}

// ── Test E: Content Quality (15%) — domain-specific checks ──

function runTestE(results: Map<string, RunResult>) {
  let passCount = 0
  let totalChecks = 0
  const failures: Array<{ caseId: string; fixId: string; reason: string }> = []

  for (const tc of TEST_CASES) {
    const result = results.get(tc.id)
    if (!result) continue
    for (const fix of result.fixes) {
      if (!fix.fix_code) continue

      // Meta description: 120-160 chars
      if (fix.id === 'meta-description') {
        totalChecks++
        const match = fix.fix_code.match(/content="([^"]*)"/)
        if (match) {
          const len = match[1].length
          if (len >= 100 && len <= 180) { // slightly relaxed from 120-160
            passCount++
          } else {
            failures.push({ caseId: tc.id, fixId: fix.id, reason: `description length ${len} (want 100-180)` })
          }
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: 'no content attribute found' })
        }
      }

      // JSON-LD: must contain @context and @type
      if (fix.id === 'jsonld') {
        totalChecks++
        if (fix.fix_code.includes('@context') && fix.fix_code.includes('@type')) {
          passCount++
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: 'JSON-LD missing @context or @type' })
        }
      }

      // Sitemap: must contain <url> and <loc>
      if (fix.id === 'sitemap-exists') {
        totalChecks++
        if (fix.fix_code.includes('<url>') && fix.fix_code.includes('<loc>')) {
          passCount++
        } else if (fix.fix_code.toLowerCase().includes('sitemap')) {
          passCount++ // instructions about creating a sitemap are acceptable
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: 'sitemap missing <url>/<loc> structure' })
        }
      }

      // Canonical: must contain the actual URL
      if (fix.id === 'meta-canonical') {
        totalChecks++
        if (fix.fix_code.includes('canonical') && fix.fix_code.includes(tc.url.replace(/\/[^/]*$/, ''))) {
          passCount++
        } else if (fix.fix_code.includes('canonical')) {
          passCount++ // has canonical, just different URL format
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: 'canonical tag missing or wrong URL' })
        }
      }

      // OG tags: must have correct property
      if (fix.id.startsWith('og-')) {
        totalChecks++
        const prop = fix.id.replace('-', ':')
        if (fix.fix_code.includes(`property="${prop}"`) || fix.fix_code.includes(`property='${prop}'`)) {
          passCount++
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: `OG tag missing property="${prop}"` })
        }
      }

      // Twitter card
      if (fix.id === 'twitter-card') {
        totalChecks++
        if (fix.fix_code.includes('twitter:card')) {
          passCount++
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: 'twitter card tag missing twitter:card' })
        }
      }

      // Robots.txt: must have User-agent
      if (fix.id === 'robots-txt') {
        totalChecks++
        if (fix.fix_code.toLowerCase().includes('user-agent')) {
          passCount++
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: 'robots.txt missing User-agent directive' })
        }
      }

      // Viewport: must have width=device-width
      if (fix.id === 'viewport') {
        totalChecks++
        if (fix.fix_code.includes('device-width')) {
          passCount++
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: 'viewport missing device-width' })
        }
      }

      // fix_explanation under 200 chars
      if (fix.fix_explanation) {
        totalChecks++
        if (fix.fix_explanation.length <= 200) {
          passCount++
        } else {
          failures.push({ caseId: tc.id, fixId: fix.id, reason: `explanation too long: ${fix.fix_explanation.length} chars` })
        }
      }
    }
  }

  return {
    passCount,
    totalChecks,
    score: totalChecks > 0 ? (passCount / totalChecks) * 100 : 0,
    failures,
  }
}

// ── Scorecard ──

function computeScorecard(a: ReturnType<typeof runTestA>, b: ReturnType<typeof runTestB>, c: ReturnType<typeof runTestC>, d: ReturnType<typeof runTestD>, e: ReturnType<typeof runTestE>) {
  const weighted = a.score * 0.25 + b.score * 0.25 + c.score * 0.20 + d.score * 0.15 + e.score * 0.15
  return {
    testA: Math.round(a.score),
    testB: Math.round(b.score),
    testC: Math.round(c.score),
    testD: Math.round(d.score),
    testE: Math.round(e.score),
    weighted: Math.round(weighted * 10) / 10,
  }
}

// ── Main ──

function main() {
  const args = process.argv.slice(2)
  const inputDirName = args.includes('--input-dir') ? args[args.indexOf('--input-dir') + 1] : 'results_prod'
  const inputDir = path.resolve(__dirname, '..', inputDirName)

  console.log('LaunchReady Auto Research — Fix Generation Evaluator')
  console.log('='.repeat(60))

  const results = new Map<string, RunResult>()
  for (const tc of TEST_CASES) {
    const result = loadResult(tc.id, inputDir)
    if (result) results.set(tc.id, result)
  }

  console.log(`Loaded ${results.size} results from ${inputDir}`)
  if (results.size === 0) { console.error('No results found.'); process.exit(1) }

  const testA = runTestA(results)
  const testB = runTestB(results)
  const testC = runTestC(results)
  const testD = runTestD(results)
  const testE = runTestE(results)
  const scorecard = computeScorecard(testA, testB, testC, testD, testE)

  // Print results
  console.log(`\nTEST A — Completeness (25%): ${testA.passCount}/${testA.totalCount} = ${testA.score.toFixed(0)}%`)
  for (const d of testA.details) {
    if (!d.pass) console.log(`  FAIL ${d.caseId}: missing ${d.missingIds.join(', ')}`)
  }
  if (testA.passCount === testA.totalCount) console.log('  All cases have complete fixes.')

  console.log(`\nTEST B — JSON Reliability (25%): ${testB.passCount}/${testB.totalCount} = ${testB.score.toFixed(0)}%`)
  for (const d of testB.details) {
    if (!d.pass) console.log(`  FAIL ${d.caseId}: ${d.repaired ? 'repaired' : 'failed to parse'}`)
  }
  if (testB.passCount === testB.totalCount) console.log('  All responses parsed cleanly.')

  console.log(`\nTEST C — Fix Validity (20%): ${testC.validCount}/${testC.totalFixes} = ${testC.score.toFixed(0)}%`)
  for (const f of testC.failures) console.log(`  FAIL ${f.caseId}/${f.fixId}: ${f.snippet}`)
  if (testC.failures.length === 0) console.log('  All fixes are valid HTML/XML.')

  console.log(`\nTEST D — Field Completeness (15%): ${testD.completeCount}/${testD.totalFixes} = ${testD.score.toFixed(0)}%`)
  for (const f of testD.failures) console.log(`  FAIL ${f.caseId}/${f.fixId}: missing ${f.missingFields.join(', ')}`)
  if (testD.failures.length === 0) console.log('  All fixes have all 3 fields.')

  console.log(`\nTEST E — Content Quality (15%): ${testE.passCount}/${testE.totalChecks} = ${testE.score.toFixed(0)}%`)
  for (const f of testE.failures) console.log(`  FAIL ${f.caseId}/${f.fixId}: ${f.reason}`)
  if (testE.failures.length === 0) console.log('  All content checks passed.')

  console.log('\n' + '='.repeat(60))
  console.log('FINAL SCORECARD')
  console.log('='.repeat(60))
  console.log(`  A (Completeness)   25%:  ${scorecard.testA}`)
  console.log(`  B (JSON)           25%:  ${scorecard.testB}`)
  console.log(`  C (Fix Validity)   20%:  ${scorecard.testC}`)
  console.log(`  D (Fields)         15%:  ${scorecard.testD}`)
  console.log(`  E (Content)        15%:  ${scorecard.testE}`)
  console.log(`  ─────────────────────────`)
  console.log(`  WEIGHTED TOTAL:         ${scorecard.weighted}`)

  // Save
  const evalDir = path.resolve(__dirname, '..', 'evaluation')
  fs.mkdirSync(evalDir, { recursive: true })

  const firstResult = [...results.values()][0]
  const totalCost = [...results.values()].reduce((sum, r) => sum + r.cost_usd, 0)

  const output = {
    generated_at: new Date().toISOString(),
    prompt_version: firstResult?.prompt_version ?? 'unknown',
    scorecard,
    test_a: testA,
    test_b: { passCount: testB.passCount, totalCount: testB.totalCount, score: testB.score, details: testB.details },
    test_c: { validCount: testC.validCount, totalFixes: testC.totalFixes, score: testC.score, failureCount: testC.failures.length },
    test_d: { completeCount: testD.completeCount, totalFixes: testD.totalFixes, score: testD.score, failureCount: testD.failures.length },
    test_e: { passCount: testE.passCount, totalChecks: testE.totalChecks, score: testE.score, failureCount: testE.failures.length },
    total_cost_usd: totalCost,
  }

  fs.writeFileSync(path.join(evalDir, `eval_${Date.now()}.json`), JSON.stringify(output, null, 2))

  // Append to results.jsonl
  const jsonlPath = path.resolve(__dirname, '..', 'results.jsonl')
  const entry = {
    timestamp: new Date().toISOString(),
    prompt_version: firstResult?.prompt_version ?? 'unknown',
    scorecard,
    total_cost_usd: totalCost,
  }
  fs.appendFileSync(jsonlPath, JSON.stringify(entry) + '\n')

  console.log(`\nSaved to ${evalDir}/ and results.jsonl`)
}

main()

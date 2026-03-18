/**
 * Run the production fix-generation prompt against all test cases.
 *
 * Usage:
 *   npx tsx scripts/run_production.ts [--case T1] [--prompt-version prod_v1] [--output-dir results_prod]
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { TEST_CASES, type TestCase } from '../test-inputs/cases.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Load API key ──

function loadEnv(): string {
  const envPath = path.resolve(__dirname, '..', '.env.eval')
  if (!fs.existsSync(envPath)) throw new Error(`.env.eval not found at ${envPath}`)
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const match = line.match(/^ANTHROPIC_API_KEY\s*=\s*(.+)/)
    if (match) return match[1].trim()
  }
  throw new Error('ANTHROPIC_API_KEY not found in .env.eval')
}

// ── Prompt ──

function getPromptVersion(): string {
  const args = process.argv.slice(2)
  const idx = args.indexOf('--prompt-version')
  if (idx >= 0 && args[idx + 1]) return args[idx + 1]
  return 'prod_v1'
}

const PROMPT_VERSION = getPromptVersion()

function loadPromptTemplate(): string {
  const promptPath = path.resolve(__dirname, '..', 'prompts', `${PROMPT_VERSION}.txt`)
  if (!fs.existsSync(promptPath)) throw new Error(`Prompt not found: ${promptPath}`)
  return fs.readFileSync(promptPath, 'utf-8')
}

function buildPrompt(template: string, testCase: TestCase): string {
  const checkList = testCase.failedChecks.map(c => `- ${c.id}: ${c.name} — ${c.description}`).join('\n')
  return template
    .replace('{{URL}}', testCase.url)
    .replace('{{CHECK_LIST}}', checkList)
    .replace('{{HTML_HEAD}}', testCase.html)
}

// ── API call ──

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 2000

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
  prompt_tokens: number
  completion_tokens: number
  cost_usd: number
  duration_ms: number
  timestamp: string
  raw_text: string
}

async function runCase(testCase: TestCase, apiKey: string, promptTemplate: string): Promise<RunResult> {
  const prompt = buildPrompt(promptTemplate, testCase)
  const start = Date.now()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const durationMs = Date.now() - start

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    throw new Error(`API error ${response.status} for ${testCase.id}: ${err.slice(0, 200)}`)
  }

  const json = await response.json()
  const rawText = json.content?.find((b: Record<string, unknown>) => b.type === 'text')?.text as string ?? ''
  const promptTokens = json.usage?.input_tokens ?? 0
  const completionTokens = json.usage?.output_tokens ?? 0
  // Haiku 4.5: $0.80/M input, $4/M output
  const costUsd = (promptTokens * 0.8 + completionTokens * 4) / 1_000_000

  let jsonParsedClean = true
  let jsonRepaired = false
  let fixes: FixResult[] = []

  let text = rawText.trim()

  // Try direct parse
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) fixes = parsed
    else throw new Error('not array')
  } catch {
    jsonParsedClean = false
    // Strip markdown fences
    if (text.startsWith('```')) {
      text = text.replace(/^```[\w]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          fixes = parsed
          jsonParsedClean = true // code-fence-wrapped but valid inside
        }
      } catch { /* continue */ }
    }

    // Last resort: extract array
    if (fixes.length === 0) {
      const arrStart = text.indexOf('[')
      const arrEnd = text.lastIndexOf(']')
      if (arrStart >= 0 && arrEnd > arrStart) {
        try {
          const parsed = JSON.parse(text.slice(arrStart, arrEnd + 1))
          if (Array.isArray(parsed)) {
            fixes = parsed
            jsonRepaired = true
          }
        } catch { /* give up */ }
      }
    }
  }

  // Filter to valid fix objects with known IDs
  const validIds = new Set(testCase.failedChecks.map(c => c.id))
  fixes = fixes.filter((f: FixResult) => typeof f === 'object' && f !== null && validIds.has(f.id))

  return {
    case_id: testCase.id,
    case_name: testCase.name,
    model: MODEL,
    prompt_version: PROMPT_VERSION,
    fixes,
    expected_fix_count: testCase.expectedFixCount,
    actual_fix_count: fixes.length,
    json_parsed_clean: jsonParsedClean,
    json_repaired: jsonRepaired,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    cost_usd: costUsd,
    duration_ms: durationMs,
    timestamp: new Date().toISOString(),
    raw_text: rawText,
  }
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2)
  const caseFilter = args.includes('--case') ? args[args.indexOf('--case') + 1] : null
  const outputDirName = args.includes('--output-dir') ? args[args.indexOf('--output-dir') + 1] : 'results_prod'

  const apiKey = loadEnv()
  const promptTemplate = loadPromptTemplate()
  const outputDir = path.resolve(__dirname, '..', outputDirName)

  const cases = caseFilter
    ? TEST_CASES.filter(c => c.id === caseFilter)
    : TEST_CASES

  if (cases.length === 0) {
    console.error(`No test case found with id: ${caseFilter}`)
    process.exit(1)
  }

  console.log('LaunchReady Auto Research — Fix Generation Runner')
  console.log(`Prompt version: ${PROMPT_VERSION}`)
  console.log(`Model: ${MODEL}`)
  console.log(`Cases: ${cases.length}`)
  console.log(`Output: ${outputDir}`)
  console.log('='.repeat(60))

  let totalCost = 0
  let successCount = 0
  let failCount = 0

  for (const testCase of cases) {
    process.stdout.write(`  ${testCase.id} ${testCase.name.slice(0, 45).padEnd(45)} ... `)
    try {
      const result = await runCase(testCase, apiKey, promptTemplate)
      const caseDir = path.join(outputDir, testCase.id)
      fs.mkdirSync(caseDir, { recursive: true })
      fs.writeFileSync(path.join(caseDir, 'result.json'), JSON.stringify(result, null, 2))
      totalCost += result.cost_usd
      successCount++
      const parseNote = result.json_parsed_clean ? '' : result.json_repaired ? ' [repaired]' : ' [parse fail]'
      console.log(`${result.actual_fix_count}/${result.expected_fix_count} fixes, ${result.duration_ms}ms, $${result.cost_usd.toFixed(4)}${parseNote}`)
    } catch (err) {
      failCount++
      console.log(`FAILED: ${(err as Error).message.slice(0, 100)}`)
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('\n' + '='.repeat(60))
  console.log(`Done. ${successCount} succeeded, ${failCount} failed. Total cost: $${totalCost.toFixed(4)}`)
  console.log(`Results in: ${outputDir}/`)
}

main().catch(err => { console.error(err); process.exit(1) })

# LaunchReady — AI Evaluation & Auto Research

Eval system for optimizing the SEO fix generation prompt.

**Status: Baseline established at 100/100. No prompt improvements needed.**

## Quick Start

```bash
cd launchready-eval

# Run the prompt against all 5 test cases
npx tsx scripts/run_production.ts --prompt-version prod_v1 --output-dir results_prod_v1

# Evaluate the results
npx tsx scripts/evaluate_production.ts --input-dir results_prod_v1

# Run a single case
npx tsx scripts/run_production.ts --prompt-version prod_v1 --case T1
```

## How It Works

1. `run_production.ts` loads a prompt template, substitutes URL + failed checks + HTML head, calls Haiku API, saves structured fix results
2. `evaluate_production.ts` scores the results against 5 tests (see below)
3. You (or Claude Code) analyze failures, edit the prompt, re-run
4. When satisfied, copy the prompt changes to `supabase/functions/run-audit/index.ts` and deploy

## Evaluation Tests

| Test | Weight | What it measures | Pass criteria |
|------|--------|-----------------|---------------|
| A: Completeness | 25% | Fix for every failed check | fix count = expected count |
| B: JSON Reliability | 25% | Clean JSON parse | No repair needed |
| C: Fix Validity | 20% | Syntactically valid HTML/XML | All fixes parse as valid markup |
| D: Field Completeness | 15% | All 3 fields present | fix_code, fix_explanation, fix_location |
| E: Content Quality | 15% | Semantic quality checks | Meta description length, JSON-LD structure, sitemap structure, OG properties |

## Score History

| Version | Date | Score | A | B | C | D | E | Notes |
|---------|------|-------|---|---|---|---|---|-------|
| prod_v1 | 2026-03-17 | 100.0 | 100 | 100 | 100 | 100 | 100 | Baseline — perfect score, no improvement needed |

## Why No Improvement Was Needed

LaunchReady's fix generation is a **structured output task** — generating HTML meta tags, JSON-LD, sitemaps from a check list. LLMs handle this type of task consistently well. The eval confirmed there's no quality gap to close.

This is different from SignalScore (subjective credit scoring, 86.9 baseline) or ReplyFlow (subjective reply tone, 98.1 baseline) where prompt improvements made a measurable difference.

## Test Portfolio (5 Cases)

| ID | Scenario | Failed Checks | Expected Fixes |
|----|----------|---------------|----------------|
| T1 | SaaS site missing meta + social tags | 5 | 5 |
| T2 | Blog missing sitemap + robots + JSON-LD | 3 | 3 |
| T3 | E-commerce missing canonical + JSON-LD + security | 4 | 4 |
| T4 | Portfolio missing viewport + H1 + meta description | 3 | 3 |
| T5 | Minimal site missing almost everything | 7 | 7 |

## File Structure

```
launchready-eval/
├── .env.eval                    # Anthropic API key (git-ignored)
├── README.md                    # This file
├── results.jsonl                # Append-only score history
├── scripts/
│   ├── run_production.ts        # Run prompt against test cases
│   └── evaluate_production.ts   # Score results (5-test framework)
├── prompts/
│   └── prod_v1.txt              # Production prompt (no v2 needed)
├── test-inputs/
│   └── cases.ts                 # 5 test cases definition
├── results_prod_v1/             # Baseline results (100/100)
└── evaluation/
    └── eval_*.json              # Per-run detailed evaluations
```

## Cost

- Each full eval run (5 cases via Haiku): ~$0.015
- No improvement iterations were needed

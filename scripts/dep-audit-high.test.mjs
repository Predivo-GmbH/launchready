// Fails if the full npm tree has any high or critical advisory (what the production monitor checks).
import { execSync } from 'node:child_process'
try {
  execSync('npm audit --audit-level=high', { stdio: 'inherit' })
} catch {
  console.error('high/critical npm advisories present')
  process.exit(1)
}
console.log('no high or critical advisories')

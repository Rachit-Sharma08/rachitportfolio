// Secret audit — kisi bhi tracked file me credential-ish value to nahi mili.
//
// Ye AGENTS.md rule #3 ka enforceable counterpart hai. Pattern list yahan hai
// (AGENTS.md me nahi) taaki docs file khud apne hi regex se match na ho.
//
// Koi secret kabhi commit mat karo. Agar koi match aaye to: value TURANT
// rotate karo (purana invalid = history se redact karne jitna hi kaam karta
// hai, kyunki HEAD se hataane se git history me value safe nahi hoti).
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const PATTERNS = [
  ['Vercel project ID', /prj_[A-Za-z0-9]{10,}/g],
  ['Vercel deploy-hook URL', /integrations\/deploy\/[a-zA-Z0-9]/g],
  ['GitHub PAT', /gh[porsu]_[A-Za-z0-9]{16,}/g],
  ['GitHub fine-grained PAT', /github_pat_[A-Za-z0-9_]{20,}/g],
  ['Supabase secret key', /sb_secret_[A-Za-z0-9]{20,}/g],
  ['Supabase publishable key', /sb_publishable_[A-Za-z0-9]{20,}/g],
  ['Render API key', /rnd_[A-Za-z0-9]{16,}/g],
  ['Resend key', /re_[A-Za-z0-9]{16,}/g],
  ['Google API key', /AIza[0-9A-Za-z_-]{30,}/g],
  ['Slack token', /xox[baprs]-[A-Za-z0-9-]{10,}/g],
  ['JWT', /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g],
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
]

// Binary/large files + ye script khud (patterns yahan hain).
const SKIP = new Set([
  'scripts/check-secrets.mjs',
  'package-lock.json',
])
const MAX_BYTES = 2 * 1024 * 1024

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((f) => !SKIP.has(f))

const hits = []
for (const file of files) {
  const buf = readFileSync(path.resolve(file))
  if (buf.length > MAX_BYTES) continue
  if (buf.includes(0)) continue // binary
  const text = buf.toString('utf8')
  for (const [label, re] of PATTERNS) {
    re.lastIndex = 0
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length
      hits.push({ file, line, label, match: m[0].slice(0, 12) + '…' })
    }
  }
}

if (hits.length === 0) {
  console.log(`secrets:check — clean (${files.length} tracked files, ${PATTERNS.length} patterns)`)
  process.exit(0)
}

console.error(`secrets:check — ${hits.length} potential secret(s) found:\n`)
for (const h of hits) console.error(`  ${h.file}:${h.line}  [${h.label}]  ${h.match}`)
console.error('\nRotate the value FIRST, then remove it from the file.')
process.exit(1)
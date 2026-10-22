---
name: agent-arena
description: Run a large task as a competition between read-only specialist checkers (3 teams x 3 agents), then 3 heads that synthesize/approve, then one judge that ranks. Use when the user asks for multi-agent work, "best of N", a full audit, or any task big enough that one pass would miss things.
---

# Agent Arena

A large task is split into **audits that compete**, not opinions that agree.

```
3 teams (SEO / SECURITY / QA)
  each team = 3 independent read-only checkers (same brief, different lens)
        |
  each team's head reads its 3 reports -> keeps the real findings, drops noise
        |
  judge ranks the 3 head reports by risk x effort
        |
  you apply only approved fixes, then run the gates
```

## When to use

- User says "best of", "multi-agent", "agents aapas me compete karein", "full audit".
- Task has 3+ independent risk surfaces (SEO, security, QA) and a wrong answer costs more than the extra passes.
- NOT for a one-line fix or a single file question. Use ponytail and just do it.

## Hard rules

1. **Checkers are read-only.** Every checker prompt starts with: `READ-ONLY. Do NOT edit, commit, push, delete.` They may run builds/tests/node one-liners.
2. **No two agents edit the same file.** Only you (the main agent) edit, after the judge.
3. **Self-contained prompts.** A checker cannot see this chat. Give: repo path, OS/shell, what changed, exact files, what to check, output format, and what is already known-fixed.
4. **Stagger launches.** 3 background subagents at a time, not 9 in one second (free models 429).
5. **Never trust a report.** Reproduce a finding before fixing it. Delete findings that are style opinions.

## Step 1 - pick lenses, not job titles

Each of the 3 checkers in a team gets a **different attack surface**, otherwise you get the same answer three times.

| Team | Checker lenses |
|---|---|
| SEO | technical/schema, content+local intent, crawl/index surface |
| SECURITY | headers/config, input+abuse paths, authz/secrets/data |
| QA | gates+route wiring, diff regression (`tsc`, imports), a11y/semantics |

Subagent types: `explore` or the domain specialist (`seo-specialist`, `security-reviewer`, `qa-tester`). All are read-only.

## Step 2 - checker prompt template

```text
READ-ONLY. Do NOT edit, commit, push, delete. Repo: <abs path> (<OS>, <shell>).
Context: <what changed, in 3 lines>
Your job: <one narrow lens>
1. <exact command to run or file to read>
2. <what to prove>
3. <what to prove>
Known-fixed (do not re-report): <list>

Output: ranked findings, max 8. Each: severity (high/med/low), file:line,
problem in one sentence, exact fix. If clean, say CLEAN + what you checked.
No essays, no generic advice.
```

## Step 3 - head review (one per team)

Feed the team's 3 reports to one head (`seo-specialist`, `security-reviewer`, `qa-tester`). The head must:

1. Merge duplicates, drop anything already fixed or unverifiable.
2. Mark each kept finding `APPLY` / `DEFER` / `REJECT` with a one-line reason.
3. Return a single ordered list: severity, file:line, fix, why it survives.
4. Cap at 6 fixes. A head that approves everything has done no work.

## Step 4 - judge

Pass the 3 head reports to `judge` (read-only). It ranks by **real user/business risk vs effort** and returns:

```
1. <finding> - apply now - <risk if skipped>
2. ...
winner team: <team> - <one line why>
```

Tie-break order: security hole > broken gate/crawl path > SEO regression > polish.

## Step 5 - apply and prove

1. Apply only `APPLY` items, smallest diff that fixes the root cause.
2. Re-run the project gates: `npm run lint`, `npm run build`, `npm run verify`, plus the repo's secret scan.
3. For each applied fix, state the evidence (assertion count, byte size, HTTP status). "Should work" is not evidence.
4. Report rejected findings with the reason, so the next run does not re-do them.

## Failure modes

- **Echo chamber**: identical prompts -> identical findings. Vary the lens, not the wording.
- **Opinion inflation**: 30 "consider adding" items. Cap severities; a head must reject.
- **Ghost fix**: agent reports a fix it did not make. Always diff after applying.
- **Duplicate commits**: apply all approved fixes first, then split into atomic commits once.

---
name: review
description: Run iterative agent-based code review until consensus is achieved
---

# Code Review Skill

Runs up to 3 parallel agents per round, iterating until all agents agree there are no new issues.

## Configuration

### FORBIDDEN Patterns (fail if found)
- `console.log` in production code (except designated debug files)
- `any` type in TypeScript (without explicit justification comment)
- Hardcoded secrets, API keys, or credentials
- `// TODO` or `// FIXME` without linked issue
- Direct DOM manipulation in React components
- `eslint-disable` without explanation comment
- Empty catch blocks
- Synchronous file operations in API handlers
- SQL string concatenation (injection risk)
- Missing error boundaries around async operations

### REQUIRED Patterns (fail if missing)
- All exported functions have JSDoc or TypeScript types
- API endpoints have input validation (Zod schemas)
- Async operations have error handling
- React components with state have loading/error states
- Database queries use parameterized statements
- Environment variables accessed via typed config
- Test files exist for new modules (*.test.ts or *.spec.ts)

### Test Quality Patterns (required in test files)
- At least one assertion per test
- Edge cases tested (null, empty, boundary values)
- Error paths tested (not just happy path)
- Mocks/stubs properly cleaned up
- Descriptive test names ("should X when Y")
- No hardcoded timeouts without explanation

## Execution Flow

1. **Initialization**
   - Detect current git branch name
   - Create output directory: `docs.local/<BRANCH>/`
   - Identify changed files (vs main branch)
   - Split files into 3 batches for parallel review

2. **Round N Execution** (max 5 rounds)
   - Launch 3 agents IN PARALLEL, each assigned a file batch
   - Each agent:
     a. Reads assigned files
     b. Checks for FORBIDDEN patterns → reports as CRITICAL
     c. Checks for REQUIRED patterns → reports as ERROR
     d. Checks test quality patterns → reports as WARNING
     e. Writes findings to `docs.local/<BRANCH>/round-N-agent-{1,2,3}.md`
   - Agent output format:
     ```markdown
     # Round N - Agent {1,2,3} Review

     ## Files Reviewed
     - path/to/file1.ts
     - path/to/file2.ts

     ## Findings

     ### CRITICAL
     - [file:line] Description of forbidden pattern found

     ### ERROR
     - [file:line] Description of missing required pattern

     ### WARNING
     - [file:line] Test quality issue

     ## Verdict
     PASS | FAIL (with summary)
     ```

3. **Consensus Check**
   - If ALL 3 agents report `PASS` → Stop, consensus achieved
   - If ANY agent reports `FAIL`:
     - Summarize findings
     - Prompt user to fix or override
     - If fixed, increment round and repeat
   - If round > 5 → Stop, report unresolved issues

4. **Final Report**
   - Generate `docs.local/<BRANCH>/review-summary.md`
   - List all rounds, findings, resolutions
   - Final verdict: APPROVED / NEEDS ATTENTION

## Usage
```
/review              # Review current branch changes
/review --all        # Review all files, not just changed
/review --fix        # Auto-fix simple issues (formatting, imports)
```

## Agent Assignment Strategy
- Agent 1: API routes, middleware, database files
- Agent 2: React components, hooks, UI files
- Agent 3: Tests, utilities, shared modules

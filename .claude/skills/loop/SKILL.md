---
name: loop
description: Ralph loop orchestrator - execute tasks one at a time with backpressure validation
---

# Loop Orchestrator Skill

Implements Geoffrey Huntley's Ralph Wiggum Loop pattern: autonomous single-task execution with backpressure validation, fresh context per iteration, and eventual consistency through repetition.

> "Ralph is a technique. In its purest form, Ralph is a Bash loop."
> — Geoffrey Huntley

## Core Philosophy

1. **Let Ralph Ralph** — Trust eventual consistency through iteration. When Ralph produces errors, tune the system through prompt/context adjustments like tuning a guitar.

2. **Fresh Context Per Iteration** — Each loop iteration starts clean. State persists only in files (IMPLEMENTATION_PLAN.md, AGENTS.md, specs/, git history), not in conversation context.

3. **Backpressure Over Gates** — Tests, linting, type checks, and builds reject invalid work. Simple pass/fail, not complex verification ceremonies.

4. **Move Outside the Loop** — Engineers guide from outside by engineering the environment (prompts, specs, backpressure), not by micromanaging tasks.

5. **One Task Per Loop** — Pick the most important task, implement it, validate, commit, exit. Next iteration picks the next task.

## Three-Phase Architecture

### Phase 1: Requirements Definition
Human + LLM conversation aligned to Jobs-To-Be-Done (JTBD):
- Identify what needs to be built and why
- Break into topics of concern
- Generate specification documents in `specs/` folder

Output: `specs/*.md` files describing requirements

### Phase 2: Planning Mode (`/loop --plan`)
Gap analysis comparing specifications against existing code:
- Study specs using parallel subagents
- Analyze current codebase state
- Generate prioritized `IMPLEMENTATION_PLAN.md`
- **No implementation** — planning only

Output: `IMPLEMENTATION_PLAN.md` with prioritized tasks

### Phase 3: Building Mode (`/loop` or `/loop --build`)
Execute tasks from the plan:
- Pick most important incomplete task
- Implement the functionality
- Run tests for validation
- Commit when tests pass
- Exit (next iteration continues)

## Key Files

```
project-root/
├── AGENTS.md                 # Operational guide (how to build/test/run)
├── IMPLEMENTATION_PLAN.md    # Prioritized task list (living document)
├── specs/                    # Per-JTBD specification files
│   ├── auth.md
│   ├── homepage.md
│   └── ...
└── src/                      # Application source code
```

### AGENTS.md
Operational guide discovered during execution. Keep it **lean** (~60 lines max):
- Build commands
- Test commands
- Run commands
- Project-specific patterns

**Important**: Status updates and progress notes belong in `IMPLEMENTATION_PLAN.md`, not here. A bloated AGENTS.md pollutes every future loop's context.

### IMPLEMENTATION_PLAN.md
Living document updated continuously during execution:
```markdown
# Implementation Plan

## Current Focus
- [ ] Most important task right now

## Backlog
- [ ] Next priority item
- [ ] Another item

## Discovered Issues
- [ ] Bug found during task X (needs fix)

## Completed
- [x] Finished task (commit: abc123)
```

When you discover issues, **immediately update** IMPLEMENTATION_PLAN.md. When resolved, remove the item. After tests pass, update the plan, then commit.

**Maintenance**: Periodically clean completed items from IMPLEMENTATION_PLAN.md to keep the file lean. Move old completed items to the git history or archive — a bloated plan pollutes context.

### specs/
Specification files from Phase 1. One file per JTBD topic:
```markdown
# Feature: Authentication

## Jobs To Be Done
- User can sign up with email
- User can log in with credentials
- User can reset password

## Requirements
...

## Acceptance Criteria
...
```

## Task File Location

The task file can be specified when invoking the skill. If no path is provided, defaults to `IMPLEMENTATION_PLAN.md` in project root.

Supported patterns:
- `IMPLEMENTATION_PLAN.md` (default)
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/<feature>/IMPLEMENTATION_PLAN.md` (feature-specific)

The skill will look for associated specs:
- Project root → `specs/`
- `docs/` → `docs/specs/`
- `docs/<feature>/` → `docs/<feature>/specs/`

## Execution Flow

### Initialization
```
1. Resolve plan path (from argument or default)
2. Study IMPLEMENTATION_PLAN.md (not just read — understand current state)
3. Study AGENTS.md for operational commands
4. Study specs/ using parallel subagents to understand requirements
5. Don't assume something isn't implemented — search the codebase first
6. Select most important incomplete task
```

### Task Execution
```
1. Search codebase before making changes (use parallel subagents)
2. Implement the functionality per specifications
   - Implement complete functionality — avoid placeholders
   - If you discover bugs (even unrelated ones), document or resolve them
3. Run tests after implementing
4. If tests pass:
   - Update IMPLEMENTATION_PLAN.md (mark complete, note any discoveries)
   - git add -A
   - git commit with descriptive message
   - git push (if configured)
5. If tests fail:
   - Update IMPLEMENTATION_PLAN.md with discovered issue
   - Attempt fix in same iteration if simple
   - Or exit and let next iteration address it
```

### Backpressure Validation

Run these to validate work. Commands come from AGENTS.md:
```bash
# Type checking (if applicable)
{typecheck_command from AGENTS.md}

# Linting
{lint_command from AGENTS.md}

# Tests
{test_command from AGENTS.md}

# Build
{build_command from AGENTS.md}
```

If any fail, the work is rejected. Fix issues before committing.

### On Completion
After successful commit:
1. Update IMPLEMENTATION_PLAN.md (mark task complete, note commit hash)
2. Update AGENTS.md if you learned new operational info
3. Create git tag if milestone reached (e.g., `v0.0.1` when all errors eliminated)
4. **Exit** — this is critical. Each iteration must exit after one task to force fresh context in the next iteration. Don't continue to the next task in the same session.

## Language Patterns

Use specific phrasing that shapes behavior:
- **"Study"** not "read" — implies understanding, not just parsing
- **"Don't assume not implemented"** — always search before creating
- **"Capture the why"** — documentation explains reasoning, not just what
- **"Using parallel subagents"** — explicit instruction to parallelize

## Subagent Usage

Use parallel subagents effectively:
- **Up to 500 parallel Sonnet subagents** for searching/reading codebase
- **Only 1 subagent** for build/test operations (avoid race conditions)
- **Opus subagents** for complex reasoning about architecture or specs

## Usage

```
/loop                              # Start building from IMPLEMENTATION_PLAN.md
/loop [path]                       # Use specific plan file
/loop --plan                       # Enter planning mode (no implementation)
/loop --status                     # Show current plan status
/loop --status [path]              # Show status for specific plan
```

### Path Resolution

When a path is provided:
1. If absolute path, use directly
2. If relative path, resolve from project root
3. If just a name like `homepage`, look for:
   - `docs/homepage/IMPLEMENTATION_PLAN.md`
   - `docs/homepage-plan.md`

## AGENTS.md Template

Create this file to make the loop project-agnostic:

```markdown
# AGENTS.md

## Build Commands
- Install: `pnpm install`
- Build: `pnpm build`
- Dev: `pnpm dev`

## Test Commands
- All tests: `pnpm test`
- Single file: `pnpm test {file}`

## Type Check
- `pnpm tsc --noEmit`

## Lint
- Check: `pnpm lint`
- Fix: `pnpm lint --fix`

## Project Structure
- API: `apps/api/`
- Web: `apps/web/`
- Shared: `packages/shared/`

## Patterns
- Use Drizzle ORM for database
- Use Zod for validation
- Use TanStack Query for data fetching
```

## Failure Philosophy

**Don't over-engineer failure handling.**

When something breaks:
1. Note it in IMPLEMENTATION_PLAN.md
2. Either fix it now or let the next iteration handle it
3. Trust eventual consistency — Ralph will keep trying

Only stop for human intervention when:
- Fundamental architecture decisions needed
- Security-sensitive changes required
- Ambiguous requirements need clarification
- Same failure repeats 3+ times (pattern indicates deeper issue)

## Logging

Maintain `docs.local/loop-log.md` for audit trail:
```markdown
# Loop Execution Log

## Session: {date-time}

### Task: {description}
- Status: Completed
- Commit: {hash}
- Notes: {any learnings}
```

## Integration with Other Skills

- **/spec** — Generate detailed specs for Phase 1
- **/prd** — Generate PRD that informs specs
- **/review** — Optional periodic review (not required every N tasks)

## Example Session

```
> /loop

Studying IMPLEMENTATION_PLAN.md...
Studying AGENTS.md for operational commands...
Studying specs/ with parallel subagents...

Current plan has 8 incomplete tasks.
Most important: "Add user authentication endpoint"

Don't assume not implemented — searching codebase first...
Found existing: apps/api/src/middleware/auth.ts (Clerk middleware)
No existing auth routes found.

Implementing authentication endpoint...
- Created apps/api/src/routes/auth.ts
- Added login/register handlers
- Updated apps/api/src/index.ts with route

Running backpressure validation...
✓ Type check passed
✓ Lint passed
✓ Tests passed (4 new tests)
✓ Build passed

Updating IMPLEMENTATION_PLAN.md (commit: a1b2c3d)...
Committing: "feat: add user authentication endpoint"

Task complete. Exiting.

[Session ends — next /loop invocation starts fresh]
```

## The Loop

In its purest form, Ralph is a bash loop:

```bash
while true; do
  claude-code --print "$(cat PROMPT.md)"
done
```

Each iteration:
1. Loads fresh context (IMPLEMENTATION_PLAN.md, AGENTS.md, specs/)
2. Picks most important task
3. Implements, validates, commits
4. Exits

State persists in files and git history, not in conversation context. This is the key insight that makes Ralph work.

---

*Based on Geoffrey Huntley's Ralph Wiggum Technique. See: https://ghuntley.com/ralph/*

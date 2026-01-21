---
name: loop
description: Ralph loop orchestrator - execute tasks one at a time with verification gates
---

# Loop Orchestrator Skill

Implements the Ralph Loop pattern: autonomous single-task execution with verification gates, rollback capability, and failure tracking.

## Task Queue Location

The task queue file can be specified when invoking the skill. If no path is provided, defaults to `docs/tasks.md`.

Supported patterns:
- `docs/tasks.md` (default)
- `docs/<feature>/tasks.md` (feature-specific task files)
- Any `.md` file in docs that follows the task queue format

The skill will automatically look for an associated PRD file:
- If task file is `docs/tasks.md` → looks for `docs/PRD.md`
- If task file is `docs/<feature>/tasks.md` → looks for `docs/<feature>/PRD.md`
- If task file is `docs/<feature>-tasks.md` → looks for `docs/<feature>-PRD.md` or `docs/<feature>.md`

## Task Queue Format
```markdown
# Task Queue

## Pending
- [ ] Task 1: Short description | Files: path/to/file.ts | Size: S/M/L
- [ ] Task 2: Short description | Files: path/to/file.ts | Size: S/M/L

## In Progress
- [~] Task N: Currently executing task

## Completed
- [x] Task 0: Completed task description

## Failed (needs human intervention)
- [!] Task N: Failed task with error summary
```

## Execution Flow

### 1. Initialization
```
1. Resolve task queue path (from argument or default to docs/tasks.md)
2. Read task queue from resolved path
3. Locate associated PRD file (if exists) for context
4. Validate queue format
5. Check git status is clean (no uncommitted changes)
6. Identify next pending task
7. Create checkpoint: `git stash push -m "loop-checkpoint-$(date +%s)"` or commit
```

### 2. Pre-Task Validation
Before executing any task, validate it meets size limits:
- **Max 5 files** changed per task
- **Max 200 lines** added per task
- **Max 1 new module** introduced per task

If task appears too large:
- STOP and ask user to split into subtasks
- Suggest breakdown based on task description

### 3. Spec Generation (Before Implementation)
For each task, FIRST generate acceptance criteria:
```markdown
## Task N Spec

### Description
{task description}

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Files to Modify
- path/to/file.ts (add function X)
- path/to/other.ts (update import)

### Files to Create
- path/to/new.ts

### Test Cases Required
- Test case 1: {input} → {expected output}
- Test case 2: edge case handling
```

Write spec to `docs.local/specs/<feature>/task-N.md` before proceeding. The `<feature>` directory is derived from the task file path (e.g., `docs/auth/tasks.md` → `docs.local/specs/auth/task-N.md`). For the default `docs/tasks.md`, specs go to `docs.local/specs/task-N.md`.

### 4. Task Execution
```
1. Mark task as [~] In Progress in queue
2. Execute the implementation
3. Write/update tests as specified in spec
4. Stage changes: git add -A
```

### 5. Verification Gates (Run in Order)

#### Gate 1: TypeScript Compilation
```bash
pnpm tsc --noEmit
```
- FAIL → Rollback, log error, STOP

#### Gate 2: Lint Check
```bash
pnpm lint
```
- FAIL → Attempt auto-fix with `pnpm lint --fix`
- If still fails → Rollback, log error, STOP

#### Gate 3: Test Suite (Changed Files Only)
```bash
pnpm test --changed
```
- FAIL → Rollback, log error, STOP

#### Gate 4: Build Check
```bash
pnpm build
```
- FAIL → Rollback, log error, STOP

#### Gate 5: Acceptance Criteria Verification
- Review each criterion from spec
- Verify implementation meets all criteria
- If ANY unmet → Rollback, log, STOP

### 6. On Success
```
1. Create commit with message:
   "feat(loop): Task N - {short description}

   Acceptance criteria met:
   - Criterion 1 ✓
   - Criterion 2 ✓

   Co-Authored-By: Claude <noreply@anthropic.com>"

2. Mark task as [x] Completed in queue
3. Update docs.local/loop-log.md with success entry
4. Check if periodic review needed (every 3 tasks)
5. Continue to next task OR pause for human review
```

### 7. On Failure
```
1. Rollback changes:
   git restore .
   git clean -fd

2. Mark task as [!] Failed in queue with error summary

3. Log failure to docs.local/failures.md:
   | Task N | {Error Type} | {Root Cause} | {Suggested Fix} |

4. STOP execution
5. Output failure summary for human review
6. Wait for human to fix or skip task
```

### 8. Periodic Review Gate
After every 3 successful tasks:
```
1. Run /review skill on all changes since last review
2. If review finds issues:
   - List issues found
   - Pause for human decision: fix now or continue
3. If review passes: continue to next task
```

## Failure Pattern Tracking

Maintain `docs.local/failures.md` (or `docs.local/<feature>/failures.md` for feature-specific task files):
```markdown
# Failure Log

## Patterns Identified
- Pattern 1: {description} → Fix: {solution}

## Recent Failures
| Date | Task | Error Type | Root Cause | Fix Applied | Recurrence |
|------|------|------------|------------|-------------|------------|
| 2024-01-15 | Task 5 | Type Error | Missing type import | Added import | 0 |
```

When a failure type recurs 3+ times:
- STOP and alert user
- Suggest adding to FORBIDDEN patterns in /review skill
- Recommend systemic fix

## Loop Log

Maintain `docs.local/loop-log.md` (or `docs.local/<feature>/loop-log.md` for feature-specific task files):
```markdown
# Loop Execution Log

## Session: {date-time}

### Task 1: {description}
- Status: ✓ Completed
- Files changed: 3
- Lines added: 45
- Tests added: 2
- Duration: {timestamp range}
- Commit: {hash}

### Task 2: {description}
- Status: ✗ Failed
- Error: {type error in X}
- Rollback: applied
- Resolution: {pending human review}
```

## Usage

```
/loop                              # Start loop from next pending task (uses docs/tasks.md)
/loop [path]                       # Start loop using specified task file
/loop docs/homepage/tasks.md       # Example: run loop for homepage feature
/loop --task N                     # Start from specific task number
/loop --dry-run                    # Show what would execute without running
/loop --status                     # Show current queue status
/loop --status [path]              # Show status for specific task file
/loop --pause-after N              # Pause after N tasks for review
/loop --skip-review                # Skip periodic /review gates (not recommended)
/loop --continue                   # Continue after human fixed a failure
```

### Path Resolution

When a path is provided:
1. If it's an absolute path, use it directly
2. If it's a relative path, resolve from project root
3. If just a name like `homepage`, look for:
   - `docs/homepage/tasks.md`
   - `docs/homepage-tasks.md`
   - `docs/homepage.tasks.md`

## Human Intervention Points

The loop STOPS and waits for human input when:
1. **Task too large** - needs splitting
2. **Verification gate fails** - needs debugging
3. **Failure pattern recurs** - needs systemic fix
4. **Periodic review finds issues** - needs decision
5. **User presses CTRL+C** - manual pause

To resume after intervention:
```
/loop --continue
```

## Safety Rules

1. **Never force push** - All changes are local commits only
2. **Never skip tests** - Verification gates are mandatory
3. **Always checkpoint** - Can rollback any task
4. **Never batch commits** - One commit per task for clean history
5. **Never exceed size limits** - Large tasks must be split
6. **Always log** - Full audit trail of all actions

## Integration with Other Skills

- **/spec** - Can be called to generate detailed specs before task
- **/review** - Called automatically every 3 tasks
- **/prd** - Initial PRD generates the task queue

## Example Session

```
> /loop

Reading task queue from docs/tasks.md...
Found 12 pending tasks.
```

Or with a custom path:
```
> /loop docs/auth/tasks.md

Reading task queue from docs/auth/tasks.md...
Found PRD at docs/auth/PRD.md
Found 8 pending tasks.

Starting Task 1: Set up Drizzle schema for users table
- Size: S (estimated 2 files, ~50 lines)
- Generating spec... done (docs.local/specs/task-1.md)
- Creating checkpoint... done

Executing task...
- Created apps/api/src/db/schema.ts
- Added users table definition
- Created apps/api/src/db/index.ts
- Added migration

Running verification gates...
✓ Gate 1: TypeScript compilation passed
✓ Gate 2: Lint check passed
✓ Gate 3: Tests passed (2 new tests)
✓ Gate 4: Build passed
✓ Gate 5: Acceptance criteria met (3/3)

Committing: "feat(loop): Task 1 - Set up Drizzle schema for users table"
Task 1 complete.

Starting Task 2: Add folders table with self-referential parent_id...
```

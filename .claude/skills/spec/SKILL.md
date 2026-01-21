---
name: spec
description: Generate acceptance criteria and test cases before implementing a task
---

# Spec Generator Skill

Generates detailed specifications and acceptance criteria BEFORE implementation begins. This creates a contract that verification gates check against.

## Purpose

Writing specs before code:
1. Clarifies exactly what needs to be built
2. Defines done criteria upfront
3. Identifies edge cases early
4. Creates test cases before implementation (TDD-lite)
5. Prevents scope creep during implementation

## Output Location
`docs.local/specs/task-{N}.md`

## Spec Template

```markdown
# Task {N} Specification

## Summary
{One sentence description of what this task accomplishes}

## Context
{Why this task is needed, what it enables, any dependencies}

## Acceptance Criteria

### Must Have
- [ ] Criterion 1: {specific, testable requirement}
- [ ] Criterion 2: {specific, testable requirement}

### Should Have
- [ ] Criterion 3: {nice to have but not blocking}

### Must NOT
- [ ] Anti-criterion: {what this task should NOT do}

## Files to Modify
| File | Change Type | Description |
|------|-------------|-------------|
| path/to/file.ts | Modify | Add function X |
| path/to/other.ts | Modify | Update imports |

## Files to Create
| File | Purpose |
|------|---------|
| path/to/new.ts | New module for X |
| path/to/new.test.ts | Tests for new module |

## Test Cases

### Unit Tests Required
```typescript
describe('{module name}', () => {
  it('should {expected behavior} when {condition}', () => {
    // Input: {describe input}
    // Expected: {describe expected output}
  });

  it('should handle {edge case}', () => {
    // Input: {edge case input}
    // Expected: {expected handling}
  });

  it('should throw/reject when {error condition}', () => {
    // Input: {invalid input}
    // Expected: {error type/message}
  });
});
```

### Integration Tests Required
- [ ] Test: {integration scenario 1}
- [ ] Test: {integration scenario 2}

## API Contract (if applicable)

### Endpoint
`{METHOD} /api/{path}`

### Request Schema
```typescript
{
  field: Type; // description
}
```

### Response Schema
```typescript
{
  field: Type; // description
}
```

### Error Responses
| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Invalid input | { error: "..." } |
| 404 | Not found | { error: "..." } |

## Database Changes (if applicable)

### New Tables
```sql
CREATE TABLE {name} (
  -- columns
);
```

### Migrations Required
- [ ] Migration: {description}

## Dependencies

### Packages to Add
- `package-name` - reason for adding

### Internal Dependencies
- Depends on: {other module/task}
- Blocks: {tasks that depend on this}

## Rollback Plan
If this task fails or needs reverting:
1. {Step to undo change 1}
2. {Step to undo change 2}

## Open Questions
- [ ] Question 1: {unresolved decision} → Default: {assumption if not answered}

## Size Estimate
- Files: {N}
- Lines (estimated): {N}
- Complexity: Low / Medium / High
```

## Usage

```
/spec "task description"     # Generate spec for a task
/spec --task N               # Generate spec for task N from queue
/spec --validate             # Validate existing spec completeness
```

## Validation Rules

A spec is valid if:
1. Has at least 2 acceptance criteria
2. Lists all files to be modified/created
3. Has at least 1 test case per acceptance criterion
4. Edge cases are identified
5. Error handling is specified
6. Size estimate is within limits (≤5 files, ≤200 lines)

## Integration with /loop

The loop skill automatically:
1. Calls `/spec --task N` before executing task N
2. Validates spec completeness
3. Uses acceptance criteria for Gate 5 verification
4. Records which criteria passed/failed in commit message

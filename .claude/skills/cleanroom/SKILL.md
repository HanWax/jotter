---
name: cleanroom
description: Verify build reproducibility by rebuilding from scratch in isolation
---

# Clean Room Verification Skill

Periodically rebuilds the project from scratch in an isolated environment to verify:
1. No hidden dependencies
2. Build is reproducible
3. All dependencies are declared
4. No local state pollution

## When to Run

- After completing a major phase (e.g., Phase 1, Phase 2)
- Before merging to main branch
- When builds fail unexpectedly
- Weekly during active development

## Execution Flow

### 1. Setup Clean Environment
```bash
# Create temporary directory
CLEAN_DIR=$(mktemp -d)
echo "Clean room: $CLEAN_DIR"

# Clone current branch (not copy, to avoid local artifacts)
git clone --branch $(git branch --show-current) --single-branch . "$CLEAN_DIR/jotter"
cd "$CLEAN_DIR/jotter"
```

### 2. Fresh Install
```bash
# Remove any cached dependencies
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Clear package manager cache
pnpm store prune

# Fresh install
pnpm install --frozen-lockfile
```

### 3. Full Build
```bash
# Build all packages
pnpm build

# Record build output
pnpm build 2>&1 | tee build-output.log
```

### 4. Full Test Suite
```bash
# Run all tests
pnpm test

# Record test output
pnpm test 2>&1 | tee test-output.log
```

### 5. Type Check
```bash
pnpm tsc --noEmit
```

### 6. Lint Check
```bash
pnpm lint
```

### 7. Compare Outputs
```bash
# Compare built artifacts with main branch
# Check for unexpected differences
```

### 8. Cleanup
```bash
# Remove temporary directory
rm -rf "$CLEAN_DIR"
```

## Output Report

Generate `docs.local/cleanroom/report-{date}.md`:

```markdown
# Clean Room Verification Report

**Date**: {timestamp}
**Branch**: {branch name}
**Commit**: {commit hash}

## Environment
- Node version: {version}
- pnpm version: {version}
- OS: {os info}

## Results

### Installation
- Status: ✓ PASS / ✗ FAIL
- Duration: {time}
- Warnings: {count}

### Build
- Status: ✓ PASS / ✗ FAIL
- Duration: {time}
- Output size: {size}
- Warnings: {list}

### Tests
- Status: ✓ PASS / ✗ FAIL
- Total: {count}
- Passed: {count}
- Failed: {count}
- Skipped: {count}

### Type Check
- Status: ✓ PASS / ✗ FAIL
- Errors: {count}

### Lint
- Status: ✓ PASS / ✗ FAIL
- Errors: {count}
- Warnings: {count}

## Issues Found

### Critical (blocks release)
- {issue description}

### Warning (should fix)
- {issue description}

## Hidden Dependencies Detected
- {any undeclared dependencies found}

## Recommendations
- {suggested fixes}

## Verdict
**REPRODUCIBLE** / **NOT REPRODUCIBLE**
```

## Usage

```
/cleanroom              # Run full clean room verification
/cleanroom --quick      # Skip tests, build only
/cleanroom --keep       # Keep temp directory for debugging
/cleanroom --compare    # Compare with main branch artifacts
```

## Common Issues Detected

### 1. Missing Dependencies
```
Error: Cannot find module 'x'
Fix: Add 'x' to package.json dependencies
```

### 2. Implicit Global Dependencies
```
Error: 'y' is not defined
Fix: Ensure 'y' is imported, not assumed global
```

### 3. Platform-Specific Code
```
Error: Works on Mac, fails on Linux
Fix: Use cross-platform alternatives
```

### 4. Stale Lock File
```
Error: Dependencies don't match lock file
Fix: Run 'pnpm install' and commit lock file
```

### 5. Environment Variable Dependencies
```
Error: Missing required env var
Fix: Document in README, add to .env.example
```

## Integration with /loop

The loop can trigger cleanroom verification:
- After every 10 tasks
- At phase boundaries
- Before tagging a release

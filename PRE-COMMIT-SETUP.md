# Pre-commit Hooks Setup

This project uses [pre-commit](https://pre-commit.com/) to ensure code quality, run tests, and maintain test coverage before commits and pushes.

## What's Installed

### Pre-commit Hooks
The following hooks have been configured:

#### General File Checks (on commit)
- **trailing-whitespace**: Removes trailing whitespace
- **end-of-file-fixer**: Ensures files end with a newline
- **check-yaml**: Validates YAML files
- **check-json**: Validates JSON files
- **check-added-large-files**: Prevents files larger than 1MB from being committed
- **check-merge-conflict**: Detects merge conflict markers
- **check-case-conflict**: Detects case-sensitive filename conflicts
- **mixed-line-ending**: Ensures consistent line endings
- **detect-private-key**: Warns about potential private keys

#### API (Express + Bun + TypeScript) - on commit
- **api-prettier**: Formats code with Prettier
- **api-lint**: Lints code with ESLint (with auto-fix)
- **api-typecheck**: Type checks TypeScript files
- **api-test**: Runs all API tests

#### API - on push only
- **api-coverage**: Runs tests with coverage reporting (minimum 70% threshold configured)

#### Frontend (SolidJS + Vite) - on commit
- **frontend-typecheck**: Type checks TypeScript files

#### Frontend - on push only
- **frontend-build**: Builds the frontend to catch build errors

#### Kubernetes/Infrastructure
- **k8s-validate**: Validates Kubernetes manifests with dry-run

## Configuration Files Created

### 1. `.pre-commit-config.yaml`
Main pre-commit configuration with all hooks defined.

### 2. `api/bunfig.toml`
Bun test configuration with:
- Coverage enabled by default
- 70% minimum coverage threshold
- 10-second timeout for tests

### 3. `api/eslint.config.js`
ESLint configuration for the API with:
- TypeScript parser and plugin
- Custom rules for code quality
- Warning for `any` types and unused variables

### 4. `api/.prettierrc.json`
Prettier configuration for consistent code formatting.

## Usage

### Automatic (recommended)
Pre-commit hooks will run automatically when you:
- **Commit**: Runs linting, formatting, type checking, and tests
- **Push**: Additionally runs coverage checks and builds

### Manual
Run hooks manually on all files:
```bash
pre-commit run --all-files
```

Run hooks on specific files:
```bash
pre-commit run --files api/src/services/community.service.ts
```

Run a specific hook:
```bash
pre-commit run api-test
```

### Skip Hooks (use sparingly)
To skip pre-commit hooks (NOT recommended):
```bash
git commit --no-verify
```

## Coverage Requirements

The API has a **70% minimum coverage threshold** configured in `api/bunfig.toml`.

To check coverage manually:
```bash
cd api
bun test --coverage
```

## Testing Individual Components

### API Linting
```bash
cd api
bun run lint
```

### API Formatting
```bash
cd api
bun run format
```

### API Tests
```bash
cd api
bun test
```

### API Type Check
```bash
cd api
bunx tsc --noEmit
```

### Frontend Type Check
```bash
cd frontend
npx tsc --noEmit
```

### Frontend Build
```bash
cd frontend
npm run build
```

## Troubleshooting

### Hook fails on commit
1. Read the error message carefully
2. Fix the issues (linting errors, test failures, type errors)
3. Stage the fixed files: `git add <files>`
4. Try committing again

### Coverage threshold not met
If your changes reduce coverage below 70%, you'll need to:
1. Add more tests to cover your new code
2. Ensure existing tests still cover the modified code
3. Verify coverage: `cd api && bun test --coverage`

### Slow commits
Some hooks (like tests) can make commits slower. If this is an issue:
- Many hooks only run on files you've changed
- Coverage checks only run on `git push`, not every commit
- Frontend build only runs on push
- You can temporarily skip hooks with `--no-verify` (not recommended)

## Maintenance

### Update pre-commit hooks
```bash
pre-commit autoupdate
```

### Update hook versions
Edit `.pre-commit-config.yaml` and update the `rev` fields.

### Re-install hooks
If you modify `.pre-commit-config.yaml`:
```bash
pre-commit install
pre-commit install --hook-type pre-push
```

## Benefits

✅ **Catch errors before CI**: Find issues locally before pushing
✅ **Consistent code quality**: All commits follow the same standards
✅ **Test coverage enforcement**: Ensures adequate test coverage
✅ **Type safety**: Catches TypeScript errors early
✅ **Automatic formatting**: Code is automatically formatted on commit
✅ **Fast feedback**: Issues are caught immediately, not in CI

## Next Steps

1. Try making a commit to see the hooks in action
2. Try making a push to see coverage checks
3. Consider adjusting the coverage threshold in `api/bunfig.toml` if needed
4. Add frontend tests and coverage checks when ready

# CLAUDE.md -- @careagent/provider-skills

## Project Overview

provider-skills is the **curated clinical skills registry** for provider CareAgents. Each skill is a credentialed capability package that loads based on provider credentials declared in `CANS.md`. Skills are version-pinned, integrity-verified (SHA-256 checksums), and revocable.

## The Irreducible Risk Hypothesis

Clinical skills carry the highest risk surface in the CareAgent ecosystem. Every skill invocation is a clinical action. Skills are gated by credentials -- a provider cannot load a skill their CANS.md does not authorize. Every load, invocation, and update is logged to `AUDIT.log`.

## Directory Structure (Planned)

```
provider-skills/
  skills/
    chart-skill/           # Clinical documentation (already complete in provider-core)
    order-skill/           # Order entry
    charge-skill/          # Charge capture
    patient-agent-comm-skill/  # Patient communication
    referral-skill/        # Referral management
  registry/
    index.json             # Skill manifest
    checksums.json         # SHA-256 integrity checksums
  test/                    # Test suites per skill
  docs/
    contributing-skills.md # How to author a new skill
    governance.md          # Skill review and approval process
  src/
    loader.ts              # Credential-gated skill loading
    verifier.ts            # SHA-256 integrity verification
    types.ts               # TypeBox schemas for skill metadata
  package.json
  tsconfig.json
  vitest.config.ts
```

## Skill Structure

Each skill directory contains:
- `SKILL.md` -- YAML frontmatter (name, version, description, required_credentials, clinical_actions, risk_level)
- `index.ts` -- Skill implementation
- `*.test.ts` -- Skill-specific tests

## Skill Categories

| Category | Skills | Credential Gate |
|----------|--------|-----------------|
| Core Clinical | chart, order, charge | Base provider credentials |
| Communication | patient-agent-comm, referral | Base provider credentials |
| Specialty | (future) | Specialty-specific credentials |
| Institutional | (future) | Facility-specific credentials |

## Commands

```bash
pnpm install          # Install dependencies
pnpm test             # Run all tests
pnpm test:coverage    # Run tests with coverage
pnpm build            # Build ESM output
pnpm typecheck        # TypeScript type checking
```

## Tech Stack

- TypeScript ~5.7 (strict mode, no `any`)
- vitest ~4.0 (80% minimum coverage)
- tsdown ~0.20 (ESM-only)
- @sinclair/typebox ~0.34

## Anti-Patterns

- **Never auto-update skills** -- version-pinning is a safety mechanism
- **Never skip integrity verification** -- checksums prevent tampered skill loading
- **Never bypass credential gates** -- skills must validate CANS.md credentials before loading
- **Never store PHI in skill state** -- skills process data but do not persist it
- **Never add external runtime dependencies** -- skills use only ecosystem packages and Node.js built-ins

## Conventions

- Each skill is self-contained in its own directory
- SKILL.md frontmatter is the single source of truth for skill metadata
- All clinical actions map to the 7-action taxonomy: chart, order, charge, perform, interpret, educate, coordinate
- Every skill invocation is logged with classification metadata (clinical/administrative, sensitive/non-sensitive)

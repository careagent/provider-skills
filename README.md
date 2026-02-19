# @careagent/provider-skills

**The curated clinical skills registry for provider CareAgents.**

Provider skills are credentialed capability packages that teach a provider's CareAgent how to perform specific clinical functions. They are not downloaded from an app store — they are earned through credentialing. Each skill loads only when the provider's `CANS.md` declares the credentials that authorize it.

---

## What This Package Does

@careagent/provider-skills is a pnpm package providing the curated registry of skills available to provider CareAgents. It:

- Provides skills covering the four atomic clinical actions — chart, order, charge, and their specialty and institutional extensions
- Gates skill loading on provider credentials declared in `CANS.md`
- Enforces integrity verification — skills are checksummed at install and verified at load time
- Version-pins all skills — no auto-update, provider approval required
- Records all skill installation, update, and usage events in `AUDIT.log`

---

## Core Principle: Skills Are Earned Through Credentialing

A family medicine CareAgent does not load spine-postop-skill. A nurse's CareAgent loads a different autonomy tier for order-skill than a physician's. The credential requirements baked into each skill's metadata are not advisory — they are enforced at load time. A skill that exceeds the provider's declared credentials in `CANS.md` will not load regardless of how it was installed.

This is the operational expression of the risk architecture. The provider bears personal liability for every action their CareAgent takes. Skill gating ensures the CareAgent cannot act outside the scope the provider is authorized — and insured — to cover.

---

## Architecture

### Skill Gating

Clinical skills extend the standard OpenClaw AgentSkills format with `careagent` metadata that defines the credential requirements for loading:

```yaml
metadata:
  openclaw:
    requires:
      env: ["ANTHROPIC_API_KEY"]
  careagent:
    requires:
      credentials:
        license_type: ["MD", "DO", "NP", "PA"]
        specialty: ["neurosurgery"]
        privilege: ["spine_postop_management"]
      cans: true
```

The `cans: true` flag is the gate. If `CANS.md` is not present in the workspace, any skill requiring it will not load. If `CANS.md` is present, the skill loader validates the provider's declared credentials against what the skill requires.

### Registry Governance

Skills in this registry have undergone clinical review — not just code review. Before a skill is published:

- Clinical content is reviewed for accuracy, safety, and evidence basis
- Code is reviewed for security and correctness
- Credential requirements are validated against applicable licensure standards
- The skill is versioned and checksummed

This registry enforces:

- **Version-pinning** — clinical skills do not auto-update. The provider reviews and approves updates, mirroring how formulary changes or protocol updates work.
- **Integrity verification** — skill contents are checksummed at install and verified at load time. Modified skills will not load.
- **Immutable audit trail** — every installation, update, and removal is recorded in `AUDIT.log` with full chain of custody.
- **Revocability** — if a skill is found to be clinically flawed, it can be recalled from the registry — the clinical equivalent of a drug recall.

---

## Installation

Skills are installed through @careagent/provider-core:

```bash
openclaw skills install @careagent/provider-skills/chart-skill
openclaw skills install @careagent/provider-skills/spine-postop-skill
openclaw skills install @careagent/provider-skills/facility-epic-skill
```

Skills that exceed the provider's declared credentials in `CANS.md` will not load. Installation succeeds but activation is blocked at load time.

---

## Local Development

This project uses [pnpm](https://pnpm.io) as its package manager.

```bash
# Install pnpm if you don't have it
npm install -g pnpm

git clone https://github.com/careagent/provider-skills
cd provider-skills
pnpm install

# Run tests
pnpm test

# Validate a skill
pnpm validate skills/chart-skill
```

> **Dev platform note:** All development uses synthetic data. No real patient data or PHI is used at this stage.

---

## CLI Commands

Provider skills are managed through the @careagent/provider-core CLI:

```bash
careagent status            # Show loaded skills and their activation status
```

Skills install and load through OpenClaw's standard skill management:

```bash
openclaw skills install @careagent/provider-skills/<skill-name>
openclaw skills list
openclaw skills update <skill-name>
```

---

## Skill Categories

### Core Clinical Skills
Foundational skills available to all credentialed provider CareAgents:

- **chart-skill** — template-constrained clinical documentation engine. Ambient processing, clinician debrief integration, documentation voice personalization from `CANS.md`. The primary training mechanism for the provider's CareAgent over time.
- **order-skill** — order drafting and review. Higher oversight tier. Drafts orders for provider approval before execution. Includes medication reconciliation, lab and imaging ordering protocols.
- **charge-skill** — CPT/ICD coding and billing. Higher autonomy tier. Coding rules, modifier logic, documentation-to-code alignment.

### Specialty Skills
Installed based on provider specialty and scope of practice. Credential requirements enforced at load time:

- **neuro-exam-skill** — neurological examination documentation, element extraction from ambient audio, completeness validation.
- **spine-postop-skill** — post-operative spine care protocols, expected recovery trajectories, red flag identification.
- **cardiology-skill** — cardiovascular examination documentation, risk stratification frameworks.

Specialty societies are encouraged to publish and maintain their own skill packages for their domains through the clinical skill registry governance process.

### Institutional Skills
Installed per facility, managed by institutional administrators. Facility-specific credential requirements enforced at load time:

- **facility-epic-skill** — facility-specific SmartPhrase catalog, SmartLink syntax, Epic workflow integration.
- **facility-formulary-skill** — institutional formulary, preferred medications, substitution protocols.
- **facility-compliance-skill** — facility-specific documentation requirements, regulatory mandates.

### Communication Skills
- **patient-agent-comm-skill** — cross-installation protocol for communicating with patient CareAgents through established Neuron connections. Consent verification, writing to the patient's Patient Chart.
- **provider-handoff-skill** — care coordination, referral communication, shift handoff protocols.
- **referral-skill** — structured referral generation and routing to specialist Neurons.

### Termination of Care
- **termination-of-care-skill** — state-protocol-compliant care relationship termination. Knows notice requirements, documentation requirements, and alternative care obligations by state. Writes the termination event to the patient's immutable Patient Chart.

---

## Relationship to the Ecosystem

```
Provider OpenClaw Gateway (VPS / controlled infrastructure)
        │
        └── Provider Care Agent   ← @careagent/provider-core
                │
                ├── CANS.md (credential declaration — gates skill loading)
                │
                ├── @careagent/provider-skills
                │       ├── chart-skill            → clinical documentation
                │       ├── order-skill            → order drafting and approval
                │       ├── charge-skill           → CPT/ICD coding
                │       ├── [specialty skills]     → specialty-specific workflows
                │       ├── patient-agent-comm-skill → Patient Chart (write)
                │       └── termination-of-care-skill → Patient Chart (write)
                │
                └── Neuron  ← routes patient CareAgent connections
```

---

## Contributing a Skill

Clinical skill contributions are welcome from clinicians, specialty societies, health IT developers, and institutions.

All submissions require:

1. A complete `SKILL.md` with accurate YAML frontmatter and credential requirements
2. Clinical content review by a licensed provider in the relevant specialty
3. Code review for security and correctness
4. Documentation of the evidence basis for clinical content
5. Declaration of any conflicts of interest

See `docs/contributing-skills.md` for the full skill authoring guide and submission process.

---

## Repository Structure

```
careagent/provider-skills/
├── skills/
│   ├── chart-skill/
│   ├── order-skill/
│   ├── charge-skill/
│   ├── neuro-exam-skill/
│   ├── spine-postop-skill/
│   ├── patient-agent-comm-skill/
│   ├── provider-handoff-skill/
│   ├── referral-skill/
│   └── termination-of-care-skill/
├── registry/
│   ├── index.json            # Registry manifest
│   └── checksums.json        # Skill integrity checksums
├── test/                     # Test suites
├── docs/
│   ├── contributing-skills.md  # Skill authoring guide
│   └── governance.md           # Registry governance
└── package.json              # pnpm package
```

---

## Related Repositories

| Repository | Purpose |
|-----------|---------|
| [careagent/provider-core](https://github.com/careagent/provider-core) | Provider-side CareAgent plugin — loads skills from this registry |
| [careagent/patient-skills](https://github.com/careagent/patient-skills) | Patient clinical skills registry |
| [careagent/patient-chart](https://github.com/careagent/patient-chart) | Patient Chart vault — written to by patient-agent-comm-skill and termination-of-care-skill |
| [careagent/neuron](https://github.com/careagent/neuron) | Organization-level node — communication target for patient-agent-comm-skill |
| [careagent/axon](https://github.com/careagent/axon) | Open foundation network layer |

---

## License

Apache 2.0. See [LICENSE](LICENSE).

Clinical skills are community infrastructure. Every skill in this registry is open, auditable, and improvable by the clinicians and developers who depend on them.

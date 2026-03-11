/**
 * @careagent/provider-skills — Credential-gated clinical skills registry.
 *
 * Skills are loaded by provider-core via credential-gated loading
 * with SHA-256 integrity verification.
 */

export const VERSION = '0.1.0';

// Skill exports
export { ChartSkill } from './skills/chart-skill/index.js';
export type { ChartSkillInput, ChartSkillOutput } from './skills/chart-skill/index.js';

export { OrderSkill } from './skills/order-skill/index.js';
export type { OrderSkillInput, OrderSkillOutput } from './skills/order-skill/index.js';

export { PatientAgentCommSkill } from './skills/patient-agent-comm-skill/index.js';
export type { CommSkillInput, CommSkillOutput } from './skills/patient-agent-comm-skill/index.js';

export { ReferralSkill } from './skills/referral-skill/index.js';
export type { ReferralSkillInput, ReferralSkillOutput } from './skills/referral-skill/index.js';

export { ChargeSkill } from './skills/charge-skill/index.js';
export type { ChargeSkillInput, ChargeSkillOutput } from './skills/charge-skill/index.js';

// Skill registry
export { SkillRegistry, type SkillMetadata } from './registry.js';

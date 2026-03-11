import { ChartSkill } from './skills/chart-skill/index.js';
import { OrderSkill } from './skills/order-skill/index.js';
import { PatientAgentCommSkill } from './skills/patient-agent-comm-skill/index.js';
import { ReferralSkill } from './skills/referral-skill/index.js';
import { ChargeSkill } from './skills/charge-skill/index.js';

export interface SkillMetadata {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly required_credentials: readonly string[];
  readonly clinical_actions: readonly string[];
  readonly classification: {
    readonly domain: string;
    readonly sensitivity: string;
  };
}

interface SkillEntry {
  readonly metadata: SkillMetadata;
  readonly validate: (input: unknown) => { valid: boolean; errors?: string[] };
  readonly execute: (input: never) => unknown;
}

const SKILLS: ReadonlyMap<string, SkillEntry> = new Map<string, SkillEntry>([
  ['chart-skill', ChartSkill],
  ['order-skill', OrderSkill],
  ['patient-agent-comm-skill', PatientAgentCommSkill],
  ['referral-skill', ReferralSkill],
  ['charge-skill', ChargeSkill],
]);

/**
 * Registry for credential-gated clinical skills.
 * Provides discovery, metadata lookup, and credential-based access.
 */
export class SkillRegistry {
  /** List all registered skill names. */
  static list(): string[] {
    return [...SKILLS.keys()];
  }

  /** Get metadata for a skill by name. */
  static getMetadata(name: string): SkillMetadata | undefined {
    return SKILLS.get(name)?.metadata;
  }

  /** Get a skill entry by name. */
  static get(name: string): SkillEntry | undefined {
    return SKILLS.get(name);
  }

  /** Check if a skill exists in the registry. */
  static has(name: string): boolean {
    return SKILLS.has(name);
  }

  /** Find skills by clinical action. */
  static findByAction(action: string): SkillMetadata[] {
    const results: SkillMetadata[] = [];
    for (const entry of SKILLS.values()) {
      if (entry.metadata.clinical_actions.includes(action)) {
        results.push(entry.metadata);
      }
    }
    return results;
  }

  /** Find skills that the given credentials can access. */
  static findByCredentials(credentials: string[]): SkillMetadata[] {
    const results: SkillMetadata[] = [];
    for (const entry of SKILLS.values()) {
      const required = entry.metadata.required_credentials;
      if (required.every((cred) => credentials.includes(cred))) {
        results.push(entry.metadata);
      }
    }
    return results;
  }
}

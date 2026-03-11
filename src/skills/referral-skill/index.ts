import { Value } from '@sinclair/typebox/value';
import { ReferralSkillInputSchema, type ReferralSkillInput, type ReferralSkillOutput } from './schema.js';

export type { ReferralSkillInput, ReferralSkillOutput } from './schema.js';

export class ReferralSkill {
  static readonly metadata = {
    name: 'referral-skill',
    version: '1.0.0',
    description: 'Creates structured referral packages for specialist consultations',
    required_credentials: ['active_license'] as const,
    clinical_actions: ['coordinate'] as const,
    classification: {
      domain: 'clinical' as const,
      sensitivity: 'sensitive' as const,
    },
  };

  static validate(input: unknown): { valid: boolean; errors?: string[] } {
    const valid = Value.Check(ReferralSkillInputSchema, input);
    if (valid) {
      return { valid: true };
    }
    const errors = [...Value.Errors(ReferralSkillInputSchema, input)].map(
      (e) => `${e.path}: ${e.message}`
    );
    return { valid: false, errors };
  }

  static execute(input: ReferralSkillInput): ReferralSkillOutput {
    const validation = ReferralSkill.validate(input);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join('; ')}`);
    }

    // Build clinical summary from available data
    const summaryParts: string[] = [
      `Referral to ${input.target_specialty} for: ${input.referral_reason}`,
    ];

    if (input.relevant_history) {
      summaryParts.push(`History: ${input.relevant_history}`);
    }
    if (input.relevant_findings) {
      summaryParts.push(`Findings: ${input.relevant_findings}`);
    }
    if (input.relevant_imaging?.length) {
      summaryParts.push(`Imaging: ${input.relevant_imaging.join('; ')}`);
    }
    if (input.relevant_labs?.length) {
      summaryParts.push(`Labs: ${input.relevant_labs.join('; ')}`);
    }

    return {
      referral_id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      patient_id: input.patient_id,
      referring_provider_id: input.provider_id,
      target_specialty: input.target_specialty,
      urgency: input.urgency,
      referral_reason: input.referral_reason,
      clinical_summary: summaryParts.join('\n'),
      questions_for_specialist: input.specific_questions ?? [],
      preferred_provider: input.preferred_provider,
      created_at: new Date().toISOString(),
      status: 'pending',
      classification: {
        domain: 'clinical',
        sensitivity: 'sensitive',
      },
    };
  }
}

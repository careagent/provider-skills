import { Value } from '@sinclair/typebox/value';
import { ChartSkillInputSchema, type ChartSkillInput, type ChartSkillOutput } from './schema.js';

export type { ChartSkillInput, ChartSkillOutput } from './schema.js';

export class ChartSkill {
  static readonly metadata = {
    name: 'chart-skill',
    version: '1.0.0',
    description: 'Creates structured clinical documentation entries for the patient-chart ledger',
    required_credentials: ['active_license'] as const,
    clinical_actions: ['chart'] as const,
    classification: {
      domain: 'clinical' as const,
      sensitivity: 'sensitive' as const,
    },
  };

  static validate(input: unknown): { valid: boolean; errors?: string[] } {
    const valid = Value.Check(ChartSkillInputSchema, input);
    if (valid) {
      return { valid: true };
    }
    const errors = [...Value.Errors(ChartSkillInputSchema, input)].map(
      (e) => `${e.path}: ${e.message}`
    );
    return { valid: false, errors };
  }

  static execute(input: ChartSkillInput): ChartSkillOutput {
    const validation = ChartSkill.validate(input);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join('; ')}`);
    }

    const sections: Record<string, string> = {
      findings: input.findings,
      assessment: input.assessment,
      plan: input.plan,
    };

    if (input.chief_complaint) sections['chief_complaint'] = input.chief_complaint;
    if (input.subjective) sections['subjective'] = input.subjective;
    if (input.objective) sections['objective'] = input.objective;
    if (input.procedures?.length) sections['procedures'] = input.procedures.join('; ');
    if (input.medications?.length) sections['medications'] = input.medications.join('; ');
    if (input.allergies?.length) sections['allergies'] = input.allergies.join('; ');

    return {
      entry_id: `chart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      entry_type: input.entry_type,
      patient_id: input.patient.patient_id,
      provider_id: input.provider_id,
      encounter_date: input.encounter_date,
      created_at: new Date().toISOString(),
      sections,
      classification: {
        domain: 'clinical',
        sensitivity: 'sensitive',
      },
    };
  }
}

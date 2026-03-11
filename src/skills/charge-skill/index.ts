import { Value } from '@sinclair/typebox/value';
import { ChargeSkillInputSchema, type ChargeSkillInput, type ChargeSkillOutput } from './schema.js';

export type { ChargeSkillInput, ChargeSkillOutput } from './schema.js';

export class ChargeSkill {
  static readonly metadata = {
    name: 'charge-skill',
    version: '1.0.0',
    description: 'Creates structured billing and charge entries for clinical services',
    required_credentials: ['active_license', 'billing_privileges'] as const,
    clinical_actions: ['charge'] as const,
    classification: {
      domain: 'administrative' as const,
      sensitivity: 'sensitive' as const,
    },
  };

  static validate(input: unknown): { valid: boolean; errors?: string[] } {
    const valid = Value.Check(ChargeSkillInputSchema, input);
    if (valid) {
      return { valid: true };
    }
    const errors = [...Value.Errors(ChargeSkillInputSchema, input)].map(
      (e) => `${e.path}: ${e.message}`
    );
    return { valid: false, errors };
  }

  static execute(input: ChargeSkillInput): ChargeSkillOutput {
    const validation = ChargeSkill.validate(input);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join('; ')}`);
    }

    const diagnosisCodes = input.diagnosis_codes.map((dx, idx) => ({
      sequence: idx + 1,
      code: dx.code,
      description: dx.description,
    }));

    // Default all line items to point at first diagnosis
    const lineItems = input.service_codes.map((svc) => ({
      cpt_code: svc.code,
      cpt_description: svc.description,
      units: svc.units,
      modifiers: svc.modifiers ?? [],
      diagnosis_pointers: [1], // points to first diagnosis by default
    }));

    const totalUnits = lineItems.reduce((sum, item) => sum + item.units, 0);

    return {
      charge_id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      patient_id: input.patient_id,
      provider_id: input.provider_id,
      encounter_date: input.encounter_date,
      line_items: lineItems,
      diagnosis_codes: diagnosisCodes,
      place_of_service: input.place_of_service,
      facility_npi: input.facility_npi,
      rendering_provider_npi: input.rendering_provider_npi,
      total_units: totalUnits,
      created_at: new Date().toISOString(),
      status: 'pending',
      classification: {
        domain: 'administrative',
        sensitivity: 'sensitive',
      },
    };
  }
}

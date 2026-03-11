import { Value } from '@sinclair/typebox/value';
import { OrderSkillInputSchema, type OrderSkillInput, type OrderSkillOutput } from './schema.js';

export type { OrderSkillInput, OrderSkillOutput } from './schema.js';

export class OrderSkill {
  static readonly metadata = {
    name: 'order-skill',
    version: '1.0.0',
    description: 'Creates structured clinical orders for lab, imaging, referral, and medication',
    required_credentials: ['active_license', 'prescribing_authority'] as const,
    clinical_actions: ['order'] as const,
    classification: {
      domain: 'clinical' as const,
      sensitivity: 'sensitive' as const,
    },
  };

  static validate(input: unknown): { valid: boolean; errors?: string[] } {
    const valid = Value.Check(OrderSkillInputSchema, input);
    if (valid) {
      return { valid: true };
    }
    const errors = [...Value.Errors(OrderSkillInputSchema, input)].map(
      (e) => `${e.path}: ${e.message}`
    );
    return { valid: false, errors };
  }

  static execute(input: OrderSkillInput): OrderSkillOutput {
    const validation = OrderSkill.validate(input);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join('; ')}`);
    }

    // Validate that type-specific details are provided
    if (input.order_type === 'medication' && !input.medication) {
      throw new Error('Medication details required for medication orders');
    }
    if (input.order_type === 'lab' && !input.lab) {
      throw new Error('Lab details required for lab orders');
    }
    if (input.order_type === 'imaging' && !input.imaging) {
      throw new Error('Imaging details required for imaging orders');
    }
    if (input.order_type === 'referral' && !input.referral) {
      throw new Error('Referral details required for referral orders');
    }

    let details: Record<string, unknown> = {};
    switch (input.order_type) {
      case 'medication':
        details = { ...input.medication };
        break;
      case 'lab':
        details = { ...input.lab };
        break;
      case 'imaging':
        details = { ...input.imaging };
        break;
      case 'referral':
        details = { ...input.referral };
        break;
    }

    return {
      order_id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      order_type: input.order_type,
      patient_id: input.patient_id,
      provider_id: input.provider_id,
      urgency: input.urgency,
      clinical_justification: input.clinical_justification,
      diagnosis_codes: input.diagnosis_codes ?? [],
      details,
      created_at: new Date().toISOString(),
      status: 'pending',
      classification: {
        domain: 'clinical',
        sensitivity: 'sensitive',
      },
    };
  }
}

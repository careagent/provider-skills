import { Type, type Static } from '@sinclair/typebox';

export const ReferralUrgencySchema = Type.Union([
  Type.Literal('emergent'),
  Type.Literal('urgent'),
  Type.Literal('routine'),
  Type.Literal('elective'),
]);

export type ReferralUrgency = Static<typeof ReferralUrgencySchema>;

export const ReferralSkillInputSchema = Type.Object({
  patient_id: Type.String({ minLength: 1 }),
  provider_id: Type.String({ minLength: 1 }),
  target_specialty: Type.String({ minLength: 1 }),
  referral_reason: Type.String({ minLength: 1 }),
  urgency: ReferralUrgencySchema,
  relevant_history: Type.Optional(Type.String()),
  relevant_findings: Type.Optional(Type.String()),
  relevant_imaging: Type.Optional(Type.Array(Type.String())),
  relevant_labs: Type.Optional(Type.Array(Type.String())),
  specific_questions: Type.Optional(Type.Array(Type.String())),
  preferred_provider: Type.Optional(Type.Object({
    name: Type.String(),
    npi: Type.Optional(Type.String()),
    agent_id: Type.Optional(Type.String()),
  })),
});

export type ReferralSkillInput = Static<typeof ReferralSkillInputSchema>;

export const ReferralSkillOutputSchema = Type.Object({
  referral_id: Type.String(),
  patient_id: Type.String(),
  referring_provider_id: Type.String(),
  target_specialty: Type.String(),
  urgency: ReferralUrgencySchema,
  referral_reason: Type.String(),
  clinical_summary: Type.String(),
  questions_for_specialist: Type.Array(Type.String()),
  preferred_provider: Type.Optional(Type.Object({
    name: Type.String(),
    npi: Type.Optional(Type.String()),
    agent_id: Type.Optional(Type.String()),
  })),
  created_at: Type.String(),
  status: Type.Literal('pending'),
  classification: Type.Object({
    domain: Type.Literal('clinical'),
    sensitivity: Type.Literal('sensitive'),
  }),
});

export type ReferralSkillOutput = Static<typeof ReferralSkillOutputSchema>;

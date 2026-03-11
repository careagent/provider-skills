import { Type, type Static } from '@sinclair/typebox';

export const OrderTypeSchema = Type.Union([
  Type.Literal('lab'),
  Type.Literal('imaging'),
  Type.Literal('referral'),
  Type.Literal('medication'),
]);

export type OrderType = Static<typeof OrderTypeSchema>;

export const UrgencySchema = Type.Union([
  Type.Literal('stat'),
  Type.Literal('urgent'),
  Type.Literal('routine'),
]);

export type Urgency = Static<typeof UrgencySchema>;

export const MedicationDetailsSchema = Type.Object({
  drug_name: Type.String({ minLength: 1 }),
  dosage: Type.String({ minLength: 1 }),
  route: Type.String({ minLength: 1 }),
  frequency: Type.String({ minLength: 1 }),
  duration: Type.Optional(Type.String()),
  refills: Type.Optional(Type.Number({ minimum: 0 })),
});

export type MedicationDetails = Static<typeof MedicationDetailsSchema>;

export const LabDetailsSchema = Type.Object({
  test_names: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  specimen_type: Type.Optional(Type.String()),
  fasting_required: Type.Optional(Type.Boolean()),
});

export type LabDetails = Static<typeof LabDetailsSchema>;

export const ImagingDetailsSchema = Type.Object({
  modality: Type.String({ minLength: 1 }),
  body_region: Type.String({ minLength: 1 }),
  contrast: Type.Optional(Type.Boolean()),
  clinical_question: Type.Optional(Type.String()),
});

export type ImagingDetails = Static<typeof ImagingDetailsSchema>;

export const ReferralDetailsSchema = Type.Object({
  target_specialty: Type.String({ minLength: 1 }),
  reason: Type.String({ minLength: 1 }),
  relevant_history: Type.Optional(Type.String()),
});

export type ReferralDetails = Static<typeof ReferralDetailsSchema>;

export const OrderSkillInputSchema = Type.Object({
  order_type: OrderTypeSchema,
  patient_id: Type.String({ minLength: 1 }),
  provider_id: Type.String({ minLength: 1 }),
  urgency: UrgencySchema,
  clinical_justification: Type.String({ minLength: 1 }),
  diagnosis_codes: Type.Optional(Type.Array(Type.String())),
  medication: Type.Optional(MedicationDetailsSchema),
  lab: Type.Optional(LabDetailsSchema),
  imaging: Type.Optional(ImagingDetailsSchema),
  referral: Type.Optional(ReferralDetailsSchema),
});

export type OrderSkillInput = Static<typeof OrderSkillInputSchema>;

export const OrderSkillOutputSchema = Type.Object({
  order_id: Type.String(),
  order_type: OrderTypeSchema,
  patient_id: Type.String(),
  provider_id: Type.String(),
  urgency: UrgencySchema,
  clinical_justification: Type.String(),
  diagnosis_codes: Type.Array(Type.String()),
  details: Type.Record(Type.String(), Type.Unknown()),
  created_at: Type.String(),
  status: Type.Literal('pending'),
  classification: Type.Object({
    domain: Type.Literal('clinical'),
    sensitivity: Type.Literal('sensitive'),
  }),
});

export type OrderSkillOutput = Static<typeof OrderSkillOutputSchema>;

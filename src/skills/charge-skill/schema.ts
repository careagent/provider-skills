import { Type, type Static } from '@sinclair/typebox';

export const CPTCodeSchema = Type.Object({
  code: Type.String({ pattern: '^\\d{5}$' }),
  description: Type.Optional(Type.String()),
  units: Type.Number({ minimum: 1 }),
  modifiers: Type.Optional(Type.Array(Type.String({ pattern: '^[A-Z0-9]{2}$' }))),
});

export type CPTCode = Static<typeof CPTCodeSchema>;

export const ICD10CodeSchema = Type.Object({
  code: Type.String({ pattern: '^[A-Z]\\d{2}' }),
  description: Type.Optional(Type.String()),
});

export type ICD10Code = Static<typeof ICD10CodeSchema>;

export const ChargeSkillInputSchema = Type.Object({
  patient_id: Type.String({ minLength: 1 }),
  provider_id: Type.String({ minLength: 1 }),
  encounter_date: Type.String({ minLength: 1 }),
  service_codes: Type.Array(CPTCodeSchema, { minItems: 1 }),
  diagnosis_codes: Type.Array(ICD10CodeSchema, { minItems: 1 }),
  place_of_service: Type.Optional(Type.String()),
  facility_npi: Type.Optional(Type.String()),
  rendering_provider_npi: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
});

export type ChargeSkillInput = Static<typeof ChargeSkillInputSchema>;

export const ChargeSkillOutputSchema = Type.Object({
  charge_id: Type.String(),
  patient_id: Type.String(),
  provider_id: Type.String(),
  encounter_date: Type.String(),
  line_items: Type.Array(Type.Object({
    cpt_code: Type.String(),
    cpt_description: Type.Optional(Type.String()),
    units: Type.Number(),
    modifiers: Type.Array(Type.String()),
    diagnosis_pointers: Type.Array(Type.Number()),
  })),
  diagnosis_codes: Type.Array(Type.Object({
    sequence: Type.Number(),
    code: Type.String(),
    description: Type.Optional(Type.String()),
  })),
  place_of_service: Type.Optional(Type.String()),
  facility_npi: Type.Optional(Type.String()),
  rendering_provider_npi: Type.Optional(Type.String()),
  total_units: Type.Number(),
  created_at: Type.String(),
  status: Type.Literal('pending'),
  classification: Type.Object({
    domain: Type.Literal('administrative'),
    sensitivity: Type.Literal('sensitive'),
  }),
});

export type ChargeSkillOutput = Static<typeof ChargeSkillOutputSchema>;

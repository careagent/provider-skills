import { Type, type Static } from '@sinclair/typebox';

export const ChartEntryTypeSchema = Type.Union([
  Type.Literal('operative_note'),
  Type.Literal('history_and_physical'),
  Type.Literal('progress_note'),
  Type.Literal('consultation'),
  Type.Literal('discharge_summary'),
]);

export type ChartEntryType = Static<typeof ChartEntryTypeSchema>;

export const PatientInfoSchema = Type.Object({
  patient_id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  date_of_birth: Type.Optional(Type.String()),
});

export type PatientInfo = Static<typeof PatientInfoSchema>;

export const ChartSkillInputSchema = Type.Object({
  entry_type: ChartEntryTypeSchema,
  patient: PatientInfoSchema,
  encounter_date: Type.String({ minLength: 1 }),
  provider_id: Type.String({ minLength: 1 }),
  findings: Type.String({ minLength: 1 }),
  assessment: Type.String({ minLength: 1 }),
  plan: Type.String({ minLength: 1 }),
  chief_complaint: Type.Optional(Type.String()),
  subjective: Type.Optional(Type.String()),
  objective: Type.Optional(Type.String()),
  procedures: Type.Optional(Type.Array(Type.String())),
  medications: Type.Optional(Type.Array(Type.String())),
  allergies: Type.Optional(Type.Array(Type.String())),
});

export type ChartSkillInput = Static<typeof ChartSkillInputSchema>;

export const ChartSkillOutputSchema = Type.Object({
  entry_id: Type.String(),
  entry_type: ChartEntryTypeSchema,
  patient_id: Type.String(),
  provider_id: Type.String(),
  encounter_date: Type.String(),
  created_at: Type.String(),
  sections: Type.Record(Type.String(), Type.String()),
  classification: Type.Object({
    domain: Type.Literal('clinical'),
    sensitivity: Type.Literal('sensitive'),
  }),
});

export type ChartSkillOutput = Static<typeof ChartSkillOutputSchema>;

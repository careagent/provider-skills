import { Type, type Static } from '@sinclair/typebox';

export const MessageClassificationSchema = Type.Object({
  domain: Type.Union([Type.Literal('clinical'), Type.Literal('administrative')]),
  sensitivity: Type.Union([Type.Literal('sensitive'), Type.Literal('non-sensitive')]),
});

export type MessageClassification = Static<typeof MessageClassificationSchema>;

export const AgentCardRefSchema = Type.Object({
  agent_id: Type.String({ minLength: 1 }),
  endpoint: Type.String({ minLength: 1 }),
  name: Type.Optional(Type.String()),
});

export type AgentCardRef = Static<typeof AgentCardRefSchema>;

export const CommSkillInputSchema = Type.Object({
  provider_id: Type.String({ minLength: 1 }),
  patient_agent: AgentCardRefSchema,
  message_content: Type.String({ minLength: 1 }),
  message_type: Type.Union([
    Type.Literal('clinical_update'),
    Type.Literal('education'),
    Type.Literal('appointment'),
    Type.Literal('follow_up'),
    Type.Literal('general'),
  ]),
  classification: MessageClassificationSchema,
  context: Type.Optional(Type.Object({
    task_id: Type.Optional(Type.String()),
    encounter_id: Type.Optional(Type.String()),
    in_reply_to: Type.Optional(Type.String()),
  })),
});

export type CommSkillInput = Static<typeof CommSkillInputSchema>;

export const CommSkillOutputSchema = Type.Object({
  message_id: Type.String(),
  provider_id: Type.String(),
  recipient_agent_id: Type.String(),
  recipient_endpoint: Type.String(),
  message_type: Type.String(),
  content: Type.String(),
  classification: MessageClassificationSchema,
  a2a_metadata: Type.Object({
    method: Type.Literal('SendMessage'),
    task_id: Type.Optional(Type.String()),
    in_reply_to: Type.Optional(Type.String()),
  }),
  created_at: Type.String(),
});

export type CommSkillOutput = Static<typeof CommSkillOutputSchema>;

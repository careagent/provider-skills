import { Value } from '@sinclair/typebox/value';
import { CommSkillInputSchema, type CommSkillInput, type CommSkillOutput } from './schema.js';

export type { CommSkillInput, CommSkillOutput } from './schema.js';

export class PatientAgentCommSkill {
  static readonly metadata = {
    name: 'patient-agent-comm-skill',
    version: '1.0.0',
    description: 'Manages structured communication with patient agents via A2A protocol',
    required_credentials: ['active_license'] as const,
    clinical_actions: ['communicate', 'educate'] as const,
    classification: {
      domain: 'clinical' as const,
      sensitivity: 'sensitive' as const,
    },
  };

  static validate(input: unknown): { valid: boolean; errors?: string[] } {
    const valid = Value.Check(CommSkillInputSchema, input);
    if (valid) {
      return { valid: true };
    }
    const errors = [...Value.Errors(CommSkillInputSchema, input)].map(
      (e) => `${e.path}: ${e.message}`
    );
    return { valid: false, errors };
  }

  static execute(input: CommSkillInput): CommSkillOutput {
    const validation = PatientAgentCommSkill.validate(input);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors?.join('; ')}`);
    }

    return {
      message_id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      provider_id: input.provider_id,
      recipient_agent_id: input.patient_agent.agent_id,
      recipient_endpoint: input.patient_agent.endpoint,
      message_type: input.message_type,
      content: input.message_content,
      classification: {
        domain: input.classification.domain,
        sensitivity: input.classification.sensitivity,
      },
      a2a_metadata: {
        method: 'SendMessage',
        task_id: input.context?.task_id,
        in_reply_to: input.context?.in_reply_to,
      },
      created_at: new Date().toISOString(),
    };
  }
}

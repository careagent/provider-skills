import { describe, it, expect } from 'vitest';
import { PatientAgentCommSkill, type CommSkillInput } from '../src/skills/patient-agent-comm-skill/index.js';

const validInput: CommSkillInput = {
  provider_id: 'provider-npi-1275609489',
  patient_agent: {
    agent_id: 'patient-agent-001',
    endpoint: 'http://187.77.197.144:3000/a2a',
    name: 'Elizabeth Anderson Patient Agent',
  },
  message_content: 'Your MRI results show a mild L5-S1 disc herniation. We recommend physical therapy as the initial treatment approach.',
  message_type: 'clinical_update',
  classification: {
    domain: 'clinical',
    sensitivity: 'sensitive',
  },
  context: {
    task_id: 'task-abc-123',
    encounter_id: 'enc-456',
    in_reply_to: 'msg-prev-789',
  },
};

describe('PatientAgentCommSkill', () => {
  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(PatientAgentCommSkill.metadata.name).toBe('patient-agent-comm-skill');
      expect(PatientAgentCommSkill.metadata.version).toBe('1.0.0');
      expect(PatientAgentCommSkill.metadata.required_credentials).toEqual(['active_license']);
      expect(PatientAgentCommSkill.metadata.clinical_actions).toEqual(['communicate', 'educate']);
      expect(PatientAgentCommSkill.metadata.classification.domain).toBe('clinical');
      expect(PatientAgentCommSkill.metadata.classification.sensitivity).toBe('sensitive');
    });
  });

  describe('validate', () => {
    it('should accept valid input', () => {
      expect(PatientAgentCommSkill.validate(validInput).valid).toBe(true);
    });

    it('should accept input without optional context', () => {
      const { context: _, ...noContext } = validInput;
      expect(PatientAgentCommSkill.validate(noContext).valid).toBe(true);
    });

    it('should reject missing message content', () => {
      const result = PatientAgentCommSkill.validate({ ...validInput, message_content: '' });
      expect(result.valid).toBe(false);
    });

    it('should reject missing patient agent', () => {
      const { patient_agent: _, ...noAgent } = validInput;
      const result = PatientAgentCommSkill.validate(noAgent);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid message type', () => {
      const result = PatientAgentCommSkill.validate({ ...validInput, message_type: 'invalid' });
      expect(result.valid).toBe(false);
    });

    it('should reject invalid classification domain', () => {
      const result = PatientAgentCommSkill.validate({
        ...validInput,
        classification: { domain: 'invalid', sensitivity: 'sensitive' },
      });
      expect(result.valid).toBe(false);
    });

    it('should reject empty provider_id', () => {
      const result = PatientAgentCommSkill.validate({ ...validInput, provider_id: '' });
      expect(result.valid).toBe(false);
    });
  });

  describe('execute', () => {
    it('should produce a valid A2A message', () => {
      const output = PatientAgentCommSkill.execute(validInput);
      expect(output.message_id).toMatch(/^msg-/);
      expect(output.provider_id).toBe('provider-npi-1275609489');
      expect(output.recipient_agent_id).toBe('patient-agent-001');
      expect(output.recipient_endpoint).toBe('http://187.77.197.144:3000/a2a');
      expect(output.message_type).toBe('clinical_update');
      expect(output.content).toBe(validInput.message_content);
      expect(output.created_at).toBeTruthy();
    });

    it('should include classification metadata', () => {
      const output = PatientAgentCommSkill.execute(validInput);
      expect(output.classification.domain).toBe('clinical');
      expect(output.classification.sensitivity).toBe('sensitive');
    });

    it('should include A2A metadata', () => {
      const output = PatientAgentCommSkill.execute(validInput);
      expect(output.a2a_metadata.method).toBe('SendMessage');
      expect(output.a2a_metadata.task_id).toBe('task-abc-123');
      expect(output.a2a_metadata.in_reply_to).toBe('msg-prev-789');
    });

    it('should handle missing context gracefully', () => {
      const { context: _, ...noContext } = validInput;
      const output = PatientAgentCommSkill.execute(noContext as CommSkillInput);
      expect(output.a2a_metadata.task_id).toBeUndefined();
      expect(output.a2a_metadata.in_reply_to).toBeUndefined();
    });

    it('should support education message type', () => {
      const eduInput: CommSkillInput = {
        ...validInput,
        message_type: 'education',
        message_content: 'Disc herniation occurs when the soft center of a spinal disc pushes through a crack in the tougher exterior.',
      };
      const output = PatientAgentCommSkill.execute(eduInput);
      expect(output.message_type).toBe('education');
    });

    it('should support administrative classification', () => {
      const adminInput: CommSkillInput = {
        ...validInput,
        message_type: 'appointment',
        classification: { domain: 'administrative', sensitivity: 'non-sensitive' },
      };
      const output = PatientAgentCommSkill.execute(adminInput);
      expect(output.classification.domain).toBe('administrative');
      expect(output.classification.sensitivity).toBe('non-sensitive');
    });

    it('should throw on invalid input', () => {
      expect(() => PatientAgentCommSkill.execute({} as CommSkillInput)).toThrow('Invalid input');
    });
  });
});

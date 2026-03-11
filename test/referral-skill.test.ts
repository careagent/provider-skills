import { describe, it, expect } from 'vitest';
import { ReferralSkill, type ReferralSkillInput } from '../src/skills/referral-skill/index.js';

const validInput: ReferralSkillInput = {
  patient_id: 'patient-001',
  provider_id: 'provider-npi-1275609489',
  target_specialty: 'Neurosurgery',
  referral_reason: 'Evaluation for surgical management of L5-S1 disc herniation',
  urgency: 'routine',
  relevant_history: 'Right-sided sciatica x 6 months, failed conservative management',
  relevant_findings: 'MRI shows L5-S1 disc herniation with right S1 nerve root compression',
  relevant_imaging: ['MRI lumbar spine 2026-02-15', 'X-ray lumbar spine 2026-01-10'],
  relevant_labs: ['CBC normal', 'BMP normal'],
  specific_questions: [
    'Is the patient a candidate for minimally invasive discectomy?',
    'What is the expected recovery timeline?',
  ],
  preferred_provider: {
    name: 'Dr. Thomas Anderson',
    npi: '1275609489',
    agent_id: 'agent-anderson-001',
  },
};

describe('ReferralSkill', () => {
  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(ReferralSkill.metadata.name).toBe('referral-skill');
      expect(ReferralSkill.metadata.version).toBe('1.0.0');
      expect(ReferralSkill.metadata.required_credentials).toEqual(['active_license']);
      expect(ReferralSkill.metadata.clinical_actions).toEqual(['coordinate']);
      expect(ReferralSkill.metadata.classification.domain).toBe('clinical');
      expect(ReferralSkill.metadata.classification.sensitivity).toBe('sensitive');
    });
  });

  describe('validate', () => {
    it('should accept valid input', () => {
      expect(ReferralSkill.validate(validInput).valid).toBe(true);
    });

    it('should accept minimal input without optional fields', () => {
      const minimal: ReferralSkillInput = {
        patient_id: 'p1',
        provider_id: 'prov-1',
        target_specialty: 'Neurosurgery',
        referral_reason: 'Disc herniation evaluation',
        urgency: 'routine',
      };
      expect(ReferralSkill.validate(minimal).valid).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = ReferralSkill.validate({ patient_id: 'p1' });
      expect(result.valid).toBe(false);
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject invalid urgency', () => {
      const result = ReferralSkill.validate({ ...validInput, urgency: 'invalid' });
      expect(result.valid).toBe(false);
    });

    it('should reject empty target specialty', () => {
      const result = ReferralSkill.validate({ ...validInput, target_specialty: '' });
      expect(result.valid).toBe(false);
    });
  });

  describe('execute', () => {
    it('should produce a valid referral package', () => {
      const output = ReferralSkill.execute(validInput);
      expect(output.referral_id).toMatch(/^ref-/);
      expect(output.patient_id).toBe('patient-001');
      expect(output.referring_provider_id).toBe('provider-npi-1275609489');
      expect(output.target_specialty).toBe('Neurosurgery');
      expect(output.urgency).toBe('routine');
      expect(output.status).toBe('pending');
      expect(output.created_at).toBeTruthy();
    });

    it('should build clinical summary from all available data', () => {
      const output = ReferralSkill.execute(validInput);
      expect(output.clinical_summary).toContain('Neurosurgery');
      expect(output.clinical_summary).toContain(validInput.referral_reason);
      expect(output.clinical_summary).toContain('History:');
      expect(output.clinical_summary).toContain('Findings:');
      expect(output.clinical_summary).toContain('Imaging:');
      expect(output.clinical_summary).toContain('Labs:');
    });

    it('should build minimal clinical summary without optional data', () => {
      const minimal: ReferralSkillInput = {
        patient_id: 'p1',
        provider_id: 'prov-1',
        target_specialty: 'Orthopedics',
        referral_reason: 'Knee pain evaluation',
        urgency: 'routine',
      };
      const output = ReferralSkill.execute(minimal);
      expect(output.clinical_summary).toContain('Orthopedics');
      expect(output.clinical_summary).toContain('Knee pain evaluation');
      expect(output.clinical_summary).not.toContain('History:');
      expect(output.clinical_summary).not.toContain('Findings:');
    });

    it('should include specific questions for specialist', () => {
      const output = ReferralSkill.execute(validInput);
      expect(output.questions_for_specialist).toHaveLength(2);
      expect(output.questions_for_specialist[0]).toContain('minimally invasive');
    });

    it('should default questions to empty array when not provided', () => {
      const minimal: ReferralSkillInput = {
        patient_id: 'p1',
        provider_id: 'prov-1',
        target_specialty: 'PT',
        referral_reason: 'Rehab',
        urgency: 'routine',
      };
      const output = ReferralSkill.execute(minimal);
      expect(output.questions_for_specialist).toEqual([]);
    });

    it('should include preferred provider when provided', () => {
      const output = ReferralSkill.execute(validInput);
      expect(output.preferred_provider?.name).toBe('Dr. Thomas Anderson');
      expect(output.preferred_provider?.npi).toBe('1275609489');
    });

    it('should include classification metadata', () => {
      const output = ReferralSkill.execute(validInput);
      expect(output.classification.domain).toBe('clinical');
      expect(output.classification.sensitivity).toBe('sensitive');
    });

    it('should throw on invalid input', () => {
      expect(() => ReferralSkill.execute({} as ReferralSkillInput)).toThrow('Invalid input');
    });
  });
});

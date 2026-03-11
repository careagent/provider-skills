import { describe, it, expect } from 'vitest';
import { ChartSkill, type ChartSkillInput } from '../src/skills/chart-skill/index.js';

const validInput: ChartSkillInput = {
  entry_type: 'progress_note',
  patient: {
    patient_id: 'patient-001',
    name: 'Elizabeth Anderson',
    date_of_birth: '1975-03-15',
  },
  encounter_date: '2026-03-04',
  provider_id: 'provider-npi-1275609489',
  findings: 'Right leg sciatica, L5-S1 disc herniation on MRI',
  assessment: 'Lumbar radiculopathy, improving with conservative management',
  plan: 'Continue PT, follow up in 4 weeks, consider epidural if no improvement',
  chief_complaint: 'Right leg pain and numbness',
  subjective: 'Patient reports 40% improvement in leg pain since starting PT',
  objective: 'SLR negative bilaterally, 4+/5 dorsiflexion right',
};

describe('ChartSkill', () => {
  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(ChartSkill.metadata.name).toBe('chart-skill');
      expect(ChartSkill.metadata.version).toBe('1.0.0');
      expect(ChartSkill.metadata.required_credentials).toEqual(['active_license']);
      expect(ChartSkill.metadata.clinical_actions).toEqual(['chart']);
      expect(ChartSkill.metadata.classification.domain).toBe('clinical');
      expect(ChartSkill.metadata.classification.sensitivity).toBe('sensitive');
    });
  });

  describe('validate', () => {
    it('should accept valid input', () => {
      const result = ChartSkill.validate(validInput);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const result = ChartSkill.validate({ entry_type: 'progress_note' });
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject invalid entry type', () => {
      const result = ChartSkill.validate({ ...validInput, entry_type: 'invalid' });
      expect(result.valid).toBe(false);
    });

    it('should reject empty findings', () => {
      const result = ChartSkill.validate({ ...validInput, findings: '' });
      expect(result.valid).toBe(false);
    });

    it('should accept input without optional fields', () => {
      const minimal: ChartSkillInput = {
        entry_type: 'operative_note',
        patient: { patient_id: 'p1', name: 'Test Patient' },
        encounter_date: '2026-03-04',
        provider_id: 'prov-1',
        findings: 'Normal',
        assessment: 'Healthy',
        plan: 'Follow up PRN',
      };
      expect(ChartSkill.validate(minimal).valid).toBe(true);
    });
  });

  describe('execute', () => {
    it('should produce a valid chart entry', () => {
      const output = ChartSkill.execute(validInput);
      expect(output.entry_id).toMatch(/^chart-/);
      expect(output.entry_type).toBe('progress_note');
      expect(output.patient_id).toBe('patient-001');
      expect(output.provider_id).toBe('provider-npi-1275609489');
      expect(output.encounter_date).toBe('2026-03-04');
      expect(output.created_at).toBeTruthy();
      expect(output.classification.domain).toBe('clinical');
      expect(output.classification.sensitivity).toBe('sensitive');
    });

    it('should include all provided sections', () => {
      const output = ChartSkill.execute(validInput);
      expect(output.sections['findings']).toBe(validInput.findings);
      expect(output.sections['assessment']).toBe(validInput.assessment);
      expect(output.sections['plan']).toBe(validInput.plan);
      expect(output.sections['chief_complaint']).toBe(validInput.chief_complaint);
      expect(output.sections['subjective']).toBe(validInput.subjective);
      expect(output.sections['objective']).toBe(validInput.objective);
    });

    it('should omit undefined optional sections', () => {
      const minimal: ChartSkillInput = {
        entry_type: 'operative_note',
        patient: { patient_id: 'p1', name: 'Test' },
        encounter_date: '2026-03-04',
        provider_id: 'prov-1',
        findings: 'Normal',
        assessment: 'Good',
        plan: 'Follow up',
      };
      const output = ChartSkill.execute(minimal);
      expect(output.sections['chief_complaint']).toBeUndefined();
      expect(output.sections['subjective']).toBeUndefined();
    });

    it('should join array fields with semicolons', () => {
      const input: ChartSkillInput = {
        ...validInput,
        procedures: ['Lumbar puncture', 'EMG'],
        medications: ['Gabapentin 300mg', 'Ibuprofen 600mg'],
      };
      const output = ChartSkill.execute(input);
      expect(output.sections['procedures']).toBe('Lumbar puncture; EMG');
      expect(output.sections['medications']).toBe('Gabapentin 300mg; Ibuprofen 600mg');
    });

    it('should throw on invalid input', () => {
      expect(() => ChartSkill.execute({} as ChartSkillInput)).toThrow('Invalid input');
    });
  });
});

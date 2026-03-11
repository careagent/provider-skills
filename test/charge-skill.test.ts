import { describe, it, expect } from 'vitest';
import { ChargeSkill, type ChargeSkillInput } from '../src/skills/charge-skill/index.js';

const validInput: ChargeSkillInput = {
  patient_id: 'patient-001',
  provider_id: 'provider-npi-1275609489',
  encounter_date: '2026-03-04',
  service_codes: [
    {
      code: '99213',
      description: 'Office visit, established patient, moderate complexity',
      units: 1,
      modifiers: ['25'],
    },
    {
      code: '62322',
      description: 'Lumbar epidural steroid injection',
      units: 1,
    },
  ],
  diagnosis_codes: [
    { code: 'M54.31', description: 'Sciatica, right side' },
    { code: 'M51.16', description: 'Intervertebral disc degeneration, lumbar region' },
  ],
  place_of_service: '11',
  facility_npi: '1134943459',
  rendering_provider_npi: '1275609489',
  notes: 'Fluoroscopic guidance used for injection',
};

describe('ChargeSkill', () => {
  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(ChargeSkill.metadata.name).toBe('charge-skill');
      expect(ChargeSkill.metadata.version).toBe('1.0.0');
      expect(ChargeSkill.metadata.required_credentials).toEqual(['active_license', 'billing_privileges']);
      expect(ChargeSkill.metadata.clinical_actions).toEqual(['charge']);
      expect(ChargeSkill.metadata.classification.domain).toBe('administrative');
      expect(ChargeSkill.metadata.classification.sensitivity).toBe('sensitive');
    });
  });

  describe('validate', () => {
    it('should accept valid input', () => {
      expect(ChargeSkill.validate(validInput).valid).toBe(true);
    });

    it('should reject missing service codes', () => {
      const result = ChargeSkill.validate({ ...validInput, service_codes: [] });
      expect(result.valid).toBe(false);
    });

    it('should reject missing diagnosis codes', () => {
      const result = ChargeSkill.validate({ ...validInput, diagnosis_codes: [] });
      expect(result.valid).toBe(false);
    });

    it('should reject invalid CPT code format', () => {
      const result = ChargeSkill.validate({
        ...validInput,
        service_codes: [{ code: 'ABC', units: 1 }],
      });
      expect(result.valid).toBe(false);
    });

    it('should reject invalid ICD-10 code format', () => {
      const result = ChargeSkill.validate({
        ...validInput,
        diagnosis_codes: [{ code: '123' }],
      });
      expect(result.valid).toBe(false);
    });

    it('should reject zero units', () => {
      const result = ChargeSkill.validate({
        ...validInput,
        service_codes: [{ code: '99213', units: 0 }],
      });
      expect(result.valid).toBe(false);
    });

    it('should reject invalid modifier format', () => {
      const result = ChargeSkill.validate({
        ...validInput,
        service_codes: [{ code: '99213', units: 1, modifiers: ['invalid'] }],
      });
      expect(result.valid).toBe(false);
    });

    it('should accept input without optional fields', () => {
      const minimal: ChargeSkillInput = {
        patient_id: 'p1',
        provider_id: 'prov-1',
        encounter_date: '2026-03-04',
        service_codes: [{ code: '99213', units: 1 }],
        diagnosis_codes: [{ code: 'M54.31' }],
      };
      expect(ChargeSkill.validate(minimal).valid).toBe(true);
    });
  });

  describe('execute', () => {
    it('should produce a valid charge entry', () => {
      const output = ChargeSkill.execute(validInput);
      expect(output.charge_id).toMatch(/^chg-/);
      expect(output.patient_id).toBe('patient-001');
      expect(output.provider_id).toBe('provider-npi-1275609489');
      expect(output.encounter_date).toBe('2026-03-04');
      expect(output.status).toBe('pending');
      expect(output.created_at).toBeTruthy();
    });

    it('should create correct line items', () => {
      const output = ChargeSkill.execute(validInput);
      expect(output.line_items).toHaveLength(2);
      expect(output.line_items[0]!.cpt_code).toBe('99213');
      expect(output.line_items[0]!.units).toBe(1);
      expect(output.line_items[0]!.modifiers).toEqual(['25']);
      expect(output.line_items[0]!.diagnosis_pointers).toEqual([1]);
      expect(output.line_items[1]!.cpt_code).toBe('62322');
      expect(output.line_items[1]!.modifiers).toEqual([]);
    });

    it('should create sequenced diagnosis codes', () => {
      const output = ChargeSkill.execute(validInput);
      expect(output.diagnosis_codes).toHaveLength(2);
      expect(output.diagnosis_codes[0]!.sequence).toBe(1);
      expect(output.diagnosis_codes[0]!.code).toBe('M54.31');
      expect(output.diagnosis_codes[1]!.sequence).toBe(2);
      expect(output.diagnosis_codes[1]!.code).toBe('M51.16');
    });

    it('should calculate total units', () => {
      const output = ChargeSkill.execute(validInput);
      expect(output.total_units).toBe(2);
    });

    it('should include facility and provider NPIs', () => {
      const output = ChargeSkill.execute(validInput);
      expect(output.facility_npi).toBe('1134943459');
      expect(output.rendering_provider_npi).toBe('1275609489');
      expect(output.place_of_service).toBe('11');
    });

    it('should include classification metadata', () => {
      const output = ChargeSkill.execute(validInput);
      expect(output.classification.domain).toBe('administrative');
      expect(output.classification.sensitivity).toBe('sensitive');
    });

    it('should throw on invalid input', () => {
      expect(() => ChargeSkill.execute({} as ChargeSkillInput)).toThrow('Invalid input');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { OrderSkill, type OrderSkillInput } from '../src/skills/order-skill/index.js';

const validLabInput: OrderSkillInput = {
  order_type: 'lab',
  patient_id: 'patient-001',
  provider_id: 'provider-npi-1275609489',
  urgency: 'routine',
  clinical_justification: 'Baseline labs prior to surgery',
  diagnosis_codes: ['M54.31'],
  lab: {
    test_names: ['CBC', 'BMP', 'PT/INR'],
    specimen_type: 'blood',
    fasting_required: true,
  },
};

const validMedInput: OrderSkillInput = {
  order_type: 'medication',
  patient_id: 'patient-001',
  provider_id: 'provider-npi-1275609489',
  urgency: 'routine',
  clinical_justification: 'Pain management for lumbar radiculopathy',
  diagnosis_codes: ['M54.31'],
  medication: {
    drug_name: 'Gabapentin',
    dosage: '300mg',
    route: 'oral',
    frequency: 'TID',
    duration: '30 days',
    refills: 2,
  },
};

const validImagingInput: OrderSkillInput = {
  order_type: 'imaging',
  patient_id: 'patient-001',
  provider_id: 'provider-npi-1275609489',
  urgency: 'urgent',
  clinical_justification: 'Evaluate L5-S1 disc herniation',
  imaging: {
    modality: 'MRI',
    body_region: 'lumbar spine',
    contrast: true,
    clinical_question: 'Disc herniation with nerve root compression?',
  },
};

const validReferralInput: OrderSkillInput = {
  order_type: 'referral',
  patient_id: 'patient-001',
  provider_id: 'provider-npi-1275609489',
  urgency: 'routine',
  clinical_justification: 'Physical therapy for lumbar radiculopathy',
  referral: {
    target_specialty: 'Physical Therapy',
    reason: 'Core strengthening and McKenzie protocol for disc herniation',
    relevant_history: 'L5-S1 disc herniation with right-sided radiculopathy',
  },
};

describe('OrderSkill', () => {
  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(OrderSkill.metadata.name).toBe('order-skill');
      expect(OrderSkill.metadata.version).toBe('1.0.0');
      expect(OrderSkill.metadata.required_credentials).toEqual(['active_license', 'prescribing_authority']);
      expect(OrderSkill.metadata.clinical_actions).toEqual(['order']);
      expect(OrderSkill.metadata.classification.domain).toBe('clinical');
      expect(OrderSkill.metadata.classification.sensitivity).toBe('sensitive');
    });
  });

  describe('validate', () => {
    it('should accept valid lab input', () => {
      expect(OrderSkill.validate(validLabInput).valid).toBe(true);
    });

    it('should accept valid medication input', () => {
      expect(OrderSkill.validate(validMedInput).valid).toBe(true);
    });

    it('should accept valid imaging input', () => {
      expect(OrderSkill.validate(validImagingInput).valid).toBe(true);
    });

    it('should accept valid referral input', () => {
      expect(OrderSkill.validate(validReferralInput).valid).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = OrderSkill.validate({ order_type: 'lab' });
      expect(result.valid).toBe(false);
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject invalid order type', () => {
      const result = OrderSkill.validate({ ...validLabInput, order_type: 'invalid' });
      expect(result.valid).toBe(false);
    });

    it('should reject invalid urgency', () => {
      const result = OrderSkill.validate({ ...validLabInput, urgency: 'invalid' });
      expect(result.valid).toBe(false);
    });
  });

  describe('execute', () => {
    it('should produce a valid lab order', () => {
      const output = OrderSkill.execute(validLabInput);
      expect(output.order_id).toMatch(/^order-/);
      expect(output.order_type).toBe('lab');
      expect(output.status).toBe('pending');
      expect(output.details).toEqual({
        test_names: ['CBC', 'BMP', 'PT/INR'],
        specimen_type: 'blood',
        fasting_required: true,
      });
    });

    it('should produce a valid medication order', () => {
      const output = OrderSkill.execute(validMedInput);
      expect(output.order_type).toBe('medication');
      expect(output.details).toMatchObject({ drug_name: 'Gabapentin', dosage: '300mg' });
    });

    it('should produce a valid imaging order', () => {
      const output = OrderSkill.execute(validImagingInput);
      expect(output.order_type).toBe('imaging');
      expect(output.details).toMatchObject({ modality: 'MRI', body_region: 'lumbar spine' });
    });

    it('should produce a valid referral order', () => {
      const output = OrderSkill.execute(validReferralInput);
      expect(output.order_type).toBe('referral');
      expect(output.details).toMatchObject({ target_specialty: 'Physical Therapy' });
    });

    it('should throw when medication details missing for medication order', () => {
      const input: OrderSkillInput = {
        order_type: 'medication',
        patient_id: 'p1',
        provider_id: 'prov-1',
        urgency: 'routine',
        clinical_justification: 'Pain management',
      };
      expect(() => OrderSkill.execute(input)).toThrow('Medication details required');
    });

    it('should throw when lab details missing for lab order', () => {
      const input: OrderSkillInput = {
        order_type: 'lab',
        patient_id: 'p1',
        provider_id: 'prov-1',
        urgency: 'routine',
        clinical_justification: 'Baseline labs',
      };
      expect(() => OrderSkill.execute(input)).toThrow('Lab details required');
    });

    it('should throw when imaging details missing for imaging order', () => {
      const input: OrderSkillInput = {
        order_type: 'imaging',
        patient_id: 'p1',
        provider_id: 'prov-1',
        urgency: 'routine',
        clinical_justification: 'Evaluate spine',
      };
      expect(() => OrderSkill.execute(input)).toThrow('Imaging details required');
    });

    it('should throw when referral details missing for referral order', () => {
      const input: OrderSkillInput = {
        order_type: 'referral',
        patient_id: 'p1',
        provider_id: 'prov-1',
        urgency: 'routine',
        clinical_justification: 'Specialist evaluation',
      };
      expect(() => OrderSkill.execute(input)).toThrow('Referral details required');
    });

    it('should default diagnosis_codes to empty array when not provided', () => {
      const output = OrderSkill.execute(validLabInput);
      expect(output.diagnosis_codes).toEqual(['M54.31']);

      const inputNoDx: OrderSkillInput = { ...validLabInput, diagnosis_codes: undefined };
      const output2 = OrderSkill.execute(inputNoDx);
      expect(output2.diagnosis_codes).toEqual([]);
    });

    it('should include classification metadata', () => {
      const output = OrderSkill.execute(validLabInput);
      expect(output.classification.domain).toBe('clinical');
      expect(output.classification.sensitivity).toBe('sensitive');
    });

    it('should throw on invalid input', () => {
      expect(() => OrderSkill.execute({} as OrderSkillInput)).toThrow('Invalid input');
    });
  });
});

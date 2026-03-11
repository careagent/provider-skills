import { describe, it, expect } from 'vitest';
import { SkillRegistry } from '../src/registry.js';

describe('SkillRegistry', () => {
  it('should list all 5 skills', () => {
    const skills = SkillRegistry.list();
    expect(skills).toHaveLength(5);
    expect(skills).toContain('chart-skill');
    expect(skills).toContain('order-skill');
    expect(skills).toContain('patient-agent-comm-skill');
    expect(skills).toContain('referral-skill');
    expect(skills).toContain('charge-skill');
  });

  it('should get metadata for a skill', () => {
    const meta = SkillRegistry.getMetadata('chart-skill');
    expect(meta).toBeDefined();
    expect(meta!.name).toBe('chart-skill');
    expect(meta!.version).toBe('1.0.0');
  });

  it('should return undefined for unknown skill', () => {
    expect(SkillRegistry.getMetadata('unknown')).toBeUndefined();
  });

  it('should check if skill exists', () => {
    expect(SkillRegistry.has('chart-skill')).toBe(true);
    expect(SkillRegistry.has('nonexistent')).toBe(false);
  });

  it('should find skills by clinical action', () => {
    const chartSkills = SkillRegistry.findByAction('chart');
    expect(chartSkills).toHaveLength(1);
    expect(chartSkills[0]!.name).toBe('chart-skill');

    const orderSkills = SkillRegistry.findByAction('order');
    expect(orderSkills).toHaveLength(1);
    expect(orderSkills[0]!.name).toBe('order-skill');

    const coordSkills = SkillRegistry.findByAction('coordinate');
    expect(coordSkills).toHaveLength(1);
    expect(coordSkills[0]!.name).toBe('referral-skill');

    const commSkills = SkillRegistry.findByAction('communicate');
    expect(commSkills).toHaveLength(1);
    expect(commSkills[0]!.name).toBe('patient-agent-comm-skill');

    const eduSkills = SkillRegistry.findByAction('educate');
    expect(eduSkills).toHaveLength(1);
    expect(eduSkills[0]!.name).toBe('patient-agent-comm-skill');
  });

  it('should find skills by credentials', () => {
    // active_license only should match chart, patient-agent-comm, referral
    const basicSkills = SkillRegistry.findByCredentials(['active_license']);
    const basicNames = basicSkills.map((s) => s.name);
    expect(basicNames).toContain('chart-skill');
    expect(basicNames).toContain('patient-agent-comm-skill');
    expect(basicNames).toContain('referral-skill');
    expect(basicNames).not.toContain('order-skill'); // also needs prescribing_authority
    expect(basicNames).not.toContain('charge-skill'); // also needs billing_privileges
  });

  it('should find all skills with full credentials', () => {
    const allSkills = SkillRegistry.findByCredentials([
      'active_license',
      'prescribing_authority',
      'billing_privileges',
    ]);
    expect(allSkills).toHaveLength(5);
  });

  it('should return empty when no credentials match', () => {
    const noSkills = SkillRegistry.findByCredentials([]);
    expect(noSkills).toHaveLength(0);
  });

  it('should get a skill entry with execute and validate', () => {
    const entry = SkillRegistry.get('chart-skill');
    expect(entry).toBeDefined();
    expect(typeof entry!.validate).toBe('function');
    expect(typeof entry!.execute).toBe('function');
    expect(entry!.metadata.name).toBe('chart-skill');
  });
});

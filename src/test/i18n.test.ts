import { describe, it, expect } from 'vitest';
import { translations } from '../services/i18n';

describe('i18n Multi-Language Localization Engine', () => {
  it('contains English, Liberian Kolokwa, Kpelle, and Bassa translations for core navigation', () => {
    expect(translations.hospitalName.en).toBe('J & J Memorial e-Hospital');
    expect(translations.hospitalName.kol).toBe('J & J Memorial Big Hospital');
    expect(translations.hospitalName.kpe).toBe('J & J Memorial Tɔkpɔ Kali');
    expect(translations.hospitalName.bas).toBe('J & J Memorial Bɔɖɔ Gbo');
  });

  it('provides vernacular translations for vital clinical terms', () => {
    expect(translations.bloodPressure.kol).toContain('Blood Running Speed');
    expect(translations.triage.kol).toContain('Who Sick Pass Line');
    expect(translations.offlineNotice.kol).toContain('No Internet Now');
  });
});

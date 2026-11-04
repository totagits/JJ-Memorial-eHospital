import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';

export interface Translations {
  [key: string]: {
    en: string;
    kol: string; // Liberian Kolokwa English
    kpe: string; // Kpelle
    bas: string; // Bassa
  };
}

export const translations: Translations = {
  // Navigation & Brand
  hospitalName: {
    en: 'J & J Memorial e-Hospital',
    kol: 'J & J Memorial Big Hospital',
    kpe: 'J & J Memorial Tɔkpɔ Kali',
    bas: 'J & J Memorial Bɔɖɔ Gbo'
  },
  tagline: {
    en: 'Connected Care, Intelligent Operations',
    kol: 'Care Dat Join Us Together, Sharp Hospital Work',
    kpe: 'M̀áŋgɛ́ mɔ́ kɛ́nɛ́, kɔ̀lɔ̀-ŋa tákpáá',
    bas: 'Gbo-ɖɔ̀ kɛ̃́, nììn-hwɛ̀ìn hwìɖì'
  },
  home: {
    en: 'Home',
    kol: 'Main House',
    kpe: 'Pɛ́rɛ́',
    bas: 'Gba'
  },
  departments: {
    en: 'Departments',
    kol: 'Doctor Quarters',
    kpe: 'Tɔkpɔ Wɔ́lɔ́-ŋa',
    bas: 'Gbo Wɔ̀-ɖɔ̀'
  },
  findDoctor: {
    en: 'Find a Doctor',
    kol: 'Look for Doctor',
    kpe: 'Tɔkpɔ-nuu gáa',
    bas: 'Gbo-nyɔ̀ hwìɖì'
  },
  emergency: {
    en: 'Emergency (24/7)',
    kol: 'Emergency Right Now (Day & Night)',
    kpe: 'Kpáá-kpáá (Kpíni da Yele)',
    bas: 'Kpéé-hwɛ̀ (Wɔ̃́ ké Zɔ̃)'
  },
  bookAppointment: {
    en: 'Book Appointment',
    kol: 'Catch Your Number',
    kpe: 'Goo tɛɛ tɔkpɔ-nuu pɔ',
    bas: 'Sɔ̃ɔ́ìn zɔ̃ɔ'
  },
  patientPortal: {
    en: 'Patient Portal',
    kol: 'Sick People Corner',
    kpe: 'Nuu-ŋa kpɛ́tɛ́ pɛ́rɛ́',
    bas: 'Nyɔ-wɔ̃́ gbo'
  },
  staffWorkspace: {
    en: 'Staff Workspace',
    kol: 'Hospital Workers Office',
    kpe: 'Ti-kɛ-nuu-ŋa pɛ́rɛ́',
    bas: 'Kù-nyɔ̀-wɔ̃́ gbo'
  },
  facilityLocator: {
    en: 'Clinic Locations',
    kol: 'Where Di Clinic Dem Dey',
    kpe: 'Tɔkpɔ-pɛrɛ-ŋa gáá',
    bas: 'Gbo-wɔ̀-ɖɔ̀ nyíɛ'
  },
  testimonials: {
    en: 'Patient Testimonials',
    kol: 'Wetin People Say Bout Us',
    kpe: 'Nuu-ŋa woo kɔ́lɛ́',
    bas: 'Nyɔ-wɔ̃́ gbo bɔ̃̌'
  },
  hospitalNews: {
    en: 'Hospital News & Alerts',
    kol: 'Hospital News Dem & Warnings',
    kpe: 'Sia-wo-ŋa tɔkpɔ pɛrɛ su',
    bas: 'Wɔ̃́-hwɛ̀ìn bɔ̃̌'
  },
  faq: {
    en: 'Frequently Asked Questions',
    kol: 'Questions People Always Ask',
    kpe: 'Marê-kɛ-ŋa kpɛ́lí',
    bas: 'Nyɔ-wɔ̃́ marê'
  },
  // Clinical & Vitals terms
  vitalsTracker: {
    en: 'Patient Vitals Tracker',
    kol: 'Check Your Pressure & Heartbeat',
    kpe: 'Nì-pɔ̀lɔ̀ néni kɛ̀-ŋa',
    bas: 'Kpéé nì-nyɛ bɔ̃̌'
  },
  bloodPressure: {
    en: 'Blood Pressure',
    kol: 'Blood Running Speed (BP)',
    kpe: 'Nì-pɔ̀lɔ̀ kpáŋ-kpaŋ',
    bas: 'Nì-pɔ̀lɔ̀ kpáá'
  },
  heartRate: {
    en: 'Heart Rate',
    kol: 'Heart Beat (Pulse)',
    kpe: 'Lii kpáŋ',
    bas: 'Hwìɖì kpáá'
  },
  bloodGlucose: {
    en: 'Blood Sugar',
    kol: 'Sweet Blood (Sugar)',
    kpe: 'Nì-pɔ̀lɔ̀ su kɛ́nyɛ́',
    bas: 'Nì-sùgà'
  },
  oxygenLevel: {
    en: 'Oxygen Level (SPO2)',
    kol: 'Air in Your Body',
    kpe: 'Fóli nì-pɔ̀lɔ̀ su',
    bas: 'Fóɖó bɔ̃̌'
  },
  digitalConsent: {
    en: 'Digital Consent Sign-off',
    kol: 'Sign Paper on Phone / Computer',
    kpe: 'Kɔ́lɔ́ su ŋɛi sâa',
    bas: 'Sɔ̃ɔ́ìn cɛ̃́ɛ̃́'
  },
  telehealth: {
    en: 'Telehealth Video Consultation',
    kol: 'Talk to Doctor on Video',
    kpe: 'Tɔkpɔ-nuu ŋɛi kɛi tɛlivísiɔŋ su',
    bas: 'Cɛ̃́ gbo-nyɔ̀ nììn'
  },
  pharmacy: {
    en: 'Pharmacy & Medicine',
    kol: 'Medicine Store',
    kpe: 'Sálê pɛ́rɛ́',
    bas: 'Sálê gbo'
  },
  bloodBank: {
    en: 'Blood Bank Inventory',
    kol: 'Blood Bank House',
    kpe: 'Nì-pɔ̀lɔ̀ kɛ́nɛ́ pɛ́rɛ́',
    bas: 'Nì-pɔ̀lɔ̀ bɔ̀ɖɔ̀'
  },
  triage: {
    en: 'Emergency Triage Queue',
    kol: 'Who Sick Pass Line (Triage)',
    kpe: 'Kpáá-kpáá kpɛ́tɛ́ kɛ́nɛ́',
    bas: 'Kpéé kpáá nyɔ-zɔ̃'
  },
  offlineNotice: {
    en: 'Offline Mode: Data saved locally. Syncs when internet returns.',
    kol: 'No Internet Now: Everything safe inside. It will send when net come back.',
    kpe: 'Net fale: Kɔ́lɔ́-ŋa ma tɛɛ ku pɔ́. Kwa pa gáa net ku pa.',
    bas: 'Net se: Kɔ́lɔ́ nyíɛ gbɔ̌. Ɔ mɛ̀ nì net pa.'
  },
  save: {
    en: 'Save Changes',
    kol: 'Keep Am Good',
    kpe: 'Gɛ ma tɛɛ',
    bas: 'Kpáɖá'
  },
  submit: {
    en: 'Submit',
    kol: 'Send Am Go',
    kpe: 'Tɛɛ',
    bas: 'Tɛ̃̀'
  },
  cancel: {
    en: 'Cancel',
    kol: 'Leave Am',
    kpe: 'Maa tɛɛ',
    bas: 'Jɛ̀'
  }
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof translations) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('jj_language');
    return (saved as SupportedLanguage) || 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('jj_language', lang);
  };

  const t = (key: keyof typeof translations): string => {
    const entry = translations[key];
    if (!entry) return String(key);
    return entry[language] || entry.en || String(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

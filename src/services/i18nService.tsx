import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'kreyol' | 'bassa';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeName: 'Standard English',
    flag: '🇱🇷',
    description: 'Official Liberian healthcare English'
  },
  {
    code: 'kreyol',
    label: 'Liberian Kolokwa',
    nativeName: 'Liberian Kreyol (Kolokwa)',
    flag: '🤝',
    description: 'Everyday vernacular for easy patient understanding'
  },
  {
    code: 'bassa',
    label: 'Bassa Care Guide',
    nativeName: 'Bassa Phrase Guide',
    flag: '🌿',
    description: 'Essential indigenous patient care guidance'
  }
];

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    kreyol: string;
    bassa: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // Navigation & Branding
  'hospital.name': {
    en: 'J & J Memorial e-Hospital',
    kreyol: 'J & J Memorial Big Hospital',
    bassa: 'J & J Memorial Kpɔ̃-nyɔ Hospital'
  },
  'hospital.tagline': {
    en: 'Connected Care, Intelligent Operations',
    kreyol: 'Fine-fine Doctor Work & Fast-fast Service',
    bassa: 'Gba-gba Càre kè Sĩ-kɛ̃ɛ'
  },
  'nav.home': {
    en: 'Home',
    kreyol: 'Main House',
    bassa: 'Gba'
  },
  'nav.about': {
    en: 'About J & J',
    kreyol: 'All About Us',
    bassa: 'Bɛ́ nyɛ́ mú'
  },
  'nav.services': {
    en: 'Services & Specialties',
    kreyol: 'Treatment & Clinic Work',
    bassa: 'Dyu-kù dɔ̃'
  },
  'nav.doctors': {
    en: 'Find a Doctor',
    kreyol: 'Look for Doctor',
    bassa: 'Hwɔ̀ Dɔkta'
  },
  'nav.portal': {
    en: 'Patient Portal',
    kreyol: 'Your Health Room',
    bassa: 'Nyɔ́-ɓe-gĩ'
  },
  'nav.health': {
    en: 'Health Guides',
    kreyol: 'Body Health Advice',
    bassa: 'Kɔ́-kɛ̃ɛ wudu'
  },
  'nav.contact': {
    en: 'Contact & Directions',
    kreyol: 'Call Us & Find Road',
    bassa: 'Wudu kè Gba-kpá'
  },
  'nav.bookAppointment': {
    en: 'Book Doctor Appointment',
    kreyol: 'Put Doctor Time Down',
    bassa: 'Té Dɔkta cɛ̃́'
  },
  'emergency.hotline': {
    en: 'Emergency 24/7: +231 (0) 770-JJ-MEM',
    kreyol: 'Emergency Day & Night: +231 (0) 770-JJ-MEM',
    bassa: 'Sɛ̀-wɔ̃ Gba: +231 (0) 770-JJ-MEM'
  },
  'emergency.power': {
    en: 'Grid & 500kVA Cummins Power Backup Active',
    kreyol: 'Current Never Cut: 500kVA Generator & Solar Working',
    bassa: 'Káà-pawa dɛ̀ kpaa vɛ̃'
  },

  // Portal Actions & Notifications
  'portal.welcome': {
    en: 'Welcome to your Patient Health Portal',
    kreyol: 'Welcome to your Body Health Room',
    bassa: 'Ɓi-hwɛ̀ ɓó dɛ̀-càre gĩ'
  },
  'portal.notifications': {
    en: 'Notifications & Alerts',
    kreyol: 'Hospital Messages & Alerts',
    bassa: 'Nyɛ́-wudu kè Gĩ'
  },
  'portal.appointments': {
    en: 'Upcoming Appointments',
    kreyol: 'Your Clinic Appointments Coming Up',
    bassa: 'Dɔkta cɛ̃́ kɔ̃-hwɛ̀'
  },
  'portal.prescriptions': {
    en: 'Prescriptions & Medication',
    kreyol: 'Your Medicine List & Pharmacy',
    bassa: 'Sĩ-kɛ̃ɛ dyi-dɛ̀'
  },
  'portal.labResults': {
    en: 'Diagnostic & Lab Reports',
    kreyol: 'Blood & Urine Test Papers',
    bassa: 'Nyɔ́-mɛ gĩ kɔ̃'
  },
  'portal.vitals': {
    en: 'Personal Vitals Tracker',
    kreyol: 'Track Your Pressure & Heartbeat',
    bassa: 'Dɛ̀-kɔ́ zà-kɛ̃ɛ'
  },
  'portal.digitalConsent': {
    en: 'Digital Consent Forms',
    kreyol: 'Sign Treatment Papers Online',
    bassa: 'Cɛ̃́-kpa wudu kpa'
  },
  'portal.feedback': {
    en: 'Submit Patient Feedback',
    kreyol: 'Tell Us How We Treated You',
    bassa: 'Gbo-wudu bɛ́ càre dɔ̃'
  },
  'portal.downloadForms': {
    en: 'Download Hospital Forms',
    kreyol: 'Take Hospital Forms PDF',
    bassa: 'Wudu-kpa dyi-mú'
  },
  'portal.medCalendar': {
    en: 'Care & Medication Calendar',
    kreyol: 'Calendar for Pills & Visits',
    bassa: 'Cɛ̃́ kè Sĩ-kɛ̃ɛ kɔ̃'
  },

  // Staff & Clinical Terms
  'staff.switch': {
    en: 'Staff Workspace Login',
    kreyol: 'Doctor & Nurse Office',
    bassa: 'Dɔkta kè Nɛ̀ɛsĩ Gba'
  },
  'staff.offline': {
    en: 'Operating on Local Resilient Cache',
    kreyol: 'Internet down, but patient records safe on machine',
    bassa: 'Intanɛ̀t se dɛ̀, kɛɛ nyɔ́ wudu kpaa'
  },
  'staff.bloodBank': {
    en: 'Blood Bank & Transfusion Unit',
    kreyol: 'Blood Bank & Donor Store',
    bassa: 'Nyɔ́-mɛ dɛ̀-gba'
  },
  'staff.globalSearch': {
    en: 'Search Patients, MRN, phone, records (Ctrl+K)...',
    kreyol: 'Find patient by name, number, or MRN (Ctrl+K)...',
    bassa: 'Hwɔ̀ nyɔ́ nyɛ́ kè nɔ́mba (Ctrl+K)...'
  }
};

interface I18nContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key, defaultText) => defaultText || key
});

const LANGUAGE_STORAGE_KEY = 'jjmemorial_user_language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
      if (saved && (saved === 'en' || saved === 'kreyol' || saved === 'bassa')) {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    if (entry && entry.en) {
      return entry.en;
    }
    return defaultText || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);

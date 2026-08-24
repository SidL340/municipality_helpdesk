import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'np', label: 'नेपाली', full: 'Nepali (नेपाली)' },
  { code: 'mai', label: 'मैथिली', full: 'Maithili (मैथिली)' },
  { code: 'bho', label: 'भोजपुरी', full: 'Bhojpuri (भोजपुरी)' },
  { code: 'new', label: 'नेपाल भाषा', full: 'Newari (नेपाल भाषा)' },
  { code: 'en', label: 'English', full: 'English' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem('kiosk_lang') || 'np'
  );

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('kiosk_lang', langCode);
  };

  /**
   * Helper that picks the best available translation:
   * Returns requested language, or falls back to Nepali, then English.
   */
  const t = (item, fieldPrefix = 'name') => {
    if (!item) return '';
    if (typeof item === 'string') return item;

    const key = `${fieldPrefix}_${language}`;
    if (item[key]) return item[key];

    // Fallbacks
    if (item[`${fieldPrefix}_np`]) return item[`${fieldPrefix}_np`];
    if (item[`${fieldPrefix}_en`]) return item[`${fieldPrefix}_en`];
    return '';
  };

  // Static UI dictionary for common kiosk phrases
  const dict = {
    welcome: {
      np: 'कृपया आफ्नो सेवा छान्नुहोस्',
      mai: 'कृपा कए अपन सेवा चुनू',
      bho: 'कृपा कके आपन सेवा चुनीं',
      new: 'कृपया थःगु सेवा ल्ययादिसँ',
      en: 'Please Select Your Service',
    },
    subWelcome: {
      np: 'तलका विकल्पहरू मध्ये एउटा छनौट गर्नुहोस्',
      mai: 'नीचा देल विकल्प सभ मे सँ एकटा चुनू',
      bho: 'नीचे दिहल विकल्प में से एगो चुनीं',
      new: 'क्वे बियातःगु विकल्पय् छगू ल्ययादिसँ',
      en: 'Choose one of the options below',
    },
    reqDocs: {
      np: 'आवश्यक कागजातहरू',
      mai: 'आवश्यक कागजात सभ',
      bho: 'जरूरी कागज पत्र',
      new: 'माःगु भ्वंपिं (कागजात)',
      en: 'Required Documents',
    },
    getToken: {
      np: 'टोकन लिनुहोस्',
      mai: 'टोकन ली',
      bho: 'टोकन लीं',
      new: 'टोकन कयादिसँ',
      en: 'Get Token',
    },
    generating: {
      np: 'टोकन बन्दैछ...',
      mai: 'टोकन बनैत अछि...',
      bho: 'टोकन बनत बा...',
      new: 'टोकन दयेकाच्वंगु दु...',
      en: 'Generating Token...',
    },
    listen: {
      np: 'सुन्नुहोस्',
      mai: 'सुनू',
      bho: 'सुनीं',
      new: 'न्यनादिसँ',
      en: 'Listen',
    },
    stop: {
      np: 'रोक्नुहोस्',
      mai: 'रोकू',
      bho: 'रोकीं',
      new: 'दिकादिसँ',
      en: 'Stop',
    },
    backHome: {
      np: 'मुख्य पृष्ठ',
      mai: 'मुख्य पृष्ठ',
      bho: 'होम पेज',
      new: 'मू पौ',
      en: 'Home',
    },
    counter: {
      np: 'काउन्टर',
      mai: 'काउन्टर',
      bho: 'काउन्टर',
      new: 'काउन्टर',
      en: 'Counter',
    },
    yourToken: {
      np: 'तपाईंको टोकन नम्बर',
      mai: 'अहाँक टोकन नम्बर',
      bho: 'रउरा के टोकन नम्बर',
      new: 'छिगु टोकन ल्याः',
      en: 'Your Token Number',
    },
    pleaseWait: {
      np: 'कृपया आफ्नो पालो कुर्नुहोस्',
      mai: 'कृपा कए अपन बारी के प्रतीक्षा करू',
      bho: 'कृपा कके आपन बारी के इंतजार करीं',
      new: 'कृपया थःगु पाः पियादिसँ',
      en: 'Please wait for your turn',
    },
  };

  const getPhrase = (key) => {
    return dict[key]?.[language] || dict[key]?.['np'] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, getPhrase, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

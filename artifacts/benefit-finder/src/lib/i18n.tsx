import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.schemes": "Browse Schemes",
    "nav.saved": "Saved",
    "nav.check": "Check Eligibility",
    "hero.title": "Find Government Benefits You Deserve",
    "hero.subtitle": "A simple way for Indian students, families, and seniors to discover and apply for government schemes.",
    "hero.cta": "Check My Eligibility",
    "stats.schemes": "Active Schemes",
    "stats.checks": "People Helped",
    "stats.states": "States Covered",
    "form.next": "Next Step",
    "form.submit": "Find My Schemes",
    "voice.listen": "Listening...",
    "voice.start": "Tap to speak",
    "voice.unsupported": "Voice not supported",
    "common.loading": "Loading...",
    "common.save": "Save for later",
    "common.saved": "Saved",
    "scheme.benefits": "Benefits",
    "scheme.docs": "Required Documents",
    "scheme.apply": "How to Apply",
    "scheme.link": "Official Website",
    "scheme.why": "Why you qualify",
  },
  hi: {
    "nav.home": "होम",
    "nav.schemes": "योजनाएं खोजें",
    "nav.saved": "सेव की गई",
    "nav.check": "पात्रता जांचें",
    "hero.title": "अपने लिए सही सरकारी योजनाएं खोजें",
    "hero.subtitle": "भारतीय छात्रों, परिवारों और बुजुर्गों के लिए सरकारी योजनाओं को खोजने और आवेदन करने का एक सरल तरीका।",
    "hero.cta": "मेरी पात्रता जांचें",
    "stats.schemes": "सक्रिय योजनाएं",
    "stats.checks": "लोगों की मदद की",
    "stats.states": "राज्य शामिल",
    "form.next": "अगला कदम",
    "form.submit": "मेरी योजनाएं खोजें",
    "voice.listen": "सुन रहा हूँ...",
    "voice.start": "बोलने के लिए टैप करें",
    "voice.unsupported": "वॉइस समर्थित नहीं है",
    "common.loading": "लोड हो रहा है...",
    "common.save": "बाद के लिए सेव करें",
    "common.saved": "सेव कर लिया",
    "scheme.benefits": "लाभ",
    "scheme.docs": "आवश्यक दस्तावेज़",
    "scheme.apply": "आवेदन कैसे करें",
    "scheme.link": "आधिकारिक वेबसाइट",
    "scheme.why": "आप क्यों पात्र हैं",
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

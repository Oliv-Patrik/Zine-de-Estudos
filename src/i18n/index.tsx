import React, { createContext, useContext, useState, useEffect } from 'react';
import ptBR from './pt-BR.json';
import en from './en.json';
import { AppLanguage } from '../types';

type TranslationDictionary = typeof ptBR;

interface I18nContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (dateStr: string, options?: Intl.DateTimeFormatOptions) => string;
  formatMinutes: (totalMinutes: number) => string;
  formatNumber: (num: number) => string;
}

const dictionaries: Record<AppLanguage, TranslationDictionary> = {
  'pt-BR': ptBR,
  en: en as unknown as TranslationDictionary,
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{
  initialLang?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  children: React.ReactNode;
}> = ({ initialLang = 'pt-BR', onLanguageChange, children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(initialLang);

  useEffect(() => {
    setLanguageState(initialLang);
  }, [initialLang]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let current: any = dictionaries[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to pt-BR if missing in EN
        let fallback: any = dictionaries['pt-BR'];
        for (const fb of keys) {
          if (fallback && typeof fallback === 'object' && fb in fallback) {
            fallback = fallback[fb];
          } else {
            return key;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return key;
    }

    let result = current;
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return result;
  };

  const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat(
        language === 'pt-BR' ? 'pt-BR' : 'en-US',
        options || { day: '2-digit', month: 'short', year: 'numeric' }
      ).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (language === 'pt-BR') {
      if (hours === 0) return `${mins}m`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    } else {
      if (hours === 0) return `${mins}m`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US').format(num);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatDate,
        formatMinutes,
        formatNumber,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

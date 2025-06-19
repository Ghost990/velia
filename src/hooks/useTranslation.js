import { useState, useEffect } from 'react';

export const useTranslation = (language = 'hu') => {
  const [translations, setTranslations] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState(language);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadTranslations = async (lang) => {
    try {
      const translationModule = await import(`../translations/${lang}.json`);
      setTranslations(translationModule.default);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to Hungarian
      if (lang !== 'hu') {
        const fallback = await import('../translations/hu.json');
        setTranslations(fallback.default);
      }
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    if (typeof value === 'string') {
      // Replace parameters in the translation
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return key;
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    translations
  };
};
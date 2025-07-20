import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from './LanguageContext';
mport { translateText } from './translationService.js'; 

async function fetchTranslation(text, targetLang) {
  if (targetLang === 'en' || !text.trim()) {
    return text;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    throw new Error("Invalid translation response format.");
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
}

const Translate = ({ children }) => {
  const { language } = useContext(LanguageContext);
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    const translate = async () => {
      const result = await fetchTranslation(children, language);
      setTranslatedText(result);
    };

    translate();
  }, [children, language]);

  return <>{translatedText}</>;
};

export default Translate;

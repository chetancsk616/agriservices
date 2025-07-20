/**
 * Translates a given text to a target language.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code (e.g., 'es', 'fr').
 * @returns {Promise<string>} The translated text.
 */
export async function translateText(text, targetLang) {
  if (targetLang === 'en' || !text || !text.trim()) {
    return text;
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    throw new Error("Invalid translation response");
  } catch (error) {
    console.error("Translation Error:", error);
    return text; // Return original text on failure
  }
}

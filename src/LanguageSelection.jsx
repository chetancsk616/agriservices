import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext.jsx';
import './style.css';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { setLanguage } = useContext(LanguageContext);

  const handleLanguageClick = (lang) => {
    setLanguage(lang);
    navigate('/main/0');
  };
  
  const handleSpeak = (event, text, langCode) => {
    event.stopPropagation();

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  return (
    <div className='scroll1'>
      <div className="main">
        <h1 className="h en">::Please Select a Language::</h1>
        <h1 className="h te">::దయచేసి ఒక భాషను ఎంచుకోండి::</h1>
        <h1 className="h hi">::कृपया एक भाषा चुनें::</h1>
        <h1 className="h ta">::தயவுசெய்து ஒரு மொழியைத் தேர்ந்தெடுக்கவும்::</h1>
      </div>

      <div className="select">
        <div className="lang" onClick={() => handleLanguageClick('en')}>
          <div
            className="sound"
            onClick={(e) => handleSpeak(e, 'English', 'en-US')}
          ></div>
          English
        </div>

        <div className="lang" onClick={() => handleLanguageClick('te')}>
          <div
            className="sound"
            onClick={(e) => handleSpeak(e, 'తెలుగు', 'te-IN')}
          ></div>
          తెలుగు
        </div>

        <div className="lang" onClick={() => handleLanguageClick('hi')}>
          <div
            className="sound"
            onClick={(e) => handleSpeak(e, 'हिन्दी', 'hi-IN')}
          ></div>
          हिन्दी
        </div>

        <div className="lang" onClick={() => handleLanguageClick('ta')}>
          <div
            className="sound"
            onClick={(e) => handleSpeak(e, 'தமிழ்', 'ta-IN')}
          ></div>
          தமிழ்
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;

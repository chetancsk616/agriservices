import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import './style.css';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { setLanguage } = useContext(LanguageContext);

  // Simplified handler
  const handleLanguageClick = (lang) => {
    setLanguage(lang);
    navigate('/main/0');
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
          <div className="sound"></div> {/* Style is now in CSS */}
          English
        </div>

        <div className="lang" onClick={() => handleLanguageClick('te')}>
          <div className="sound"></div>
          తెలుగు
        </div>

        <div className="lang" onClick={() => handleLanguageClick('hi')}>
          <div className="sound"></div>
          हिन्दी
        </div>

        <div className="lang" onClick={() => handleLanguageClick('ta')}>
          <div className="sound"></div>
          தமிழ்
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;

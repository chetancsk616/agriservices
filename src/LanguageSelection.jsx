import React from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const LanguageSelection = () => {
  const navigate = useNavigate();

  const handleLanguageClick = (lang) => {
    switch (lang) {
      case 'en':
        navigate('/main/0');
        break;
      case 'te':
        navigate('/main/0');
        break;
      case 'hi':
        navigate('/main/0');
        break;
      case 'ta':
        navigate('/main/0');
        break;
      default:
        break;
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
        <div className="lang" data-value="en" onClick={() => handleLanguageClick('en')}>
          <div
            className="sound"
            style={{
              background: "url('/images/beeping.jpg') no-repeat",
              backgroundSize: 'cover',
            }}
          ></div>
          English
        </div>

        <div className="lang" data-value="te" onClick={() => handleLanguageClick('te')}>
          <div
            className="sound"
            style={{
              background: "url('/images/beeping.jpg') no-repeat",
              backgroundSize: 'cover',
            }}
          ></div>
          తెలుగు
        </div>

        <div className="lang" data-value="hi" onClick={() => handleLanguageClick('hi')}>
          <div
            className="sound"
            style={{
              background: "url('/images/beeping.jpg') no-repeat"
,
              backgroundSize: 'cover',
            }}
          ></div>
          हिन्दी
        </div>

        <div className="lang" data-value="ta" onClick={() => handleLanguageClick('ta')}>
          <div
            className="sound"
            style={{
              background: "url('/images/beeping.jpg') no-repeat",
              backgroundSize: 'cover',
            }}
          ></div>
          தமிழ்
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;

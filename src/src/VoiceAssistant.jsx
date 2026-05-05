// src/VoiceAssistant.jsx
import { useState, useEffect } from 'react';

const VoiceAssistant = ({ onVoiceInput, dark, isListening, setIsListening }) => {
  const t = dark ? {
    bg: '#0a0a0a',
    card: '#1a1a1a',
    text: '#ffffff',
    muted: '#aaaaaa',
    border: '#333333'
  } : {
    bg: '#ffffff',
    card: '#f8f8f8',
    text: '#000000',
    muted: '#666666',
    border: '#dddddd'
  };

  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [selectedVoice, setSelectedVoice] = useState('female');

  const languages = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'bn-IN', name: 'বাংলা (Bengali)' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)' },
    { code: 'mr-IN', name: 'मराठी (Marathi)' },
    { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
  ];

  // Speech Recognition
  const startListening = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser. Try Chrome/Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = selectedLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onVoiceInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
      alert("Couldn't hear clearly. Please try again.");
    };

    recognition.onend = () => setIsListening(false);

    setIsListening(true);
    recognition.start();
  };

  // Text to Speech with Male/Female selection
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = 0.95;
    utterance.pitch = selectedVoice === 'female' ? 1.1 : 0.9;
    utterance.volume = 1;

    // Try to select voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      (selectedVoice === 'female' && voice.name.toLowerCase().includes('female')) ||
      (selectedVoice === 'male' && voice.name.toLowerCase().includes('male')) ||
      voice.lang === selectedLang
    );

    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: '16px',
      padding: '14px 18px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '280px'
    }}>
      <div style={{ fontWeight: 700, color: t.text, display: 'flex', alignItems: 'center', gap: 8 }}>
        🎤 Voice Assistant
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <select 
          value={selectedLang} 
          onChange={(e) => setSelectedLang(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, background: t.bg, color: t.text, border: `1px solid ${t.border}` }}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <select 
          value={selectedVoice} 
          onChange={(e) => setSelectedVoice(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, background: t.bg, color: t.text, border: `1px solid ${t.border}` }}
        >
          <option value="female">👩 Female</option>
          <option value="male">👨 Male</option>
        </select>
      </div>

      <button
        onClick={startListening}
        disabled={isListening}
        style={{
          padding: '12px',
          background: isListening ? '#ef4444' : '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: isListening ? 'not-allowed' : 'pointer'
        }}
      >
        {isListening ? '🎙️ Listening...' : '🎤 Speak Now'}
      </button>

      <small style={{ color: t.muted, textAlign: 'center', fontSize: '12px' }}>
        Works best in Chrome / Edge
      </small>
    </div>
  );
};

export default VoiceAssistant;

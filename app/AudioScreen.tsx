import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceToTextScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }
      setTranscript((prev: string) => prev + finalTranscript);
    };

    interface SpeechRecognitionErrorEvent extends Event {
      error: string;
      message: string;
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(prev => !prev);
  };

  return (
    <div style={styles.container as React.CSSProperties}>
      <h1>📄 Voice Notes for Document Scanner</h1>
      <button onClick={toggleListening} style={styles.button}>
        {isListening ? '🛑 Stop Listening' : '🎙️ Start Listening'}
      </button>
      <div style={styles.textBox}>
        <p>{transcript || 'Your voice transcription will appear here...'}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'sans-serif',
    textAlign: 'center' as const,
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    margin: '1rem',
    cursor: 'pointer',
  },
  textBox: {
    border: '1px solid #ccc',
    padding: '1rem',
    minHeight: '150px',
    marginTop: '1rem',
    backgroundColor: '#f0f0f0',
    textAlign: 'left' as const,
  },
};

export default VoiceToTextScreen;
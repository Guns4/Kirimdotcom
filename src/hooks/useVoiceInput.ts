import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceInputResult {
  isListening: boolean;
  transcript: string;
  interimResult: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

interface SmartResult {
  courier: string | null;
  resi: string | null;
  original: string;
}

// Known couriers for fuzzy matching
const COURIERS = [
  { code: 'jne', keywords: ['jne', 'j n e', 'jay n e', 'reguler'] },
  { code: 'jnt', keywords: ['jnt', 'j&t', 'j and t', 'j dan t', 'jet'] },
  { code: 'sicepat', keywords: ['sicepat', 'si cepat', 'si ce pat'] },
  { code: 'anteraja', keywords: ['anteraja', 'anter aja', 'antar aja'] },
  { code: 'shopee', keywords: ['shopee', 'spx', 'shopee express'] },
  { code: 'lazada', keywords: ['lazada', 'lex'] },
  { code: 'ninja', keywords: ['ninja', 'ninja xpress'] },
  { code: 'pos', keywords: ['pos', 'pos indonesia', 'kantor pos'] },
  { code: 'tiki', keywords: ['tiki', 'ti ki'] },
  { code: 'wahana', keywords: ['wahana'] },
];

export function useVoiceInput(
  onSmartMatch?: (result: SmartResult) => void
): VoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimResult, setInterimResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Refs to keep track of recognition instance
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after one sentence
        recognition.interimResults = true;
        recognition.lang = 'id-ID'; // Bahasa Indonesia

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimResult('');
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setError(
            event.error === 'not-allowed'
              ? 'Izin mikrofon ditolak'
              : 'Gagal mengenali suara'
          );
          setIsListening(false);
        };

        recognition.onresult = (event: any) => {
          let finalTrans = '';
          let interimTrans = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTrans += event.results[i][0].transcript;
            } else {
              interimTrans += event.results[i][0].transcript;
            }
          }

          if (interimTrans) setInterimResult(interimTrans);

          if (finalTrans) {
            const cleaned = finalTrans.trim();
            setTranscript(cleaned);
            parseSmartInputs(cleaned);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onSmartMatch]);

  const parseSmartInputs = (text: string) => {
    if (!onSmartMatch) return;

    const lower = text.toLowerCase();
    let detectedCourier = null;
    let detectedResi = null;

    // 1. Detect Courier
    for (const c of COURIERS) {
      if (c.keywords.some((k) => lower.includes(k))) {
        detectedCourier = c.code;
        break;
      }
    }

    // 2. Detect Resi (Consecutive numbers or alphanumeric sequence)
    // Look for long sequences of numbers or mixed alphanumeric typically found in resi
    // e.g. "JP12345678" or "1234567890" using regex

    // Remove spaces inside potential resi numbers spoken as digits?
    // "satu dua tiga" -> "1 2 3" -> "123"
    // This is complex, but basic regex for now:
    const words = text.split(' ');
    // Try to find a "word" that looks like a resi (regex: alphanumeric, length > 5)
    // Or remove spaces and check?

    // Simple heuristic: Look for digit-heavy block
    const digitBlockRegex = /[A-Z0-9]{8,}/i;
    // Also handling spoken digits is tricky without a dedicated library,
    // relying on Web Speech API standard digit output for "123"

    const match =
      text.replace(/\s/g, '').match(/([A-Z]*\d+[A-Z]*){6,}/i) ||
      text.match(/[A-Z0-9]{8,}/i);

    if (match) {
      detectedResi = match[0];
    }

    if (detectedCourier || detectedResi) {
      onSmartMatch({
        courier: detectedCourier,
        resi: detectedResi,
        original: text,
      });
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Often standard error if already started
        console.warn(e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    transcript,
    interimResult,
    error,
    startListening,
    stopListening,
    isSupported,
  };
}

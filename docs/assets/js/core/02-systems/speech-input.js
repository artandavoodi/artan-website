/* =============================================================================
00) FILE INDEX
01) SPEECH RECOGNITION HELPERS
02) CONTROLLER FACTORY
03) END OF FILE
============================================================================= */

/* =============================================================================
01) SPEECH RECOGNITION HELPERS
============================================================================= */
function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function hasSpeechInputSupport() {
  return !!getSpeechRecognitionCtor();
}

/* =============================================================================
02) CONTROLLER FACTORY
============================================================================= */
export function createSpeechInputController({
  onStart = () => {},
  onResult = () => {},
  onEnd = () => {},
  onError = () => {},
  interimResults = true,
  continuous = false,
  maxAlternatives = 1,
} = {}) {
  const SpeechRecognitionCtor = getSpeechRecognitionCtor();
  if (!SpeechRecognitionCtor) {
    return {
      supported: false,
      isListening: () => false,
      start: () => false,
      stop: () => false,
    };
  }

  const recognition = new SpeechRecognitionCtor();
  let listening = false;

  recognition.continuous = continuous;
  recognition.interimResults = interimResults;
  recognition.maxAlternatives = maxAlternatives;

  recognition.addEventListener('start', () => {
    listening = true;
    onStart();
  });

  recognition.addEventListener('result', (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || '')
      .join('')
      .trim();

    onResult({
      transcript,
      event,
      isFinal: Array.from(event.results).every((result) => result.isFinal),
    });
  });

  recognition.addEventListener('end', () => {
    listening = false;
    onEnd();
  });

  recognition.addEventListener('error', (event) => {
    listening = false;
    onError(event);
  });

  return {
    supported: true,
    isListening: () => listening,
    start({ lang = '' } = {}) {
      recognition.lang = lang || document.documentElement.lang || 'en';
      recognition.start();
      return true;
    },
    stop() {
      if (!listening) {
        return false;
      }

      recognition.stop();
      return true;
    },
  };
}

/* =============================================================================
03) END OF FILE
============================================================================= */

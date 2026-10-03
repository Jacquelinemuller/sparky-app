import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';

export default function TypewriterText({
  text = '',
  speed = 28,
  soundEnabled = true,
  onComplete,
  style = {},
  className = ''
}) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;

    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    const tick = () => {
      if (indexRef.current >= text.length) {
        if (onComplete) onComplete();
        return;
      }

      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      const char = text[indexRef.current - 1];
      if (soundEnabled && char && char !== ' ' && char !== '\n') {
        try { audioService.playTypeTick(); } catch (e) {}
      }

      timerRef.current = setTimeout(tick, speed);
    };

    timerRef.current = setTimeout(tick, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, soundEnabled]);

  const isComplete = displayed.length >= (text?.length || 0);

  return (
    <span className={className} style={style}>
      {displayed}
      {!isComplete && (
        <span
          className="inline-block animate-pulse"
          style={{ opacity: 0.5, marginLeft: '1px' }}
        >
          |
        </span>
      )}
    </span>
  );
}
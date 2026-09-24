import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const SparkyBreatheGame = ({ onClose }) => {
  const [phase, setPhase] = useState('Inhala... (Toma aire)');
  const [scaleClass, setScaleClass] = useState('scale-105');
  const [activeTabGame, setActiveTabGame] = useState('breathe'); // 'breathe' | 'memory'

  // Breath cycle
  useEffect(() => {
    if (activeTabGame !== 'breathe') return;

    const timer1 = setTimeout(() => {
      setPhase('Mantén el aire...');
      setScaleClass('scale-110');
    }, 4000);

    const timer2 = setTimeout(() => {
      setPhase('Suelta despacio... (Exhala)');
      setScaleClass('scale-95');
    }, 7000);

    const timer3 = setTimeout(() => {
      setPhase('Inhala... (Toma aire)');
      setScaleClass('scale-105');
    }, 11000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [phase, activeTabGame]);

  // Memory Game State
  const emojis = ['🐶', '⭐', '🐾', '🍎', '🚀', '🐱'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(deck);
  }, []);

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.emoji === secondCard.emoji) {
        setMatched(prev => [...prev, firstId, secondId]);
        setScore(prev => prev + 1);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border-4 border-[#fed7aa] rounded-3xl w-full max-w-md p-6 flex flex-col items-center shadow-2xl relative animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#ffedd5] text-[#ea580c] flex items-center justify-center font-bold hover:bg-[#fed7aa] transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Tab switcher */}
        <div className="flex bg-[#fff7ed] border border-[#fed7aa] p-1 rounded-2xl mb-5">
          <button 
            onClick={() => setActiveTabGame('breathe')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTabGame === 'breathe' ? 'bg-[#ff6b00] text-white shadow' : 'text-on-surface-variant'}`}
          >
            🧘 Respiración con Sparky
          </button>
          <button 
            onClick={() => setActiveTabGame('memory')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTabGame === 'memory' ? 'bg-[#ff6b00] text-white shadow' : 'text-on-surface-variant'}`}
          >
            🧠 Minijuego Memoria
          </button>
        </div>

        {activeTabGame === 'breathe' ? (
          <div className="flex flex-col items-center py-4">
            <h2 className="font-headline-md font-black text-[#ea580c] mb-1">Pausa de Calma</h2>
            <p className="text-xs text-on-surface-variant text-center mb-6">Sigue el ritmo de Sparky para relajar tu mente.</p>

            <div className={`w-36 h-36 rounded-full ring-8 ring-[#ff6b00]/40 shadow-xl overflow-hidden bg-white transition-all duration-3000 ease-in-out ${scaleClass} flex items-center justify-center`}>
              <img 
                alt="Sparky respirando" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida/AEtjO1VXGMVeiJqiRzT_qCzpW9eIbpkeL-xTNQpVbriZU87evXEBgIA_JpZf8CeJrzN2v9vkps5A1mLtzKWBY8ze8uRmHTy3nsRp363ewzHHXCeGV24S0EFila5ZxBKKjRdB3ctZBZTDMUVxSqNRrgWz-ZdZF66dOGe2p4MbLK6jhVGcK8J25S8TvAy543XxSa66zXZDEOb61rouOy-ESQ0Gk_Krkfi3XDu8SUXcw9uAUensh3rINRS1XwEf6xA" 
              />
            </div>

            <div className="mt-8 px-6 py-3 rounded-2xl bg-[#fff7ed] border-2 border-[#fed7aa] shadow-inner text-center">
              <span className="font-headline-md font-black text-[#ea580c] animate-pulse">{phase}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <h2 className="font-headline-md font-black text-[#ea580c] mb-1">Memoria de Sparky</h2>
            <p className="text-xs text-on-surface-variant text-center mb-4">Encuentra las parejas de cartas (Aciertos: {score}/6)</p>

            <div className="grid grid-cols-4 gap-2.5 w-full max-w-xs mb-4">
              {cards.map((card) => {
                const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`h-16 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all cursor-pointer shadow-sm ${
                      isFlipped 
                        ? 'bg-white border-[#ff6b00]' 
                        : 'bg-[#fff7ed] border-[#fed7aa] hover:bg-[#ffedd5]'
                    }`}
                  >
                    {isFlipped ? card.emoji : '🐾'}
                  </button>
                );
              })}
            </div>

            {score === 6 && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold text-center animate-bounce">
                🎉 ¡Excelente! Has completado el minijuego de memoria.
              </div>
            )}
          </div>
        )}

        <button 
          onClick={onClose}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#ff6b00] hover:bg-[#ea580c] text-white font-bold text-sm shadow cursor-pointer transition-all"
        >
          Volver al Temporizador
        </button>

      </div>
    </div>
  );
};

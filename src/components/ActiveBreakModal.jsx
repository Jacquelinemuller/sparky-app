import React from 'react';

const BREAKS = [
  { icon: '/tips/icons/caminata.png', text: '¡Pausa activa! Estirá los brazos hacia el techo por 10 segundos.' },
  { icon: '/tips/icons/pesas.png', text: '¡Pausa activa! Hacé 5 sentadillas suaves.' },
  { icon: '/tips/icons/rutina.png', text: '¡Pausa activa! Girá las muñecas en forma circular 5 veces para cada lado.' },
  { icon: '/tips/icons/estudio.png', text: '¡Pausa activa! Movete un poquito: camina por el cuarto y volvé.' }
];

export default function ActiveBreakModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Elegimos una pausa al azar cada vez que se abre
  const randomBreak = BREAKS[Math.floor(Math.random() * BREAKS.length)];

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div 
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center animate-[popIn_0.4s_ease-out]"
        style={{ 
          background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)', 
          border: '4px solid #ea580c',
          boxShadow: '0 10px 0 0 #c2410c, 0 0 60px rgba(234, 88, 12, 0.4)'
        }}
      >
        <div className="w-24 h-24 mb-4 bg-white rounded-full flex items-center justify-center border-4 border-[#fed7aa] shadow-sm animate-[iconFloat_3s_ease-in-out_infinite]">
          <img src={randomBreak.icon} alt="Pausa activa" className="w-16 h-16 object-contain" />
        </div>
        
        <h3 className="text-2xl font-black text-[#9a3412] mb-2">¡Tiempo de moverse!</h3>
        <p className="text-sm font-bold text-[#78350f] mb-6 leading-snug">
          {randomBreak.text}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-[0_4px_0_0_#9a3412] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' }}
        >
          ✅ ¡Ya lo hice!
        </button>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
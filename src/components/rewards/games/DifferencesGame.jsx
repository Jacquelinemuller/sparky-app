import React, { useState, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// PALETA — Basada en el ícono (dorado + madera)
// ============================================
const D = {
  goldTop: '#fde68a',
  goldMid: '#f59e0b',
  goldBot: '#b45309',
  goldDeep: '#78350f',
  goldBorder: '#451a03',
  goldHighlight: 'rgba(255,255,220,0.7)',

  woodPanel: '#5c3a1e',
  woodPanelDeep: '#2e1a0a',
  woodBorder: '#3d1f08',

  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  limeBright: '#4ade80',
  violet: '#a855f7',
  magenta: '#ff2d87',
  amber: '#facc15',

  text: '#ffffff',
  textMuted: '#e8d5b5'
};

// ============================================
// ESCENAS
// ============================================
// Coordenadas en porcentaje (0-100) respecto al ancho/alto de la imagen.
// radius también en % (radio del área clickeable).
//
// ⚠️ Falta la "Diferencia 5" de La Selva. Cuando la tengas, agregala
//    al array de differences de escena-3 y subí el total de 6 a 7.
//
const SCENES = [
  {
    id: 'escena-1',
    title: 'El parque',
    imageA: '/diferencias/escena-1-a.png',
    imageB: '/diferencias/escena-1-b.png',
    aspectRatio: 467 / 350,
    differences: [
      { id: 'd1', x: 53.5, y: 4.8,  radius: 5 },  // 🪁 Barrilete
      { id: 'd2', x: 59.8, y: 31.2, radius: 5 },  // 🍦 Sombrilla
      { id: 'd3', x: 55.2, y: 74.2, radius: 5 },  // 🧣 Pañuelo
      { id: 'd4', x: 76.6, y: 34.6, radius: 5 },  // 🐱 Gato
      { id: 'd5', x: 93.0, y: 47.8, radius: 5 }   // 🎈 Globos
    ]
  },
  {
    id: 'escena-2',
    title: 'El espacio',
    imageA: '/diferencias/escena-2-a.png',
    imageB: '/diferencias/escena-2-b.png',
    aspectRatio: 467 / 350,
    differences: [
      { id: 'd1', x: 29, y: 11, radius: 5 },
      { id: 'd2', x: 89, y: 11, radius: 5 },
      { id: 'd3', x: 74, y: 22, radius: 5 },
      { id: 'd4', x: 45, y: 58, radius: 5 },
      { id: 'd5', x: 58, y: 56, radius: 5 },
      { id: 'd6', x: 27, y: 73, radius: 5 },
      { id: 'd7', x: 87, y: 49, radius: 5 }
    ]
  },
  {
    id: 'escena-3',
    title: 'La selva',
    imageA: '/diferencias/escena-3-a.png',
    imageB: '/diferencias/escena-3-b.png',
    aspectRatio: 467 / 350,
    differences: [
      { id: 'd1', x: 59, y: 13, radius: 5 },
      { id: 'd2', x: 46, y: 38, radius: 5 },
      { id: 'd3', x: 61, y: 60, radius: 5 },
      { id: 'd4', x: 89, y: 63, radius: 5 },
      { id: 'd5', x: 62, y: 83, radius: 5 },
      { id: 'd6', x: 13, y: 71, radius: 5 },
      { id: 'd7', x: 90, y: 51, radius: 5 }
    ]
  }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DifferencesGame({ onExit }) {
  const [gameState, setGameState] = useState('playing');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [foundIds, setFoundIds] = useState([]);
  const [wrongTaps, setWrongTaps] = useState([]);
  const [showIntro, setShowIntro] = useState(true);

  const scene = SCENES[sceneIndex];

  const handleImageTap = useCallback(
    (e) => {
      if (gameState !== 'playing' || showIntro || !scene) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches?.[0] || e.changedTouches?.[0] || e;
      const clientX = touch.clientX;
      const clientY = touch.clientY;

      const xPercent = ((clientX - rect.left) / rect.width) * 100;
      const yPercent = ((clientY - rect.top) / rect.height) * 100;

      const hit = scene.differences.find((diff) => {
        if (foundIds.includes(diff.id)) return false;
        const dx = xPercent - diff.x;
        const dy = yPercent - diff.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= diff.radius;
      });

      if (hit) {
        try { audioService.playPop(); } catch (err) {}
        const newFound = [...foundIds, hit.id];
        setFoundIds(newFound);

        if (newFound.length >= scene.differences.length) {
          setTimeout(() => {
            try { audioService.playSuccess(); } catch (err) {}
            setGameState('won');
          }, 400);
        }
      } else {
        try { audioService.playClick(); } catch (err) {}
        const tapId = Date.now();
        setWrongTaps((prev) => [...prev, { id: tapId, x: xPercent, y: yPercent }]);
        setTimeout(() => {
          setWrongTaps((prev) => prev.filter((t) => t.id !== tapId));
        }, 600);
      }
    },
    [gameState, showIntro, scene, foundIds]
  );

  const handleNextScene = () => {
    try { audioService.playPop(); } catch (e) {}
    const nextIndex = sceneIndex + 1;
    if (nextIndex >= SCENES.length) {
      setGameState('results');
      return;
    }
    setSceneIndex(nextIndex);
    setFoundIds([]);
    setWrongTaps([]);
    setGameState('playing');
  };

  const handleRetryScene = () => {
    try { audioService.playClick(); } catch (e) {}
    setFoundIds([]);
    setWrongTaps([]);
    setGameState('playing');
  };

  const handleRestartAll = () => {
    try { audioService.playPop(); } catch (e) {}
    setSceneIndex(0);
    setFoundIds([]);
    setWrongTaps([]);
    setGameState('playing');
  };

  // ============================================
  // INTRO
  // ============================================
  if (showIntro) {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <img
          src="/games/diferencias.png"
          alt="Diferencias"
          className="w-28 h-28 object-contain mb-2"
          draggable={false}
        />
        <h2
          className="text-3xl font-black text-white"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
        >
          Diferencias
        </h2>
        <p className="text-sm font-bold text-center" style={{ color: D.goldHighlight }}>
          Mirá las dos imágenes.<br />
          Encontrá todas las cosas distintas.
        </p>

        <div
          className="w-full p-4 rounded-2xl flex flex-col gap-2"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${D.goldMid}80`
          }}
        >
          <span className="text-xs font-black" style={{ color: D.limeBright }}>
            👆 Tocá la diferencia en cualquiera de las 2 imágenes
          </span>
          <span className="text-xs font-black" style={{ color: D.limeBright }}>
            ✅ Si acertás, se marca con un círculo cyan
          </span>
          <span className="text-xs font-black" style={{ color: D.limeBright }}>
            🔍 Encontrá todas para pasar a la siguiente
          </span>
        </div>

        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: D.textMuted,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={() => {
              try { audioService.playPop(); } catch (e) {}
              setShowIntro(false);
            }}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${D.goldMid} 0%, ${D.goldTop} 100%)`,
              color: D.goldBorder,
              border: `2px solid ${D.goldDeep}`,
              boxShadow: `0 4px 0 ${D.goldDeep}, 0 0 16px ${D.goldMid}80`
            }}
          >
            ¡Empezar!
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RESULTADOS FINALES
  // ============================================
  if (gameState === 'results') {
    const totalDiffs = SCENES.reduce((sum, s) => sum + s.differences.length, 0);
    return (
      <div className="w-full flex flex-col gap-4 items-center py-8 px-4">
        <div className="text-6xl mb-2">🏆</div>
        <h2
          className="text-2xl font-black text-white"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          ¡Completaste todas!
        </h2>
        <p className="text-sm font-bold text-center mb-4" style={{ color: D.goldHighlight }}>
          Encontraste las {totalDiffs} diferencias<br />
          de las {SCENES.length} imágenes.
        </p>

        <div className="flex gap-2 w-full max-w-xs">
          <button
            type="button"
            onClick={handleRestartAll}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${D.goldMid} 0%, ${D.goldTop} 100%)`,
              color: D.goldBorder,
              boxShadow: `0 4px 0 ${D.goldDeep}`
            }}
          >
            Jugar otra vez
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: D.textMuted,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            Salir
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // JUEGO ACTIVO
  // ============================================
  if (!scene) {
    return (
      <div className="w-full flex flex-col gap-3 items-center py-8">
        <p className="text-white font-bold">Cargando escena...</p>
      </div>
    );
  }

  const totalDiffs = scene.differences.length;
  const foundCount = foundIds.length;

  return (
    <div className="w-full flex flex-col gap-3 select-none">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(180, 83, 9, 0.15)',
            color: D.goldTop,
            border: `1px solid ${D.goldMid}80`
          }}
        >
          ← Salir
        </button>

        <span
          className="px-3 py-1.5 rounded-full text-[11px] font-black"
          style={{
            background: `linear-gradient(135deg, ${D.goldMid}40 0%, ${D.goldTop}40 100%)`,
            color: D.goldTop,
            border: `1px solid ${D.goldMid}80`
          }}
        >
          Imagen {sceneIndex + 1}/{SCENES.length}
        </span>
      </div>

      {/* Título y contador */}
      <div className="flex items-center justify-between px-2">
        <span
          className="text-sm font-black"
          style={{ color: D.goldHighlight, fontFamily: 'Georgia, serif' }}
        >
          {scene.title}
        </span>
        <div className="flex items-center gap-1">
          {scene.differences.map((d) => (
            <span
              key={d.id}
              className="rounded-full transition-all"
              style={{
                width: foundIds.includes(d.id) ? '18px' : '10px',
                height: '10px',
                background: foundIds.includes(d.id) ? D.cyan : 'rgba(255,255,255,0.2)',
                boxShadow: foundIds.includes(d.id) ? `0 0 8px ${D.cyanBright}` : 'none'
              }}
            />
          ))}
          <span
            className="ml-2 text-xs font-black"
            style={{ color: D.cyanBright }}
          >
            {foundCount}/{totalDiffs}
          </span>
        </div>
      </div>

      {/* Marco dorado exterior + paneles de madera */}
      <div
        className="w-full rounded-3xl p-2.5 flex flex-col gap-2"
        style={{
          background: `linear-gradient(180deg, ${D.goldTop} 0%, ${D.goldMid} 50%, ${D.goldBot} 100%)`,
          border: `3px solid ${D.goldBorder}`,
          boxShadow: `
            0 8px 0 ${D.goldDeep},
            inset 0 3px 0 ${D.goldHighlight},
            inset 0 -4px 0 rgba(0,0,0,0.35),
            0 12px 32px rgba(0,0,0,0.6)
          `
        }}
      >
        <ImagePanel
          src={scene.imageA}
          differences={scene.differences}
          foundIds={foundIds}
          wrongTaps={wrongTaps}
          onTap={handleImageTap}
          disabled={gameState !== 'playing'}
          label="A"
        />

        <div className="flex items-center justify-center py-0.5">
          <div
            className="w-16 h-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${D.goldDeep} 50%, transparent 100%)`
            }}
          />
        </div>

        <ImagePanel
          src={scene.imageB}
          differences={scene.differences}
          foundIds={foundIds}
          wrongTaps={wrongTaps}
          onTap={handleImageTap}
          disabled={gameState !== 'playing'}
          label="B"
        />
      </div>

      {/* Modal de escena ganada */}
      {gameState === 'won' && (
        <SceneWonModal
          isLast={sceneIndex + 1 >= SCENES.length}
          sceneTitle={scene.title}
          sceneNumber={sceneIndex + 1}
          totalScenes={SCENES.length}
          onNext={handleNextScene}
          onRetry={handleRetryScene}
        />
      )}

      <style>{`
        @keyframes diffPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes wrongRipple {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// PANEL DE IMAGEN
// ============================================
function ImagePanel({ src, differences, foundIds, wrongTaps, onTap, disabled, label }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        border: `2px solid ${D.woodBorder}`,
        boxShadow: `inset 0 4px 12px rgba(0,0,0,0.3)`
      }}
    >
      <div
        onClick={onTap}
        onTouchStart={onTap}
        className="relative w-full"
        style={{
          cursor: disabled ? 'default' : 'crosshair',
          touchAction: 'manipulation',
          lineHeight: 0
        }}
      >
        <img
          src={src}
          alt={`Imagen ${label}`}
          className="w-full h-auto block select-none"
          draggable={false}
        />

        {/* Círculos de diferencias encontradas */}
        {differences.map((diff) => {
          if (!foundIds.includes(diff.id)) return null;
          return (
            <span
              key={`found-${diff.id}`}
              style={{
                position: 'absolute',
                left: `${diff.x}%`,
                top: `${diff.y}%`,
                width: `${diff.radius * 2}%`,
                height: `${diff.radius * 2}%`,
                transform: 'translate(-50%, -50%)',
                border: `3px solid ${D.cyanBright}`,
                borderRadius: '50%',
                boxShadow: `
                  0 0 12px ${D.cyanBright},
                  0 0 24px ${D.cyan},
                  inset 0 0 12px ${D.cyan}80
                `,
                pointerEvents: 'none',
                animation: 'diffPop 0.4s ease-out'
              }}
            />
          );
        })}

        {/* Onda de taps incorrectos */}
        {wrongTaps.map((tap) => (
          <span
            key={tap.id}
            style={{
              position: 'absolute',
              left: `${tap.x}%`,
              top: `${tap.y}%`,
              width: '40px',
              height: '40px',
              transform: 'translate(-50%, -50%)',
              border: `3px solid ${D.magenta}`,
              borderRadius: '50%',
              pointerEvents: 'none',
              animation: 'wrongRipple 0.6s ease-out forwards'
            }}
          />
        ))}
      </div>

      {/* Etiqueta A/B */}
      <span
        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black"
        style={{
          background: `linear-gradient(135deg, ${D.goldMid} 0%, ${D.goldTop} 100%)`,
          color: D.goldBorder,
          border: `1.5px solid ${D.goldDeep}`,
          boxShadow: `0 2px 0 ${D.goldDeep}`
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ============================================
// MODAL ESCENA GANADA
// ============================================
function SceneWonModal({ isLast, sceneTitle, sceneNumber, totalScenes, onNext, onRetry }) {
  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
        style={{
          background: `linear-gradient(180deg, ${D.woodPanel} 0%, ${D.woodPanelDeep} 100%)`,
          border: `3px solid ${D.goldMid}`,
          boxShadow: `0 0 40px ${D.goldMid}80, inset 0 3px 0 ${D.goldHighlight}`
        }}
      >
        <span className="text-6xl mb-3">🔍</span>
        <h2
          className="text-2xl font-black text-white mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {isLast ? '¡Terminaste todas!' : '¡Encontraste todas!'}
        </h2>
        <p className="text-sm font-bold mb-4" style={{ color: D.textMuted }}>
          {isLast
            ? `Completaste las ${totalScenes} imágenes. ¡Sos un experto!`
            : `${sceneTitle} · Imagen ${sceneNumber} de ${totalScenes}`}
        </p>

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: D.textMuted,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            Otra vez
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${D.goldMid} 0%, ${D.goldTop} 100%)`,
              color: D.goldBorder,
              boxShadow: `0 4px 0 ${D.goldDeep}, 0 0 16px ${D.goldMid}80`
            }}
          >
            {isLast ? 'Ver resultados →' : 'Siguiente imagen →'}
          </button>
        </div>
      </div>
    </div>
  );
}
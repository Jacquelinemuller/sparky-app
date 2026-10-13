import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import VoiceInput from '../components/VoiceInput';
import TypewriterText from '../components/diario/TypewriterText';
import { getWeekTitle } from '../data/diaryIndex';
import { useDiaryPagination } from '../hooks/useDiaryPagination';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

const LINE_HEIGHT = 24;
const NUM_LINES = 16;
const LINE_COLOR = 'rgba(120, 90, 50, 0.55)';
const PADDING_LEFT = 36;
const PADDING_RIGHT = 30;
const PADDING_TOP = 46;
const PADDING_BOTTOM = 30;

const HAND_FONT = '"Patrick Hand", cursive';
const SCRIPT_FONT = '"WimpyKid", "Segoe Script", cursive';
const TITLE_FONT = '"WimpyKid", "Patrick Hand", cursive';

const SOUND_KEY = 'sparky_diary_sound';

function formatFriendlyDate(dateKey) {
  if (!dateKey) return null;
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    month: MONTH_NAMES[m - 1],
    day: DAY_NAMES[dt.getDay()],
    num: d
  };
}

export const DiarioScreen = () => {
  const { diaryEntries, updateDiaryNote, setActiveScreen, userName } = useApp();
  const [view, setView] = useState('tapa');
  const [pageIndex, setPageIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved === null ? true : saved === 'true';
  });

  // Paginación de la hoja
  const sheetRef = useRef(null);
  const [sheetDims, setSheetDims] = useState({ width: 0, height: 0 });
  const [subPage, setSubPage] = useState(0);
  const [revealedPerPage, setRevealedPerPage] = useState({});

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    const wakeUp = () => {
      try { audioService.init(); } catch (e) {}
      window.removeEventListener('click', wakeUp);
      window.removeEventListener('touchstart', wakeUp);
    };
    window.addEventListener('click', wakeUp);
    window.addEventListener('touchstart', wakeUp);
    return () => {
      window.removeEventListener('click', wakeUp);
      window.removeEventListener('touchstart', wakeUp);
    };
  }, []);

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('apoyos');
  };

  const sortedEntries = useMemo(() => {
    return [...(diaryEntries || [])].sort((a, b) =>
      (a.dateKey || '').localeCompare(b.dateKey || '')
    );
  }, [diaryEntries]);

  const entriesByWeek = useMemo(() => {
    const groups = {};
    sortedEntries.forEach((entry) => {
      const wk = entry.weekId || 1;
      if (!groups[wk]) groups[wk] = [];
      groups[wk].push(entry);
    });
    return groups;
  }, [sortedEntries]);

  const weeks = useMemo(() => {
    return Object.keys(entriesByWeek)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b);
  }, [entriesByWeek]);

  const totalPages = sortedEntries.length;
  const currentEntry = sortedEntries[pageIndex];

  // Medir la hoja cuando estamos en lectura
  useEffect(() => {
    if (view !== 'lectura') return;
    if (!sheetRef.current) return;

    const measure = () => {
      const el = sheetRef.current;
      if (!el) return;
      setSheetDims({
        width: Math.max(0, el.clientWidth - PADDING_LEFT - PADDING_RIGHT),
        height: Math.max(0, el.clientHeight - PADDING_TOP - PADDING_BOTTOM)
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sheetRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [view, pageIndex]);

  // Mensajes del tip de la entrada actual
  const tipMessages = useMemo(() => {
    if (currentEntry?.tipMessages && currentEntry.tipMessages.length > 0) {
      return currentEntry.tipMessages;
    }
    if (currentEntry?.tipExplanation) {
      return [currentEntry.tipExplanation];
    }
    return [];
  }, [currentEntry]);

  // Texto del header (fecha) para calcular su altura
  const friendly = currentEntry ? formatFriendlyDate(currentEntry.dateKey) : null;
  const headerText = friendly ? `${friendly.day} ${friendly.num}:` : '';

  // Calcular sub-páginas — AHORA con miTipHeight reducido
  const { pages: subPages } = useDiaryPagination({
    tipMessages,
    headerText,
    contentWidth: sheetDims.width,
    availableHeight: sheetDims.height,
    lineHeight: LINE_HEIGHT,
    hasMiTip: true,
    miTipHeight: 2 * LINE_HEIGHT
  });

  const totalSubPages = subPages.length || 1;
  const currentSubPage =
    subPages[subPage] || { messages: [], isFirst: true, isLast: true };

  // Resetear sub-página cuando cambia la entrada
  useEffect(() => {
    setSubPage(0);
    setRevealedPerPage({});
  }, [currentEntry?.id]);

  const canPrevSub = subPage > 0;
  const canNextSub = subPage < totalSubPages - 1;
  const canPrev = canPrevSub || pageIndex > 0;
  const canNext = canNextSub || pageIndex < totalPages - 1;

  const goPrev = () => {
    if (canPrevSub) {
      try { audioService.playClick(); } catch (e) {}
      setSubPage((s) => s - 1);
      return;
    }
    if (pageIndex > 0) {
      try { audioService.playClick(); } catch (e) {}
      setPageIndex((i) => i - 1);
      setSubPage(0);
      setRevealedPerPage({});
    }
  };

  const goNext = () => {
    if (canNextSub) {
      try { audioService.playClick(); } catch (e) {}
      setSubPage((s) => s + 1);
      return;
    }
    if (pageIndex < totalPages - 1) {
      try { audioService.playClick(); } catch (e) {}
      setPageIndex((i) => i + 1);
      setSubPage(0);
      setRevealedPerPage({});
    }
  };

  const openLastEntry = () => {
    if (totalPages === 0) return;
    try { audioService.playSuccess(); } catch (e) {}
    setPageIndex(totalPages - 1);
    setSubPage(0);
    setRevealedPerPage({});
    setView('lectura');
  };

  const openWeek = (weekId) => {
    const entries = entriesByWeek[weekId] || [];
    if (entries.length === 0) return;
    const globalIndex = sortedEntries.findIndex((e) => e.id === entries[0].id);
    if (globalIndex === -1) return;
    try { audioService.playPop(); } catch (e) {}
    setPageIndex(globalIndex);
    setSubPage(0);
    setRevealedPerPage({});
    setView('lectura');
  };

  const handleNoteChange = (value) => {
    if (!currentEntry) return;
    updateDiaryNote(currentEntry.id, value);
  };

  const toggleSound = () => {
    try { audioService.playClick(); } catch (e) {}
    setSoundEnabled((v) => !v);
  };

  // ============ TAPA ============
  if (view === 'tapa') {
    return (
      <div
        className="min-h-screen flex flex-col items-center px-4 pt-20 pb-6 relative"
        style={{ background: 'linear-gradient(180deg, #f5f0e6 0%, #e8dfc8 100%)' }}
      >
        <button
          type="button"
          onClick={goBack}
          className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 h-10 px-3 rounded-full font-bold text-sm active:scale-95 transition-all cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1.5px solid rgba(120, 90, 50, 0.3)',
            color: '#6b4a1f',
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)'
          }}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Volver</span>
        </button>

        <div className="w-full max-w-sm relative">
          <img
            src="/diario/tapa.png"
            alt="Diario de tips"
            className="w-full h-auto object-contain drop-shadow-2xl"
            draggable={false}
          />

          <div
            className="absolute"
            style={{
              top: '51%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '62%',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                fontFamily: SCRIPT_FONT,
                color: '#1f1305',
                fontSize: '11.29pt',
                lineHeight: 1.3,
                fontWeight: 400
              }}
            >
              las misiones secretas
            </div>
            <div
              style={{
                fontFamily: SCRIPT_FONT,
                color: '#1f1305',
                fontSize: '11.29pt',
                lineHeight: 1.3,
                fontWeight: 400
              }}
            >
              de {userName || 'amiguito'}
            </div>
          </div>

          <div
            className="absolute w-full flex justify-between gap-4"
            style={{
              bottom: '2.5%',
              left: 0,
              padding: '0 10%'
            }}
          >
            <button
              type="button"
              onClick={() => {
                try { audioService.playPop(); } catch (e) {}
                setView('indice');
              }}
              disabled={totalPages === 0}
              className="active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: HAND_FONT,
                fontSize: '20px',
                fontWeight: 400,
                color: '#1f1305',
                background: 'transparent',
                border: 'none',
                padding: 0,
                lineHeight: 1
              }}
            >
              Índice
            </button>

            <button
              type="button"
              onClick={openLastEntry}
              disabled={totalPages === 0}
              className="active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: HAND_FONT,
                fontSize: '20px',
                fontWeight: 400,
                color: '#1f1305',
                background: 'transparent',
                border: 'none',
                padding: 0,
                lineHeight: 1
              }}
            >
              Leer
            </button>
          </div>
        </div>

        {totalPages === 0 && (
          <p
            className="text-center mt-4"
            style={{ color: '#8b6f47', fontSize: '11px', fontWeight: 700 }}
          >
            Todavía está en blanco. Completá tu primer tip del día ✨
          </p>
        )}
      </div>
    );
  }

  // ============ ÍNDICE ============
  if (view === 'indice') {
    return (
      <div
        className="min-h-screen flex flex-col antialiased"
        style={{ background: 'linear-gradient(180deg, #f5f0e6 0%, #e8dfc8 100%)' }}
      >
        <header
          className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
          style={{
            background: 'rgba(245, 240, 230, 0.9)',
            borderBottom: '1.5px solid rgba(120, 90, 50, 0.2)'
          }}
        >
          <div className="h-14 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                try { audioService.playClick(); } catch (e) {}
                setView('tapa');
              }}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full font-bold text-sm active:scale-95 transition-all cursor-pointer"
              style={{
                background: '#ffffff',
                border: '1.5px solid rgba(120, 90, 50, 0.25)',
                color: '#6b4a1f'
              }}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Volver</span>
            </button>

            <span
              className="font-black"
              style={{ color: '#6b4a1f', fontSize: '16px', fontFamily: TITLE_FONT }}
            >
              Índice
            </span>

            <span className="w-10" />
          </div>
        </header>

        <main className="flex-1 flex flex-col relative w-full pt-20 pb-12 px-4 max-w-md mx-auto">
          {weeks.length === 0 ? (
            <div className="w-full relative">
              <img
                src="/diario/hoja.png"
                alt=""
                className="w-full h-auto rounded-3xl shadow-[0_8px_24px_rgba(120,90,50,0.15)]"
                draggable={false}
              />
              <div
                className="absolute inset-0 flex flex-col"
                style={{
                  paddingTop: `${PADDING_TOP}px`,
                  paddingLeft: `${PADDING_LEFT}px`,
                  paddingRight: `${PADDING_RIGHT}px`,
                  paddingBottom: `${PADDING_BOTTOM}px`
                }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    height: '100%',
                    background: `repeating-linear-gradient(
                      to bottom,
                      transparent 0px,
                      transparent ${LINE_HEIGHT - 1}px,
                      ${LINE_COLOR} ${LINE_HEIGHT - 1}px,
                      ${LINE_COLOR} ${LINE_HEIGHT}px
                    )`,
                    fontFamily: HAND_FONT,
                    fontSize: '16px',
                    lineHeight: `${LINE_HEIGHT}px`,
                    color: '#3b2a12',
                    fontWeight: 400
                  }}
                >
                  <div
                    style={{
                      fontFamily: TITLE_FONT,
                      fontSize: '26px',
                      lineHeight: `${LINE_HEIGHT}px`
                    }}
                  >
                    <span
                      style={{
                        borderBottom: '2px solid #6b4a1f',
                        paddingBottom: '1px',
                        display: 'inline-block'
                      }}
                    >
                      Índice
                    </span>
                  </div>

                  <div style={{ height: `${LINE_HEIGHT}px` }} aria-hidden="true" />

                  <div style={{ fontSize: '16px', lineHeight: `${LINE_HEIGHT}px`, opacity: 0.75 }}>
                    Todavía no hay páginas. 📖
                  </div>
                  <div style={{ fontSize: '16px', lineHeight: `${LINE_HEIGHT}px`, opacity: 0.75 }}>
                    Completá un tip del día y Sparky escribe la primera.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full relative">
              <img
                src="/diario/hoja.png"
                alt=""
                className="w-full h-auto rounded-3xl shadow-[0_8px_24px_rgba(120,90,50,0.15)]"
                draggable={false}
              />
              <div
                className="absolute inset-0 flex flex-col"
                style={{
                  paddingTop: `${PADDING_TOP}px`,
                  paddingLeft: `${PADDING_LEFT}px`,
                  paddingRight: `${PADDING_RIGHT}px`,
                  paddingBottom: `${PADDING_BOTTOM}px`
                }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    height: '100%',
                    background: `repeating-linear-gradient(
                      to bottom,
                      transparent 0px,
                      transparent ${LINE_HEIGHT - 1}px,
                      ${LINE_COLOR} ${LINE_HEIGHT - 1}px,
                      ${LINE_COLOR} ${LINE_HEIGHT}px
                    )`,
                    fontFamily: HAND_FONT,
                    fontSize: '16px',
                    lineHeight: `${LINE_HEIGHT}px`,
                    color: '#3b2a12',
                    fontWeight: 400
                  }}
                >
                  <div
                    style={{
                      fontFamily: TITLE_FONT,
                      fontSize: '26px',
                      lineHeight: `${LINE_HEIGHT}px`
                    }}
                  >
                    <span
                      style={{
                        borderBottom: '2px solid #6b4a1f',
                        paddingBottom: '1px',
                        display: 'inline-block'
                      }}
                    >
                      Índice
                    </span>
                  </div>

                  <div style={{ height: `${LINE_HEIGHT}px` }} aria-hidden="true" />

                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: `${LINE_HEIGHT}px`,
                      opacity: 0.7,
                      letterSpacing: '0.02em'
                    }}
                  >
                    Mis misiones secretas ✨
                  </div>

                  <div style={{ height: `${LINE_HEIGHT}px` }} aria-hidden="true" />

                  {weeks.map((wk) => {
                    const entries = entriesByWeek[wk];
                    const title = getWeekTitle(wk);
                    return (
                      <button
                        key={wk}
                        type="button"
                        onClick={() => openWeek(wk)}
                        className="active:opacity-60 transition-opacity cursor-pointer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          width: '100%',
                          height: `${LINE_HEIGHT}px`,
                          lineHeight: `${LINE_HEIGHT}px`,
                          padding: 0,
                          margin: 0,
                          background: 'transparent',
                          border: 'none',
                          fontFamily: HAND_FONT,
                          fontSize: '16px',
                          color: '#3b2a12',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ flexShrink: 0, lineHeight: `${LINE_HEIGHT}px` }}>
                          {wk}.
                        </span>
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            lineHeight: `${LINE_HEIGHT}px`,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {title}
                        </span>
                        <span
                          style={{
                            flexShrink: 0,
                            lineHeight: `${LINE_HEIGHT}px`,
                            opacity: 0.6,
                            fontSize: '13px'
                          }}
                        >
                          {entries.length} {entries.length === 1 ? 'pág' : 'págs'}
                        </span>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            flexShrink: 0,
                            fontSize: '18px',
                            color: '#6b4a1f',
                            lineHeight: `${LINE_HEIGHT}px`
                          }}
                        >
                          arrow_forward
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ============ LECTURA ============
  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{ background: 'linear-gradient(180deg, #f5f0e6 0%, #e8dfc8 100%)' }}
    >
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(245, 240, 230, 0.9)',
          borderBottom: '1.5px solid rgba(120, 90, 50, 0.2)'
        }}
      >
        <div className="h-14 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              try { audioService.playClick(); } catch (e) {}
              setView('tapa');
            }}
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full font-bold text-sm active:scale-95 transition-all cursor-pointer"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(120, 90, 50, 0.25)',
              color: '#6b4a1f'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Cerrar</span>
          </button>

          {totalPages > 0 && (
            <span
              className="px-3 py-1.5 rounded-full font-black"
              style={{
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1.5px solid rgba(180, 83, 9, 0.3)',
                color: '#78350f',
                fontSize: '13px',
                fontFamily: HAND_FONT
              }}
            >
              {pageIndex + 1} / {totalPages}
              {totalSubPages > 1 && ` · ${subPage + 1}/${totalSubPages}`}
            </span>
          )}

          <button
            type="button"
            onClick={toggleSound}
            className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
            style={{
              background: soundEnabled ? '#fef3c7' : '#ffffff',
              border: '1.5px solid rgba(120, 90, 50, 0.25)',
              color: '#6b4a1f'
            }}
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-8 px-4 max-w-md mx-auto">
        {totalPages === 0 ? (
          <div
            className="w-full p-8 rounded-3xl text-center my-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '2px dashed rgba(120, 90, 50, 0.3)'
            }}
          >
            <span className="text-5xl block mb-3">📖</span>
            <h2
              className="font-black mb-2"
              style={{ color: '#6b4a1f', fontSize: '20px', fontFamily: HAND_FONT }}
            >
              Todavía no hay páginas
            </h2>
            <p style={{ color: '#8b6f47', fontSize: '15px', fontWeight: 700, fontFamily: HAND_FONT }}>
              Completá un tip del día y Sparky escribe la primera página.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full relative">
              <img
                ref={sheetRef}
                src="/diario/hoja.png"
                alt=""
                className="w-full h-auto rounded-3xl shadow-[0_8px_24px_rgba(120,90,50,0.15)]"
                draggable={false}
                style={{ display: 'block' }}
              />

              <div
                className="absolute inset-0 flex flex-col"
                style={{
                  paddingTop: `${PADDING_TOP}px`,
                  paddingLeft: `${PADDING_LEFT}px`,
                  paddingRight: `${PADDING_RIGHT}px`,
                  paddingBottom: `${PADDING_BOTTOM}px`
                }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    height: '100%',
                    background: `repeating-linear-gradient(
                      to bottom,
                      transparent 0px,
                      transparent ${LINE_HEIGHT - 1}px,
                      ${LINE_COLOR} ${LINE_HEIGHT - 1}px,
                      ${LINE_COLOR} ${LINE_HEIGHT}px
                    )`,
                    fontFamily: HAND_FONT,
                    fontSize: '16px',
                    lineHeight: `${LINE_HEIGHT}px`,
                    color: '#3b2a12',
                    fontWeight: 400
                  }}
                >
                  {/* Fecha (solo primera sub-página) */}
                  {currentSubPage.isFirst && friendly && (
                    <div
                      style={{
                        fontFamily: TITLE_FONT,
                        fontSize: '26px',
                        lineHeight: `${LINE_HEIGHT}px`,
                        margin: 0,
                        padding: 0
                      }}
                    >
                      <span
                        style={{
                          borderBottom: '2px solid #6b4a1f',
                          paddingBottom: '1px',
                          display: 'inline-block'
                        }}
                      >
                        {friendly.day} {friendly.num}:
                      </span>
                    </div>
                  )}

                  {/* 1/2 renglón entre fecha y primer mensaje */}
                  {currentSubPage.isFirst &&
                    friendly &&
                    currentSubPage.messages.length > 0 && (
                      <div style={{ height: `${LINE_HEIGHT / 2}px` }} aria-hidden="true" />
                    )}

                  {/* Mensajes de esta sub-página */}
                  {currentSubPage.messages.map((msgIdx, localIdx) => {
                    const msg = tipMessages[msgIdx];
                    const revealed = revealedPerPage[subPage] || 0;
                    const isCompleted = localIdx < revealed;

                    if (localIdx > revealed) return null;

                    return (
                      <React.Fragment key={msgIdx}>
                        <div
                          style={{
                            fontSize: '16px',
                            lineHeight: `${LINE_HEIGHT}px`,
                            opacity: 0.9,
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <span style={{ flexShrink: 0, lineHeight: `${LINE_HEIGHT}px` }}>
                            •
                          </span>
                          <span style={{ flex: 1, lineHeight: `${LINE_HEIGHT}px` }}>
                            {isCompleted ? (
                              msg
                            ) : (
                              <TypewriterText
                                key={`msg-${currentEntry.id}-${subPage}-${msgIdx}`}
                                text={msg}
                                speed={22}
                                soundEnabled={soundEnabled}
                                onComplete={() => {
                                  setRevealedPerPage((prev) => ({
                                    ...prev,
                                    [subPage]: Math.max(prev[subPage] || 0, localIdx + 1)
                                  }));
                                }}
                              />
                            )}
                          </span>
                        </div>

                        {/* 1/2 renglón entre mensajes */}
                        {localIdx < currentSubPage.messages.length - 1 && (
                          <div style={{ height: `${LINE_HEIGHT / 2}px` }} aria-hidden="true" />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* MI TIP (solo en la última sub-página) */}
                  {currentSubPage.isLast && (
                    <>
                      {/* 1/2 renglón antes de MI TIP */}
                      {currentSubPage.messages.length > 0 && (
                        <div style={{ height: `${LINE_HEIGHT / 2}px` }} aria-hidden="true" />
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                          lineHeight: `${LINE_HEIGHT}px`,
                          margin: 0,
                          padding: 0
                        }}
                      >
                        <span
                          style={{ flexShrink: 0, lineHeight: `${LINE_HEIGHT}px` }}
                        >
                          •
                        </span>
                        <span
                          style={{
                            flexShrink: 0,
                            lineHeight: `${LINE_HEIGHT}px`,
                            letterSpacing: '0.05em',
                            opacity: 0.85
                          }}
                        >
                          ✏️ MI TIP:
                        </span>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            lineHeight: `${LINE_HEIGHT}px`
                          }}
                        >
                          <VoiceInput
                            value={currentEntry?.userNote || ''}
                            onChange={handleNoteChange}
                            placeholder="Escribí o dictá algo tuyo..."
                            maxLength={200}
                            color="#b45309"
                            bg="transparent"
                            borderColor="transparent"
                            micIconSrc="/mic.png"
                            micIconSize={56}
                            micOffsetY="-12px"
                            style={{
                              fontSize: '16px',
                              fontFamily: HAND_FONT,
                              padding: '0 0 0 2px',
                              margin: 0,
                              lineHeight: `${LINE_HEIGHT}px`,
                              background: 'transparent',
                              border: 'none',
                              minHeight: `${LINE_HEIGHT}px`,
                              display: 'block',
                              fontStyle: 'normal',
                              resize: 'none'
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-between gap-3 mt-5">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canPrev}
                className="flex-1 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  fontFamily: HAND_FONT,
                  fontWeight: 400,
                  fontSize: '18px',
                  background: '#ffffff',
                  border: '1.5px solid rgba(120, 90, 50, 0.25)',
                  color: '#6b4a1f',
                  boxShadow: '0 2px 0 0 rgba(120, 90, 50, 0.15)'
                }}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                <span>Anterior</span>
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!canNext}
                className="flex-1 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  fontFamily: HAND_FONT,
                  fontWeight: 400,
                  fontSize: '18px',
                  background: '#ffffff',
                  border: '1.5px solid rgba(120, 90, 50, 0.25)',
                  color: '#6b4a1f',
                  boxShadow: '0 2px 0 0 rgba(120, 90, 50, 0.15)'
                }}
              >
                <span>Siguiente</span>
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

                      </>
        )}
      </main>
    </div>
  );
};
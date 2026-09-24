import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import { compressImage } from '../utils/imageUtils';
import { PRESET_AVATARS, ACCESSORIES_CATALOG } from '../services/storageService';

export const ProfileScreen = () => {
  const {
    userName,
    userAge,
    userAvatar,
    setUserName,
    setUserAge,
    setUserAvatar,
    equippedAccessories,
    setActiveScreen,
    unlockedAccessories
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempAge, setTempAge] = useState(userAge);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');
  };

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    setUserName(tempName.trim());
    setIsEditingName(false);
    try { audioService.playSuccess(); } catch (e) {}
  };

  const handleSaveAge = () => {
    const num = parseInt(tempAge, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      setTempAge(userAge);
      setIsEditingAge(false);
      return;
    }
    setUserAge(num);
    setIsEditingAge(false);
    try { audioService.playSuccess(); } catch (e) {}
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setIsProcessingPhoto(true);

    try {
      const base64 = await compressImage(file);
      setUserAvatar(base64);
      try { audioService.playSuccess(); } catch (err) {}
    } catch (err) {
      setPhotoError(err.message || 'No se pudo procesar la imagen');
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (preset) => {
    setUserAvatar(preset.src);
    try { audioService.playPop(); } catch (e) {}
  };

  // ============================================
  // COMPONENTE DE AVATAR CON CAPAS
  // ============================================
  const AvatarWithAccessories = ({ size = 'lg' }) => {
    const sizeClasses = size === 'lg' ? 'w-32 h-32' : 'w-12 h-12';
    const equipped = equippedAccessories || {};

    // Buscamos los accesorios equipados en el catálogo
    const headAcc = ACCESSORIES_CATALOG.find((a) => a.id === equipped.head);
    const faceAcc = ACCESSORIES_CATALOG.find((a) => a.id === equipped.face);
    const shirtAcc = ACCESSORIES_CATALOG.find((a) => a.id === equipped.shirt);

    return (
      <div className={`relative ${sizeClasses} rounded-full flex-shrink-0`}>
        {/* Foto base */}
        <div className="absolute inset-0 rounded-full ring-4 ring-[#8b5cf6] shadow-[0_6px_16px_rgba(139,92,246,0.3)] overflow-hidden bg-white">
          <img
            src={userAvatar}
            alt={userName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML =
                '<div class="w-full h-full flex items-center justify-center text-4xl">👤</div>';
            }}
          />
        </div>

        {/* Tinte de color de remera (si aplica) */}
        {shirtAcc && shirtAcc.color && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-25 mix-blend-multiply"
            style={{ backgroundColor: shirtAcc.color }}
          />
        )}

        {/* Gorra/Sombrero (arriba) */}
        {headAcc && size === 'lg' && (
          <span
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl pointer-events-none"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          >
            {headAcc.icon}
          </span>
        )}

        {/* Gafas (al centro) */}
        {faceAcc && size === 'lg' && (
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl pointer-events-none mt-2"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          >
            {faceAcc.icon}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)'
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(139,92,246,0.08)]"
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderBottom: '2px solid rgba(196,181,253,0.5)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] text-[#8b5cf6] font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div className="inline-flex items-center gap-2 bg-[#ede9fe] px-3 py-1.5 rounded-full shadow-[0_2px_0_0_#ddd6fe]">
            <span
              className="material-symbols-outlined text-[16px] text-[#8b5cf6]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              person
            </span>
            <span className="font-label-sm text-label-sm font-black text-[#8b5cf6] uppercase tracking-wider">
              Mi perfil
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 px-4 max-w-md mx-auto">

        {/* Avatar con accesorios */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <AvatarWithAccessories size="lg" />

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface mt-4 leading-tight">
            {userName}
          </h1>
          <p className="font-body-md text-body-md text-[#6d28d9] font-bold">
            {userAge} {userAge === 1 ? 'año' : 'años'}
          </p>
        </div>

        {/* Botones de cambio de avatar */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        <div className="w-full grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingPhoto}
            className="py-3 rounded-2xl bg-[#8b5cf6] text-white font-label-md text-label-md font-black shadow-[0_3px_0_0_#5b21b6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            <span>{isProcessingPhoto ? 'Cargando...' : 'Cambiar foto'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              try { audioService.playClick(); } catch (e) {}
              alert('Próximamente: elegir entre avatares prediseñados 🎨');
            }}
            className="py-3 rounded-2xl bg-white border-2 border-[#ddd6fe] text-[#8b5cf6] font-label-md text-label-md font-black shadow-[0_3px_0_0_#ddd6fe] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">palette</span>
            <span>Avatares</span>
          </button>
        </div>

        {photoError && (
          <div className="w-full mb-4 p-2 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-start gap-1.5">
            <span className="text-sm">⚠️</span>
            <p className="font-label-sm text-[11px] text-[#991b1b] font-bold leading-tight">
              {photoError}
            </p>
          </div>
        )}

        {/* ============ DATOS DEL PERFIL ============ */}
        <div className="w-full bg-white rounded-2xl p-4 border-2 border-[#ddd6fe] shadow-[0_3px_0_0_#ddd6fe] mb-4">
          <h3 className="font-label-md text-label-md font-black text-[#6d28d9] uppercase tracking-wider mb-3">
            Mis datos
          </h3>

          {/* Nombre */}
          <div className="mb-3 pb-3 border-b border-[#ede9fe]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md font-bold text-on-surface-variant">
                📝 Nombre
              </span>
              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => {
                    try { audioService.playClick(); } catch (e) {}
                    setTempName(userName);
                    setIsEditingName(true);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f3ff] active:scale-95 transition-all cursor-pointer"
                  title="Editar nombre"
                >
                  <span className="material-symbols-outlined text-[#8b5cf6] text-[18px]">
                    edit
                  </span>
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  maxLength={20}
                  autoFocus
                  className="flex-1 p-2.5 rounded-xl border-2 border-[#ddd6fe] bg-white text-on-surface text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-2.5 rounded-xl bg-[#10b981] text-white font-bold text-sm shadow-[0_2px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  ✓
                </button>
              </div>
            ) : (
              <p className="font-title-md font-black text-on-surface">
                {userName}
              </p>
            )}
          </div>

          {/* Edad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md font-bold text-on-surface-variant">
                🎂 Edad
              </span>
              {!isEditingAge && (
                <button
                  type="button"
                  onClick={() => {
                    try { audioService.playClick(); } catch (e) {}
                    setTempAge(userAge);
                    setIsEditingAge(true);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f3ff] active:scale-95 transition-all cursor-pointer"
                  title="Editar edad"
                >
                  <span className="material-symbols-outlined text-[#8b5cf6] text-[18px]">
                    edit
                  </span>
                </button>
              )}
            </div>

            {isEditingAge ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempAge}
                  onChange={(e) => setTempAge(e.target.value)}
                  min="1"
                  max="100"
                  autoFocus
                  className="flex-1 p-2.5 rounded-xl border-2 border-[#ddd6fe] bg-white text-on-surface text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                />
                <span className="font-label-md text-label-md font-bold text-on-surface-variant">
                  años
                </span>
                <button
                  type="button"
                  onClick={handleSaveAge}
                  className="px-3 py-2.5 rounded-xl bg-[#10b981] text-white font-bold text-sm shadow-[0_2px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  ✓
                </button>
              </div>
            ) : (
              <p className="font-title-md font-black text-on-surface">
                {userAge} {userAge === 1 ? 'año' : 'años'}
              </p>
            )}
          </div>
        </div>

        {/* ============ ACCESORIOS ============ */}
        <div className="w-full bg-white rounded-2xl p-4 border-2 border-[#ddd6fe] shadow-[0_3px_0_0_#ddd6fe] mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-label-md text-label-md font-black text-[#6d28d9] uppercase tracking-wider">
              🎨 Mis accesorios
            </h3>
            <span className="font-label-sm text-[10px] font-black text-[#8b5cf6] bg-[#f5f3ff] border border-[#ddd6fe] px-2 py-0.5 rounded-full">
              {unlockedAccessories?.length || 0} / {ACCESSORIES_CATALOG.length}
            </span>
          </div>

          {unlockedAccessories?.length === 0 ? (
            <div className="text-center py-4">
              <span className="text-3xl block mb-2">🛒</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Todavía no tenés accesorios
              </p>
              <p className="font-label-sm text-[10px] text-on-surface-variant/70 mt-1">
                ¡Conseguí XP para comprar en la tienda!
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ACCESSORIES_CATALOG.filter((acc) =>
                unlockedAccessories.includes(acc.id)
              ).map((acc) => (
                <div
                  key={acc.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] min-w-[60px]"
                  title={acc.label}
                >
                  <span className="text-2xl">{acc.icon}</span>
                  <span className="font-label-sm text-[9px] font-bold text-[#5b21b6] text-center leading-tight">
                    {acc.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón "Ir a la tienda" */}
        <button
          type="button"
          onClick={() => {
            try { audioService.playPop(); } catch (e) {}
            alert('Próximamente: tienda de accesorios 🛒');
          }}
          className="w-full py-3 rounded-2xl bg-[#8b5cf6] text-white font-label-md text-label-md font-black shadow-[0_4px_0_0_#5b21b6] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          <span>Ir a la tienda de accesorios</span>
        </button>

      </main>
    </div>
  );
};
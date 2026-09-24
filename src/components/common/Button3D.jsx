import React from 'react';
import { audioService } from '../../services/audioService';

const VARIANTS = {
  primary: {
    base: 'bg-[#ff6b00] hover:bg-[#ea580c] text-white',
    shadow: 'shadow-[0_4px_0_0_#c2410c]',
    active: 'active:translate-y-1 active:shadow-[0_1px_0_0_#c2410c]'
  },
  secondary: {
    base: 'bg-[#5bb8fe] hover:bg-[#38a0e8] text-white',
    shadow: 'shadow-[0_4px_0_0_#0284c7]',
    active: 'active:translate-y-1 active:shadow-[0_1px_0_0_#0284c7]'
  },
  success: {
    base: 'bg-[#10b981] hover:bg-[#059669] text-white',
    shadow: 'shadow-[0_4px_0_0_#047857]',
    active: 'active:translate-y-1 active:shadow-[0_1px_0_0_#047857]'
  },
  amber: {
    base: 'bg-[#f59e0b] hover:bg-[#d97706] text-white',
    shadow: 'shadow-[0_4px_0_0_#92400e]',
    active: 'active:translate-y-1 active:shadow-[0_1px_0_0_#92400e]'
  },
  creative: {
    base: 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white',
    shadow: 'shadow-[0_4px_0_0_#5b21b6]',
    active: 'active:translate-y-1 active:shadow-[0_1px_0_0_#5b21b6]'
  },
  outline: {
    base: 'bg-white border-2 border-[#fed7aa] text-[#ea580c] hover:bg-[#fff7ed]',
    shadow: 'shadow-[0_3px_0_0_#fed7aa]',
    active: 'active:translate-y-0.5 active:shadow-[0_1px_0_0_#fed7aa]'
  }
};

const SIZES = {
  sm: 'h-10 px-3 text-xs',
  md: 'h-12 px-5 text-sm'
};

export default function Button3D({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  icon,
  fullWidth = false
}) {
  const handleClick = (e) => {
    if (disabled) return;
    try {
      audioService.playClick();
    } catch (err) {
      // si el audio no está listo, no rompemos
    }
    if (onClick) onClick(e);
  };

  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-label-md text-label-md font-extrabold transition-all cursor-pointer ${v.base} ${v.shadow} ${v.active} ${s} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
      {children}
    </button>
  );
}
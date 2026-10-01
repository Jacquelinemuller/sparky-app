import React, { useMemo, useRef, useEffect } from 'react';

const HOURS_LIST_ID = 'trv-hours-list';
const MINUTES_LIST_ID = 'trv-minutes-list';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function parseTimeRange(timeStr) {
  const fallback = { startH: '08', startM: '00', endH: '09', endM: '00' };
  if (!timeStr || typeof timeStr !== 'string') return fallback;

  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return fallback;

  return {
    startH: String(match[1]).padStart(2, '0'),
    startM: match[2],
    endH: String(match[3]).padStart(2, '0'),
    endM: match[4]
  };
}

function buildTimeRange(startH, startM, endH, endM) {
  return `${startH}:${startM} - ${endH}:${endM}`;
}

function sanitize(input, max) {
  const digits = input.replace(/\D/g, '').slice(0, 2);
  if (digits === '') return '';
  const num = parseInt(digits, 10);
  if (num > max) {
    return digits[0];
  }
  return digits;
}

const inputStyle = {
  width: '100%',
  padding: '8px 4px',
  borderRadius: '10px',
  border: '1.5px solid #d9f99d',
  background: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  color: '#1f2937',
  outline: 'none',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums'
};

export default function TimeRangeInput({ value, onChange, disabled = false }) {
  const parsed = useMemo(() => parseTimeRange(value), [value]);

  const startHRef = useRef(null);
  const startMRef = useRef(null);
  const endHRef = useRef(null);
  const endMRef = useRef(null);

  // Último valor que emitimos nosotros → para distinguir ecos del padre
  const lastEmittedRef = useRef(
    buildTimeRange(parsed.startH, parsed.startM, parsed.endH, parsed.endM)
  );

  // ✅ Sincronizar SOLO cuando el valor cambia desde afuera (no es eco)
  useEffect(() => {
    const formatted = buildTimeRange(parsed.startH, parsed.startM, parsed.endH, parsed.endM);
    if (lastEmittedRef.current !== formatted) {
      if (startHRef.current) startHRef.current.value = parsed.startH;
      if (startMRef.current) startMRef.current.value = parsed.startM;
      if (endHRef.current) endHRef.current.value = parsed.endH;
      if (endMRef.current) endMRef.current.value = parsed.endM;
      lastEmittedRef.current = formatted;
    }
  }, [parsed.startH, parsed.startM, parsed.endH, parsed.endM]);

  // Emite el valor al padre leyendo el DOM actual
  const emitChange = () => {
    const startH = (startHRef.current?.value || '00').padStart(2, '0');
    const startM = (startMRef.current?.value || '00').padStart(2, '0');
    const endH = (endHRef.current?.value || '00').padStart(2, '0');
    const endM = (endMRef.current?.value || '00').padStart(2, '0');
    const formatted = buildTimeRange(startH, startM, endH, endM);
    lastEmittedRef.current = formatted;
    onChange(formatted);
  };

  const handleFieldChange = (field, rawValue, max, nextRef) => {
    const cleaned = sanitize(rawValue, max);

    // Actualizar el input DOM directamente (no controlado)
    const fieldRefMap = {
      startH: startHRef,
      startM: startMRef,
      endH: endHRef,
      endM: endMRef
    };
    const fieldRef = fieldRefMap[field];
    if (fieldRef?.current) fieldRef.current.value = cleaned;

    emitChange();

    if (cleaned.length === 2 && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleBlur = (field) => {
    const fieldRefMap = {
      startH: startHRef,
      startM: startMRef,
      endH: endHRef,
      endM: endMRef
    };
    const fieldRef = fieldRefMap[field];
    if (!fieldRef?.current) return;

    const current = fieldRef.current.value;
    if (current === '' || current.length < 2) {
      const padded = (current || '0').padStart(2, '0');
      fieldRef.current.value = padded;
      emitChange();
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handleKeyDown = (field, e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();

      const fieldRefMap = {
        startH: startHRef,
        startM: startMRef,
        endH: endHRef,
        endM: endMRef
      };
      const fieldRef = fieldRefMap[field];
      if (!fieldRef?.current) return;

      const current = parseInt(fieldRef.current.value || '0', 10);
      const max = field.includes('H') ? 23 : 59;
      let next = current + (e.key === 'ArrowUp' ? 1 : -1);
      if (next < 0) next = max;
      if (next > max) next = 0;

      fieldRef.current.value = String(next).padStart(2, '0');
      emitChange();
    }
  };

  const renderField = (field, ref, max, nextRef) => (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      list={field.includes('H') ? HOURS_LIST_ID : MINUTES_LIST_ID}
      defaultValue={parsed[field]}
      onChange={(e) => handleFieldChange(field, e.target.value, max, nextRef)}
      onBlur={() => handleBlur(field)}
      onFocus={handleFocus}
      onKeyDown={(e) => handleKeyDown(field, e)}
      placeholder="00"
      maxLength={2}
      disabled={disabled}
      style={inputStyle}
      className="flex-1 min-w-0"
      autoComplete="off"
    />
  );

  return (
    <div
      className="w-full flex items-center gap-1 p-1.5 rounded-xl"
      style={{
        background: '#f8fafc',
        border: '2px solid #d9f99d'
      }}
    >
      <datalist id={HOURS_LIST_ID}>
        {HOURS.map((h) => (
          <option key={h} value={h} />
        ))}
      </datalist>
      <datalist id={MINUTES_LIST_ID}>
        {MINUTES.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>

      <span
        className="text-[10px] font-black uppercase tracking-wider flex-shrink-0 pl-1"
        style={{ color: '#4d7c0f' }}
      >
        De
      </span>

      {renderField('startH', startHRef, 23, startMRef)}
      <span className="font-black text-[#4d7c0f] flex-shrink-0">:</span>
      {renderField('startM', startMRef, 59, endHRef)}

      <span className="font-black text-[#65a30d] px-1 flex-shrink-0">→</span>

      {renderField('endH', endHRef, 23, endMRef)}
      <span className="font-black text-[#4d7c0f] flex-shrink-0">:</span>
      {renderField('endM', endMRef, 59, null)}

      <span
        className="text-[10px] font-black uppercase tracking-wider flex-shrink-0 pr-1"
        style={{ color: '#4d7c0f' }}
      >
        Hs
      </span>
    </div>
  );
}
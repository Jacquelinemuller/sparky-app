import { useState, useEffect } from 'react';

const HAND_FONT = '"Patrick Hand", cursive';
const TITLE_FONT = '"WimpyKid", "Patrick Hand", cursive';

export function useDiaryPagination({
  tipMessages,
  headerText,
  contentWidth,
  availableHeight,
  lineHeight = 24,
  bulletGap = 6,
  hasMiTip = true,
  miTipHeight = 48,
}) {
  const [pages, setPages] = useState([
    { messages: [], isFirst: true, isLast: true },
  ]);

  useEffect(() => {
    if (!tipMessages || tipMessages.length === 0) {
      setPages([{ messages: [], isFirst: true, isLast: true }]);
      return;
    }
    if (availableHeight <= 0 || contentWidth <= 0) return;

    const HALF = Math.round(lineHeight / 2); // 12px

    const measurer = document.createElement('div');
    measurer.style.cssText = `
      position:absolute;
      visibility:hidden;
      pointer-events:none;
      top:-9999px;
      left:-9999px;
      width:${contentWidth}px;
      font-family:${HAND_FONT};
      font-size:16px;
      line-height:${lineHeight}px;
    `;
    document.body.appendChild(measurer);

    const measureBlock = (html) => {
      measurer.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      const el = wrapper.firstElementChild;
      if (!el) return 0;
      measurer.appendChild(el);
      const h = el.getBoundingClientRect().height;
      return Math.ceil(h / lineHeight) * lineHeight;
    };

    // Header: alto + MEDIO renglón de gap (antes era 1 entero)
    let headerHeight = 0;
    if (headerText) {
      const h = measureBlock(
        `<div style="font-family:${TITLE_FONT};font-size:26px;line-height:${lineHeight}px;">${headerText}</div>`
      );
      headerHeight = h + HALF;
    }

    // Medir cada mensaje
    const messageHeights = tipMessages.map((msg) =>
      measureBlock(
        `<div style="display:flex;gap:${bulletGap}px;align-items:flex-start;">
           <span style="flex-shrink:0;">•</span>
           <span style="flex:1;">${msg}</span>
         </div>`
      )
    );

    document.body.removeChild(measurer);

    // ============ PRIMERA PASADA ============
    const result = [];
    let currentMessages = [];
    let used = 0;
    let firstPage = true;

    for (let i = 0; i < tipMessages.length; i++) {
      const msgH = messageHeights[i];
      const isFirstOfPage = currentMessages.length === 0;

      const headerCost =
        isFirstOfPage && firstPage && headerText ? headerHeight : 0;
      const gapBefore = isFirstOfPage ? 0 : HALF; // gap reducido a 12px

      const wouldUse = used + headerCost + gapBefore + msgH;

      if (wouldUse > availableHeight && currentMessages.length > 0) {
        result.push({
          messages: [...currentMessages],
          isFirst: firstPage,
          _used: used,
        });
        firstPage = false;
        currentMessages = [i];
        used = msgH;
      } else {
        if (isFirstOfPage && firstPage && headerText) {
          used += headerHeight;
        }
        currentMessages.push(i);
        used += gapBefore + msgH;
      }
    }

    if (currentMessages.length > 0) {
      result.push({
        messages: [...currentMessages],
        isFirst: firstPage,
        _used: used,
      });
    }

    // ============ SEGUNDA PASADA ============
    if (hasMiTip && result.length > 0) {
      const lastPage = result[result.length - 1];
      const miTipCost = HALF + miTipHeight; // gap reducido + MI TIP
      const fits = lastPage._used + miTipCost <= availableHeight;

      if (!fits && lastPage.messages.length > 1) {
        const movedMsg = lastPage.messages.pop();

        let recompute = 0;
        lastPage.messages.forEach((msgIdx, idx) => {
          if (idx === 0 && lastPage.isFirst && headerText) {
            recompute += headerHeight;
          }
          if (idx > 0 || (lastPage.isFirst && headerText)) {
            recompute += HALF;
          }
          recompute += messageHeights[msgIdx];
        });
        lastPage._used = recompute;

        result.push({
          messages: [movedMsg],
          isFirst: false,
          _used: messageHeights[movedMsg],
        });
      }
    }

    const finalPages = result.map((p, i) => ({
      messages: p.messages,
      isFirst: i === 0,
      isLast: i === result.length - 1,
    }));

    setPages(finalPages);
  }, [
    tipMessages,
    contentWidth,
    availableHeight,
    headerText,
    lineHeight,
    bulletGap,
    hasMiTip,
    miTipHeight,
  ]);

  return { pages };
}
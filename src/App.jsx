import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import CanvasBoard from './components/CanvasBoard';
import Sidebar from './components/Sidebar';
import ScorePanel from './components/ScorePanel';
import { brandPalettes, fontPairs, templates } from './data/templates';
import {
  autoFix,
  generateDesignFeedback,
  normalizeElement,
  scoreDesign,
  structurePromptToElements,
} from './utils/designEngine';

const initialTheme = {
  accent: '#5D94FF',
  background: '#070d1f',
  text: '#E9F2FF',
  success: '#44D5A8',
  headingFont: 'Inter',
  bodyFont: 'Inter',
};

function downloadFile(name, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const [prompt, setPrompt] = useState('Make a hackathon poster for IntelliLayer');
  const [elements, setElements] = useState(() =>
    structurePromptToElements('IntelliLayer Smart Design Assistant', initialTheme),
  );
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);
  const dragState = useRef(null);

  const score = useMemo(() => scoreDesign(elements, theme), [elements, theme]);
  const feedback = useMemo(() => generateDesignFeedback(score), [score]);

  const updateElement = (id, patch) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)));
  };

  const onSelect = (event, id) => {
    event.stopPropagation();
    setSelectedId(id);
  };

  const beginDrag = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    const target = elements.find((el) => el.id === id);
    if (!target) return;
    dragState.current = {
      id,
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,
      originX: target.x,
      originY: target.y,
    };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', endPointer);
  };

  const beginResize = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    const target = elements.find((el) => el.id === id);
    if (!target) return;
    dragState.current = {
      id,
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      originW: target.w,
      originH: target.h,
    };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', endPointer);
  };

  const handlePointerMove = (event) => {
    const state = dragState.current;
    if (!state) return;

    if (state.mode === 'move') {
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const snappedX = Math.round((state.originX + dx) / 8) * 8;
      const snappedY = Math.round((state.originY + dy) / 8) * 8;
      updateElement(state.id, { x: Math.max(8, snappedX), y: Math.max(8, snappedY) });
      return;
    }

    const dw = event.clientX - state.startX;
    const dh = event.clientY - state.startY;
    updateElement(state.id, {
      w: Math.max(100, state.originW + dw),
      h: Math.max(45, state.originH + dh),
    });
  };

  const endPointer = () => {
    dragState.current = null;
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', endPointer);
  };

  const applyPrompt = () => {
    setElements(structurePromptToElements(prompt, theme));
    setSelectedId(null);
  };

  const applyAutoFix = () => setElements((prev) => autoFix(prev));

  const applyTemplate = (template) => {
    setElements(template.elements.map((element, idx) => normalizeElement(element, idx, theme)));
    setSelectedId(null);
  };

  const randomBrand = () => {
    const palette = brandPalettes[Math.floor(Math.random() * brandPalettes.length)];
    const fonts = fontPairs[Math.floor(Math.random() * fontPairs.length)];
    setTheme({
      accent: palette[0],
      background: palette[1],
      text: palette[2],
      success: palette[3],
      headingFont: fonts.heading,
      bodyFont: fonts.body,
    });
    setElements((prev) =>
      prev.map((el) => ({
        ...el,
        color: palette[2],
        background: el.type === 'cta' ? palette[0] : 'transparent',
      })),
    );
  };

  const exportPng = async () => {
    if (!canvasRef.current) return;
    const dataUrl = await toPng(canvasRef.current, { cacheBust: true });
    const link = document.createElement('a');
    link.download = 'intellilayer-design.png';
    link.href = dataUrl;
    link.click();
  };

  const exportHtml = () => {
    const html = `<!doctype html><html><body style="background:${theme.background};color:${theme.text};font-family:${theme.bodyFont};">${elements
      .map(
        (el) =>
          `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;font-size:${el.fontSize}px;font-weight:${el.fontWeight};background:${el.background};color:${el.color};border-radius:${el.borderRadius}px;padding:8px;">${el.text}</div>`,
      )
      .join('')}</body></html>`;
    downloadFile('intellilayer-layout.html', html, 'text/html');
  };

  return (
    <div className="min-h-screen p-4">
      <header className="mb-4 rounded-xl border border-slate-700/80 bg-brand-900/80 p-4 shadow-glow">
        <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">Canva + Figma + AI Design Assistant</p>
        <h1 className="text-2xl font-semibold">IntelliLayer Studio</h1>
        <p className="text-sm text-slate-300">AI hierarchy engine · design scoring · smart templates · drag-drop editor · debugger mode</p>
      </header>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Sidebar
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={applyPrompt}
            onAutoFix={applyAutoFix}
            templates={templates}
            onApplyTemplate={applyTemplate}
            onRandomBrand={randomBrand}
            onExportPng={exportPng}
            onExportHtml={exportHtml}
          />
        </div>

        <div className="col-span-6 space-y-3">
          <div className="panel flex items-center justify-between p-3 text-sm">
            <span>Theme: {theme.headingFont} / {theme.bodyFont}</span>
            <div className="flex gap-2">
              <span className="rounded px-2 py-1" style={{ background: theme.accent }}>Accent</span>
              <span className="rounded border border-slate-600 px-2 py-1" style={{ color: theme.text }}>Text</span>
            </div>
          </div>
          <CanvasBoard
            elements={elements}
            selectedId={selectedId}
            canvasRef={canvasRef}
            onSelect={onSelect}
            onDragStart={beginDrag}
            onResizeStart={beginResize}
          />
        </div>

        <div className="col-span-3">
          <ScorePanel score={score} feedback={feedback} />
        </div>
      </div>
    </div>
  );
}

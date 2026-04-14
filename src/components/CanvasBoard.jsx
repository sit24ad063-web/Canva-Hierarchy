import { motion } from 'framer-motion';

function ElementBox({ element, selected, onSelect, onDrag, onResize }) {
  return (
    <motion.div
      layout
      onMouseDown={(event) => onSelect(event, element.id)}
      className={`absolute cursor-move rounded-md border ${selected ? 'border-cyan-300 shadow-glow' : 'border-slate-500/40'} bg-slate-950/25`}
      style={{
        left: element.x,
        top: element.y,
        width: element.w,
        height: element.h,
        zIndex: element.z,
        color: element.color,
        background: element.background,
        borderRadius: element.borderRadius,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        padding: element.type === 'cta' ? '14px 18px' : '6px 8px',
      }}
    >
      <div className="pointer-events-none line-clamp-3">{element.text}</div>
      {selected && (
        <button
          type="button"
          className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border border-cyan-200 bg-cyan-400"
          onMouseDown={(event) => onResize(event, element.id)}
          aria-label="Resize"
        />
      )}
      <div className="absolute inset-0" onMouseDown={(event) => onDrag(event, element.id)} />
    </motion.div>
  );
}

export default function CanvasBoard({ elements, selectedId, canvasRef, onSelect, onDragStart, onResizeStart }) {
  return (
    <div ref={canvasRef} className="relative h-[720px] rounded-xl border border-slate-700/70 bg-brand-900/60">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(150,200,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(150,200,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      {elements.map((element) => (
        <ElementBox
          key={element.id}
          element={element}
          selected={selectedId === element.id}
          onSelect={onSelect}
          onDrag={onDragStart}
          onResize={onResizeStart}
        />
      ))}
    </div>
  );
}

import { WandSparkles, Sparkles, Palette, Layers, Download } from 'lucide-react';

export default function Sidebar({
  prompt,
  onPromptChange,
  onGenerate,
  onAutoFix,
  templates,
  onApplyTemplate,
  onRandomBrand,
  onExportPng,
  onExportHtml,
}) {
  return (
    <aside className="panel p-4 space-y-4">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><WandSparkles size={16} /> Smart Content Structuring</h3>
        <textarea
          className="h-24 w-full rounded-lg border border-slate-700 bg-brand-950/80 p-2 text-sm"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="e.g. Make a hackathon poster for AI builders"
        />
        <div className="mt-2 flex gap-2">
          <button className="btn" onClick={onGenerate}>Generate Layout</button>
          <button className="btn-ghost" onClick={onAutoFix}>Auto-fix</button>
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Layers size={16} /> Template Library</h3>
        <div className="space-y-2">
          {templates.map((template) => (
            <button key={template.id} className="btn-ghost w-full text-left" onClick={() => onApplyTemplate(template)}>
              {template.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Palette size={16} /> Theme & Brand Kit</h3>
        <button className="btn w-full" onClick={onRandomBrand}>Generate Startup Identity Kit</button>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Download size={16} /> Export</h3>
        <div className="flex flex-col gap-2">
          <button className="btn-ghost" onClick={onExportPng}>Export PNG</button>
          <button className="btn-ghost" onClick={onExportHtml}>Export HTML/CSS</button>
        </div>
      </section>

      <section className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
        <p className="font-semibold">Design Debugger Mode</p>
        <p>Highlights weak hierarchy, spacing, alignment, and contrast with concrete fix suggestions.</p>
      </section>

      <section className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-3 text-xs text-fuchsia-100">
        <p className="flex items-center gap-2 font-semibold"><Sparkles size={14} /> AI Content Generator</p>
        <p>Use prompt generation + auto-fix to improve heading clarity and CTA quality instantly.</p>
      </section>
    </aside>
  );
}

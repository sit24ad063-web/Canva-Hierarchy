export default function ScorePanel({ score, feedback }) {
  return (
    <aside className="panel p-4">
      <h3 className="text-base font-semibold">Visual Design Score System</h3>
      <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
        <p className="text-xs uppercase text-emerald-300">Overall</p>
        <p className="text-4xl font-bold text-emerald-200">{score.overall}</p>
      </div>

      <div className="mt-4 space-y-2">
        {feedback.map((item) => (
          <div key={item.area} className="rounded-lg border border-slate-700 bg-brand-950/70 p-3">
            <div className="flex items-center justify-between text-sm">
              <span>{item.area}</span>
              <span className="font-semibold text-cyan-200">{item.score}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">{item.suggestion}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
        <p className="text-xs font-semibold uppercase text-amber-300">Debugger Findings</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-100">
          {score.issues.length ? score.issues.map((issue) => <li key={issue}>{issue}</li>) : <li>No major issues. Great hierarchy!</li>}
        </ul>
      </div>
    </aside>
  );
}

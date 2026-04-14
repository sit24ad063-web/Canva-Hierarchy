const TYPE_STYLES = {
  title: { fontSize: 54, fontWeight: 800 },
  subtitle: { fontSize: 34, fontWeight: 650 },
  body: { fontSize: 22, fontWeight: 450 },
  cta: { fontSize: 24, fontWeight: 700 },
};

export function normalizeElement(raw, index, theme) {
  const base = TYPE_STYLES[raw.type] || TYPE_STYLES.body;
  return {
    id: raw.id || `el_${Date.now()}_${index}`,
    type: raw.type,
    text: raw.text,
    x: raw.x,
    y: raw.y,
    w: raw.w,
    h: raw.h,
    z: raw.z ?? index,
    fontSize: raw.fontSize || base.fontSize,
    fontWeight: raw.fontWeight || base.fontWeight,
    color: raw.color || theme.text,
    background: raw.background || (raw.type === 'cta' ? theme.accent : 'transparent'),
    borderRadius: raw.type === 'cta' ? 12 : 0,
  };
}

export function structurePromptToElements(prompt, theme) {
  const baseTitle = prompt?.trim() ? prompt : 'New Smart Design';
  const title = baseTitle.split(' ').slice(0, 6).join(' ');

  return [
    normalizeElement({ type: 'title', text: title, x: 70, y: 80, w: 680, h: 90 }, 0, theme),
    normalizeElement({ type: 'subtitle', text: 'AI-generated hierarchy · Canva-style precision', x: 70, y: 185, w: 560, h: 56 }, 1, theme),
    normalizeElement({ type: 'body', text: 'This layout was auto-structured from your prompt using hierarchy and spacing logic.', x: 70, y: 265, w: 640, h: 92 }, 2, theme),
    normalizeElement({ type: 'cta', text: 'Auto-fix my design', x: 70, y: 388, w: 250, h: 60 }, 3, theme),
  ];
}

function contrastScore(theme) {
  return theme.text !== theme.background ? 86 : 42;
}

export function scoreDesign(elements, theme) {
  if (!elements.length) {
    return { typography: 0, spacing: 0, alignment: 0, contrast: 0, overall: 0, issues: ['Add design elements first.'] };
  }

  const title = elements.find((e) => e.type === 'title');
  const body = elements.find((e) => e.type === 'body');

  const typography = title && body && title.fontSize > body.fontSize * 1.6 ? 90 : 68;

  const ys = elements.map((e) => e.y).sort((a, b) => a - b);
  const gaps = ys.slice(1).map((y, idx) => y - ys[idx]);
  const consistentGaps = gaps.filter((g) => g > 35 && g < 130).length;
  const spacing = Math.min(98, 50 + Math.round((consistentGaps / Math.max(1, gaps.length)) * 48));

  const leftAnchors = elements.filter((e) => Math.abs(e.x - elements[0].x) < 24).length;
  const alignment = Math.min(100, 45 + Math.round((leftAnchors / elements.length) * 55));

  const contrast = contrastScore(theme);
  const overall = Math.round((typography + spacing + alignment + contrast) / 4);

  const issues = [];
  if (typography < 75) issues.push('Increase hierarchy contrast: enlarge title or reduce body font size.');
  if (spacing < 75) issues.push('Normalize vertical spacing between major blocks.');
  if (alignment < 75) issues.push('Align key elements to a single vertical guide.');
  if (contrast < 75) issues.push('Increase text/background contrast for accessibility.');

  return { typography, spacing, alignment, contrast, overall, issues };
}

export function autoFix(elements) {
  return elements.map((el, idx) => ({
    ...el,
    x: 70,
    y: 80 + idx * 105,
    fontSize: el.type === 'title' ? Math.max(el.fontSize, 56) : el.type === 'body' ? Math.min(el.fontSize, 21) : el.fontSize,
  }));
}

export function generateDesignFeedback(scores) {
  return [
    { area: 'Typography', score: scores.typography, suggestion: 'Use only 2 type scales: heading + body.' },
    { area: 'Spacing', score: scores.spacing, suggestion: 'Keep vertical rhythm between 48–96 px blocks.' },
    { area: 'Alignment', score: scores.alignment, suggestion: 'Snap all primary blocks to one column guide.' },
    { area: 'Contrast', score: scores.contrast, suggestion: 'Aim for higher foreground/background separation.' },
  ];
}

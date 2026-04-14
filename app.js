class QuadTree {
  constructor(bounds, capacity = 4, depth = 0, maxDepth = 7) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.points = [];
    this.children = null;
  }

  subdivide() {
    const { x, y, w, h } = this.bounds;
    const hw = w / 2;
    const hh = h / 2;
    this.children = [
      new QuadTree({ x, y, w: hw, h: hh }, this.capacity, this.depth + 1, this.maxDepth),
      new QuadTree({ x: x + hw, y, w: hw, h: hh }, this.capacity, this.depth + 1, this.maxDepth),
      new QuadTree({ x, y: y + hh, w: hw, h: hh }, this.capacity, this.depth + 1, this.maxDepth),
      new QuadTree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity, this.depth + 1, this.maxDepth),
    ];
  }

  contains(rect, p) {
    return p.x >= rect.x && p.x < rect.x + rect.w && p.y >= rect.y && p.y < rect.y + rect.h;
  }

  intersects(a, b) {
    return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
  }

  insert(item) {
    const center = { x: item.x + item.w / 2, y: item.y + item.h / 2 };
    if (!this.contains(this.bounds, center)) {
      return false;
    }

    if (this.points.length < this.capacity || this.depth >= this.maxDepth) {
      this.points.push(item);
      return true;
    }

    if (!this.children) {
      this.subdivide();
    }

    return this.children.some((child) => child.insert(item));
  }

  query(range, found = []) {
    if (!this.intersects(this.bounds, range)) {
      return found;
    }

    for (const p of this.points) {
      if (this.intersects(range, p)) {
        found.push(p);
      }
    }

    if (this.children) {
      this.children.forEach((child) => child.query(range, found));
    }

    return found;
  }

  collectCells(cells = []) {
    cells.push(this.bounds);
    if (this.children) {
      this.children.forEach((child) => child.collectCells(cells));
    }
    return cells;
  }
}

const sceneCanvas = document.getElementById('sceneCanvas');
const ctx = sceneCanvas.getContext('2d');
const miniMap = document.getElementById('miniMap');
const miniCtx = miniMap.getContext('2d');
const modeBadge = document.getElementById('modeBadge');
const statsBadge = document.getElementById('statsBadge');
const selectedInfo = document.getElementById('selectedInfo');
const candidateList = document.getElementById('candidateList');
const logList = document.getElementById('logList');
const layerTree = document.getElementById('layerTree');

const palette = ['#4daaf0', '#7f71e5', '#e58977', '#35ad95', '#eab268', '#ca6471'];

let mode = 'select';
let selectedId = null;
let lastSelectedId = null;
let hoveredCell = null;
let items = [];
let quadtree;

function syncCanvasResolution() {
  const dpr = window.devicePixelRatio || 1;
  const rect = sceneCanvas.getBoundingClientRect();
  const width = Math.max(960, Math.floor(rect.width));
  const height = Math.max(560, Math.floor(rect.height));

  sceneCanvas.width = Math.floor(width * dpr);
  sceneCanvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  rebuildIndex();
}

function seedScene() {
  const seeded = [
    { id: 'hero', name: 'Hero Section', x: 90, y: 80, w: 470, h: 300, depth: 0, z: 1, parent: null, color: palette[0] },
    { id: 'hero_badges', name: 'Badge Group', x: 200, y: 210, w: 250, h: 120, depth: 1, z: 2, parent: 'hero', color: palette[1] },
    { id: 'hero_badge_text', name: 'Badge Text', x: 248, y: 252, w: 155, h: 44, depth: 2, z: 3, parent: 'hero_badges', color: palette[4] },
    { id: 'pricing', name: 'Pricing Card', x: 640, y: 130, w: 310, h: 350, depth: 0, z: 2, parent: null, color: palette[2] },
    { id: 'pricing_cta', name: 'CTA Button', x: 720, y: 385, w: 165, h: 58, depth: 1, z: 4, parent: 'pricing', color: palette[3] },
    { id: 'footer', name: 'Footer Bar', x: 140, y: 500, w: 830, h: 130, depth: 0, z: 0, parent: null, color: palette[5] },
  ];
  items = seeded;
  selectedId = null;
  rebuildTree();
}

function rebuildIndex() {
  const worldWidth = sceneCanvas.width / (window.devicePixelRatio || 1);
  const worldHeight = sceneCanvas.height / (window.devicePixelRatio || 1);
  quadtree = new QuadTree({ x: 0, y: 0, w: worldWidth, h: worldHeight }, 3, 0, 6);
  items.forEach((item) => quadtree.insert(item));
  render();
}

function pathFor(item) {
  const chain = [item.name];
  let current = item;
  while (current.parent) {
    current = items.find((el) => el.id === current.parent);
    if (!current) break;
    chain.unshift(current.name);
  }
  return chain.join(' › ');
}

function ancestorChain(nodeId) {
  const chain = [];
  let current = items.find((el) => el.id === nodeId);
  while (current) {
    chain.unshift(current.id);
    if (!current.parent) break;
    current = items.find((el) => el.id === current.parent);
  }
  return chain;
}

function structuralImportance(el) {
  const childCount = items.filter((candidate) => candidate.parent === el.id).length;
  const leafBoost = childCount === 0 ? 8 : 0;
  return childCount * 6 + leafBoost;
}

function intentBoost(el, x, y) {
  const centerX = el.x + el.w / 2;
  const centerY = el.y + el.h / 2;
  const distance = Math.hypot(centerX - x, centerY - y);
  const proximityBoost = Math.max(0, 20 - distance / 14);

  if (!lastSelectedId) {
    return proximityBoost;
  }

  const previousChain = ancestorChain(lastSelectedId);
  const currentChain = ancestorChain(el.id);
  const shared = currentChain.filter((id) => previousChain.includes(id)).length;
  const continuityBoost = shared * 9;
  return proximityBoost + continuityBoost;
}

function computePriority(el, x, y) {
  const zScore = el.z * 20;
  const depthScore = el.depth * 45;
  const sizePenalty = Math.round((el.w * el.h) / 1800);
  const structureScore = structuralImportance(el);
  const intentScore = intentBoost(el, x, y);
  const total = zScore + depthScore + structureScore + intentScore - sizePenalty;

  return {
    total: Math.round(total),
    zScore,
    depthScore,
    structureScore,
    intentScore: Math.round(intentScore),
    sizePenalty,
  };
}

function logStep(message) {
  const now = new Date();
  const stamp = now.toISOString().slice(11, 23);
  const line = document.createElement('li');
  line.innerHTML = `<span>${stamp}</span> ${message}`;
  logList.prepend(line);
  while (logList.children.length > 24) logList.removeChild(logList.lastChild);
}

function resolveSelection(x, y) {
  const start = performance.now();
  const range = { x: x - 1, y: y - 1, w: 2, h: 2 };
  const candidates = quadtree.query(range, []);
  hoveredCell = range;

  logStep(`quadtree.query at (${x.toFixed(1)}, ${y.toFixed(1)}) returned ${candidates.length} candidate(s)`);

  const hits = candidates.filter((el) => x >= el.x && x <= el.x + el.w && y >= el.y && y <= el.y + el.h);
  logStep(`spatial filter reduced set to <span class="hit">${hits.length} true hit(s)</span>`);

  const ranked = hits
    .map((el) => {
      const factors = computePriority(el, x, y);
      return { ...el, priority: factors.total, factors };
    })
    .sort((a, b) => b.priority - a.priority || b.depth - a.depth || b.z - a.z);

  if (ranked[0]) {
    selectedId = ranked[0].id;
    lastSelectedId = ranked[0].id;
    logStep(`winner: <span class="hit">${ranked[0].name}</span> by hybrid intent-aware ranking`);
  } else {
    selectedId = null;
    logStep('no final winner, pointer hit empty region');
  }

  const elapsed = performance.now() - start;
  statsBadge.textContent = `Resolution: ${elapsed.toFixed(3)} ms`;
  updateDebugPanel(ranked, elapsed);
  render();
}

function addRandomNode(x, y) {
  const w = 100 + Math.random() * 180;
  const h = 64 + Math.random() * 120;
  const id = `node_${Date.now().toString(36)}`;
  const parent = Math.random() > 0.55 ? items[Math.floor(Math.random() * items.length)] : null;
  const depth = parent ? Math.min(parent.depth + 1, 3) : 0;
  const worldWidth = sceneCanvas.width / (window.devicePixelRatio || 1);
  const worldHeight = sceneCanvas.height / (window.devicePixelRatio || 1);

  const node = {
    id,
    name: `Dynamic Node ${items.length + 1}`,
    x: Math.max(10, Math.min(worldWidth - w - 10, x - w / 2)),
    y: Math.max(10, Math.min(worldHeight - h - 10, y - h / 2)),
    w,
    h,
    depth,
    z: Math.floor(Math.random() * 6),
    parent: parent ? parent.id : null,
    color: palette[Math.floor(Math.random() * palette.length)],
  };

  items.push(node);
  logStep(`add mode: inserted ${node.name} (depth ${node.depth}, z ${node.z}), rebuilding quadtree`);
  rebuildTree();
  rebuildIndex();
}

function updateDebugPanel(ranked, elapsed) {
  const active = items.find((el) => el.id === selectedId);
  if (active) {
    selectedInfo.innerHTML = `
      <strong>${active.name}</strong><br />
      id: ${active.id}<br />
      depth: ${active.depth} · z-index: ${active.z}<br />
      path: ${pathFor(active)}<br />
      <small>resolved in ${elapsed.toFixed(3)} ms · intent-aware scoring active</small>
    `;
  } else {
    selectedInfo.innerHTML = 'No element selected.';
  }

  candidateList.innerHTML = '';
  if (!ranked.length) {
    const li = document.createElement('li');
    li.textContent = 'No candidates in this point.';
    candidateList.appendChild(li);
    return;
  }

  ranked.forEach((c) => {
    const li = document.createElement('li');
    const score = Number.isFinite(c.priority) ? c.priority : computePriority(c, c.x + c.w / 2, c.y + c.h / 2).total;
    const factors = c.factors
      ? ` | z:${c.factors.zScore} depth:${c.factors.depthScore} structure:${c.factors.structureScore} intent:${c.factors.intentScore} area:-${c.factors.sizePenalty}`
      : '';
    li.textContent = `${c.name} — score ${score} (d${c.depth}/z${c.z})${factors}`;
    candidateList.appendChild(li);
  });
}

function drawNode(node) {
  const isSelected = node.id === selectedId;
  ctx.save();
  ctx.globalAlpha = isSelected ? 0.92 : 0.74;
  ctx.fillStyle = node.color;
  ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.35)';
  ctx.lineWidth = isSelected ? 3 : 1;
  ctx.fillRect(node.x, node.y, node.w, node.h);
  ctx.strokeRect(node.x, node.y, node.w, node.h);

  ctx.fillStyle = '#eef5ff';
  ctx.font = '700 12px ui-sans-serif';
  ctx.fillText(`${node.name} (d${node.depth} z${node.z})`, node.x + 10, node.y + 20);
  ctx.restore();
}

function drawMiniMap() {
  miniCtx.clearRect(0, 0, miniMap.width, miniMap.height);
  miniCtx.fillStyle = '#050c1c';
  miniCtx.fillRect(0, 0, miniMap.width, miniMap.height);

  const worldWidth = sceneCanvas.width / (window.devicePixelRatio || 1);
  const worldHeight = sceneCanvas.height / (window.devicePixelRatio || 1);
  const sx = miniMap.width / worldWidth;
  const sy = miniMap.height / worldHeight;
  const cells = quadtree.collectCells();

  miniCtx.strokeStyle = 'rgba(132, 168, 230, 0.25)';
  cells.forEach((cell) => miniCtx.strokeRect(cell.x * sx, cell.y * sy, cell.w * sx, cell.h * sy));

  if (hoveredCell) {
    miniCtx.fillStyle = 'rgba(244, 184, 96, 0.5)';
    miniCtx.fillRect(hoveredCell.x * sx, hoveredCell.y * sy, hoveredCell.w * sx, hoveredCell.h * sy);
  }
}

function render() {
  const worldWidth = sceneCanvas.width / (window.devicePixelRatio || 1);
  const worldHeight = sceneCanvas.height / (window.devicePixelRatio || 1);
  ctx.clearRect(0, 0, worldWidth, worldHeight);

  items
    .slice()
    .sort((a, b) => a.depth - b.depth || a.z - b.z)
    .forEach(drawNode);
  drawMiniMap();
}

function rebuildTree() {
  const childrenByParent = new Map();
  for (const item of items) {
    const key = item.parent || 'root';
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(item);
  }

  const rootNodes = (childrenByParent.get('root') || []).sort((a, b) => a.name.localeCompare(b.name));
  layerTree.innerHTML = '';

  function addBranch(node, depth) {
    const li = document.createElement('li');
    li.className = `depth-${Math.min(depth, 2)}`;
    const btn = document.createElement('button');
    btn.textContent = `${'· '.repeat(depth)}${node.name}`;
    btn.onclick = () => {
      selectedId = node.id;
      const factors = computePriority(node, node.x + node.w / 2, node.y + node.h / 2);
      updateDebugPanel([{ ...node, priority: factors.total, factors }], 0);
      render();
      logStep(`reverse resolve: selected from layer tree → ${pathFor(node)}`);
    };
    li.appendChild(btn);
    layerTree.appendChild(li);

    const kids = (childrenByParent.get(node.id) || []).sort((a, b) => a.name.localeCompare(b.name));
    for (const child of kids) addBranch(child, depth + 1);
  }

  rootNodes.forEach((node) => addBranch(node, 0));
}

function toWorldPosition(event) {
  const rect = sceneCanvas.getBoundingClientRect();
  const worldWidth = sceneCanvas.width / (window.devicePixelRatio || 1);
  const worldHeight = sceneCanvas.height / (window.devicePixelRatio || 1);
  const x = ((event.clientX - rect.left) / rect.width) * worldWidth;
  const y = ((event.clientY - rect.top) / rect.height) * worldHeight;
  return { x, y };
}

function wireEvents() {
  sceneCanvas.addEventListener('click', (event) => {
    const { x, y } = toWorldPosition(event);
    if (mode === 'select') resolveSelection(x, y);
    else addRandomNode(x, y);
  });

  document.getElementById('selectModeBtn').addEventListener('click', () => {
    mode = 'select';
    modeBadge.textContent = 'Mode: Select';
    document.getElementById('selectModeBtn').classList.add('active');
    document.getElementById('addModeBtn').classList.remove('active');
  });

  document.getElementById('addModeBtn').addEventListener('click', () => {
    mode = 'add';
    modeBadge.textContent = 'Mode: Add';
    document.getElementById('addModeBtn').classList.add('active');
    document.getElementById('selectModeBtn').classList.remove('active');
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    logStep('scene reset requested');
    seedScene();
    hoveredCell = null;
    lastSelectedId = null;
    selectedInfo.textContent = 'No element selected.';
    candidateList.innerHTML = '';
    statsBadge.textContent = 'Resolution: --';
    rebuildIndex();
  });

  window.addEventListener('resize', () => {
    syncCanvasResolution();
    render();
  });
}

wireEvents();
seedScene();
syncCanvasResolution();
selectedInfo.textContent = 'No element selected.';
candidateList.innerHTML = '<li>Click on the canvas to run the selection pipeline.</li>';
logStep('engine ready: click to begin interaction');

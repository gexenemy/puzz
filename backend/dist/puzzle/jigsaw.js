"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJigsaw = generateJigsaw;
const seedrandom_1 = __importDefault(require("seedrandom"));
const opposite = (t) => (t === 'tab' ? 'blank' : t === 'blank' ? 'tab' : 'flat');
/** Сегмент грани с «ушком» */
function edgeWithTab(xa, ya, xb, yb, side, type, tabSize, neck) {
    if (type === 'flat')
        return `L ${xb} ${yb}`;
    const mx = (xa + xb) / 2;
    const my = (ya + yb) / 2;
    // внешняя нормаль к стороне
    let nx = 0, ny = 0;
    if (side === 'top')
        ny = -1;
    if (side === 'bottom')
        ny = 1;
    if (side === 'left')
        nx = -1;
    if (side === 'right')
        nx = 1;
    const dir = type === 'tab' ? 1 : -1; // tab наружу, blank внутрь
    const ex = mx + dir * nx * tabSize;
    const ey = my + dir * ny * tabSize;
    // единичная касательная вдоль ребра
    const tx = xb - xa;
    const ty = yb - ya;
    const len = Math.hypot(tx, ty) || 1;
    const ux = tx / len;
    const uy = ty / len;
    // точки у «шейки»
    const inX = mx - ux * neck;
    const inY = my - uy * neck;
    const outX = mx + ux * neck;
    const outY = my + uy * neck;
    return `L ${inX} ${inY} C ${inX} ${inY}, ${ex} ${ey}, ${outX} ${outY} L ${xb} ${yb}`;
}
/** Основной генератор */
function generateJigsaw(opts) {
    const { width, height, rows, cols, seed } = opts;
    if (rows < 1 || cols < 1)
        throw new Error('rows and cols must be >= 1');
    const rng = (0, seedrandom_1.default)(String(seed));
    const cw = width / cols;
    const ch = height / rows;
    // внутренние рёбра (между клетками)
    const vEdges = Array.from({ length: rows }, () => Array(Math.max(cols - 1, 0)).fill('flat'));
    const hEdges = Array.from({ length: Math.max(rows - 1, 0) }, () => Array(cols).fill('flat'));
    const pick = () => (rng() > 0.5 ? 'tab' : 'blank');
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++)
            vEdges[r][c] = pick();
    }
    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols; c++)
            hEdges[r][c] = pick();
    }
    // геометрия ушка
    const tabSize = Math.min(cw, ch) * 0.35;
    const neck = tabSize * 0.4;
    function piecePath(r, c) {
        const x0 = c * cw;
        const y0 = r * ch;
        const x1 = x0 + cw;
        const y1 = y0 + ch;
        const p = [`M ${x0} ${y0}`];
        // TOP: если не верхний ряд — противоположная верхнему соседу
        if (r === 0)
            p.push(`L ${x1} ${y0}`);
        else
            p.push(edgeWithTab(x0, y0, x1, y0, 'top', opposite(hEdges[r - 1][c]), tabSize, neck));
        // RIGHT: если не последний столбец — как в vEdges[r][c]
        if (c === cols - 1)
            p.push(`L ${x1} ${y1}`);
        else
            p.push(edgeWithTab(x1, y0, x1, y1, 'right', vEdges[r][c], tabSize, neck));
        // BOTTOM: если не нижний ряд — ТИП БЕРЁМ БЕЗ opposite!
        if (r === rows - 1)
            p.push(`L ${x0} ${y1}`);
        else
            p.push(edgeWithTab(x1, y1, x0, y1, 'bottom', hEdges[r][c], tabSize, neck));
        // LEFT: если не первый столбец — противоположная левому соседу
        if (c === 0)
            p.push('Z');
        else {
            p.push(edgeWithTab(x0, y1, x0, y0, 'left', opposite(vEdges[r][c - 1]), tabSize, neck));
            p.push('Z');
        }
        return p.join(' ');
    }
    const pieces = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const path = piecePath(r, c);
            const bbox = { x: c * cw, y: r * ch, w: cw, h: ch };
            pieces.push({ id: `${r}-${c}`, row: r, col: c, path, bbox });
        }
    }
    return { pieces, cell: { w: cw, h: ch } };
}
//# sourceMappingURL=jigsaw.js.map
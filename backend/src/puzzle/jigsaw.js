"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJigsaw = generateJigsaw;
var seedrandom_1 = require("seedrandom");
/** Вспомогательно: инвертируем тип грани для сопряжённого соседа */
function opposite(t) {
    if (t === 'tab')
        return 'blank';
    if (t === 'blank')
        return 'tab';
    return 'flat';
}
/**
 * Сегмент грани с «ушком» (кубическая Безье). Возвращает часть SVG-пути.
 * Сторона определяет направление нормали (куда выпуклость), type — tab/blank/flat.
 */
function edgeWithTab(xa, ya, xb, yb, side, type, tabSize, neck) {
    if (type === 'flat')
        return "L ".concat(xb, " ").concat(yb);
    // середина ребра
    var mx = (xa + xb) / 2;
    var my = (ya + yb) / 2;
    var isHorizontal = Math.abs(ya - yb) < 1e-6;
    var dir = type === 'tab' ? 1 : -1; // tab наружу, blank внутрь
    // нормаль наружу относительно стороны
    var nx = 0, ny = 0;
    if (side === 'top') {
        nx = 0;
        ny = -1;
    }
    else if (side === 'bottom') {
        nx = 0;
        ny = 1;
    }
    else if (side === 'left') {
        nx = -1;
        ny = 0;
    }
    else if (side === 'right') {
        nx = 1;
        ny = 0;
    }
    // вершина «головки» ушка
    var ex = mx + dir * nx * tabSize;
    var ey = my + dir * ny * tabSize;
    // контрольные точки у «шейки»
    // упрощённая геометрия: смещаемся по касательной вдоль ребра на ±neck
    var tx = xb - xa;
    var ty = yb - ya;
    var len = Math.hypot(tx, ty) || 1;
    var ux = tx / len;
    var uy = ty / len;
    var pInX = mx - ux * neck;
    var pInY = my - uy * neck;
    var pOutX = mx + ux * neck;
    var pOutY = my + uy * neck;
    // формируем сегмент: приходим к шейке → «выпуклость» → уходим ко второй шейке → конец ребра
    var seg1 = "L ".concat(pInX, " ").concat(pInY);
    var bez = "C ".concat(pInX, " ").concat(pInY, ", ").concat(ex, " ").concat(ey, ", ").concat(pOutX, " ").concat(pOutY);
    var seg2 = "L ".concat(xb, " ").concat(yb);
    return "".concat(seg1, " ").concat(bez, " ").concat(seg2);
}
/** Основной генератор фигурных пазлов */
function generateJigsaw(opts) {
    var width = opts.width, height = opts.height, rows = opts.rows, cols = opts.cols, seed = opts.seed;
    if (rows < 1 || cols < 1) {
        throw new Error('rows and cols must be >= 1');
    }
    var rng = (0, seedrandom_1.default)(String(seed));
    var cw = width / cols;
    var ch = height / rows;
    // типы внутренних граней: vEdges — вертикальные (между (r,c) и (r,c+1)), hEdges — горизонтальные (между (r,c) и (r+1,c))
    var vEdges = Array.from({ length: rows }, function () {
        return Array(Math.max(cols - 1, 0)).fill('flat');
    });
    var hEdges = Array.from({ length: Math.max(rows - 1, 0) }, function () {
        return Array(cols).fill('flat');
    });
    var pick = function () { return (rng() > 0.5 ? 'tab' : 'blank'); };
    // заполняем внутренние рёбра
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols - 1; c++) {
            vEdges[r][c] = pick();
        }
    }
    for (var r = 0; r < rows - 1; r++) {
        for (var c = 0; c < cols; c++) {
            hEdges[r][c] = pick();
        }
    }
    // параметры формы ушка
    var tabSize = Math.min(cw, ch) * 0.35;
    var neck = tabSize * 0.40;
    // SVG path для конкретного тайла (r,c)
    function piecePath(r, c) {
        var x0 = c * cw;
        var y0 = r * ch;
        var x1 = x0 + cw;
        var y1 = y0 + ch;
        var path = [];
        path.push("M ".concat(x0, " ").concat(y0));
        // верхняя грань: у верхнего ряда — ровная, иначе — сопряжённая с hEdges[r-1][c]
        if (r === 0) {
            path.push("L ".concat(x1, " ").concat(y0));
        }
        else {
            var t = hEdges[r - 1][c]; // между (r-1,c) и (r,c)
            // мы идём слева→направо по верхнему ребру текущего куска
            // если сверху был tab (вверх), для текущего должна быть обратная (вниз) ⇒ opposite(t)
            path.push(edgeWithTab(x0, y0, x1, y0, 'top', opposite(t), tabSize, neck));
        }
        // правая грань
        if (c === cols - 1) {
            path.push("L ".concat(x1, " ").concat(y1));
        }
        else {
            var t = vEdges[r][c]; // между (r,c) и (r,c+1)
            // мы идём сверху→вниз по правому ребру текущего куска
            path.push(edgeWithTab(x1, y0, x1, y1, 'right', t, tabSize, neck));
        }
        // нижняя грань
        if (r === rows - 1) {
            path.push("L ".concat(x0, " ").concat(y1));
        }
        else {
            var t = hEdges[r][c]; // между (r,c) и (r+1,c)
            // мы идём справа→влево по нижнему ребру текущего куска
            // у нижнего соседа тип будет t, значит у этого — opposite(t)
            path.push(edgeWithTab(x1, y1, x0, y1, 'bottom', opposite(t), tabSize, neck));
        }
        // левая грань
        if (c === 0) {
            path.push('Z');
        }
        else {
            var t = vEdges[r][c - 1]; // между (r,c-1) и (r,c)
            // мы идём снизу→вверх по левому ребру текущего куска
            path.push(edgeWithTab(x0, y1, x0, y0, 'left', opposite(t), tabSize, neck));
            path.push('Z');
        }
        return path.join(' ');
    }
    var pieces = [];
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            var path = piecePath(r, c);
            var bbox = { x: c * cw, y: r * ch, w: cw, h: ch };
            pieces.push({ id: "".concat(r, "-").concat(c), row: r, col: c, path: path, bbox: bbox });
        }
    }
    return { pieces: pieces, cell: { w: cw, h: ch } };
}

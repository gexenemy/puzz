"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuzzleService = void 0;
// puzzle.service.ts
const common_1 = require("@nestjs/common");
const jigsaw_1 = require("./jigsaw");
const CANVAS_W = 5000;
const CANVAS_H = 5000;
const ROWS = 4;
const COLS = 4;
const SEED = 42;
const JITTER = 600;
let PuzzleService = class PuzzleService {
    createSession(sessionId, imageUrl) {
        const width = CANVAS_W;
        const height = CANVAS_H;
        const rows = ROWS;
        const cols = COLS;
        const stageWidth = width;
        const stageHeight = height + 400;
        const meta = {
            imageUrl, width, height, rows, cols, seed: SEED, stageWidth, stageHeight,
        };
        const { pieces } = (0, jigsaw_1.generateJigsaw)({ width, height, rows, cols, seed: SEED });
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const initial = pieces.map(p => {
            const targetX = p.bbox.x;
            const targetY = p.bbox.y;
            const jx = (Math.random() * 2 - 1) * JITTER;
            const jy = (Math.random() * 2 - 1) * JITTER;
            const currentX = clamp(targetX + jx, 0, width - p.bbox.w);
            const currentY = clamp(targetY + jy, 0, height - p.bbox.h);
            return {
                id: p.id,
                row: p.row,
                col: p.col,
                targetX, targetY,
                rotation: 0,
                currentX, currentY,
                currentRotation: 0,
                placed: false,
                path: p.path,
                clipBBox: { x: p.bbox.x, y: p.bbox.y, w: p.bbox.w, h: p.bbox.h },
            };
        });
        return { meta, pieces: initial };
    }
};
exports.PuzzleService = PuzzleService;
exports.PuzzleService = PuzzleService = __decorate([
    (0, common_1.Injectable)()
], PuzzleService);
//# sourceMappingURL=puzzle.service.js.map
// puzzle.service.ts
import { Injectable } from '@nestjs/common'
import { generateJigsaw } from './jigsaw'
import type { PieceState, PuzzleMeta } from './types'

const CANVAS_W = 5000
const CANVAS_H = 5000
const ROWS = 4
const COLS = 4
const SEED = 42
const JITTER = 600

@Injectable()
export class PuzzleService {
    createSession(sessionId: string, imageUrl: string) {
        const width = CANVAS_W
        const height = CANVAS_H
        const rows = ROWS
        const cols = COLS

        const stageWidth = width
        const stageHeight = height + 400

        const meta: PuzzleMeta = {
            imageUrl, width, height, rows, cols, seed: SEED, stageWidth, stageHeight,
        }

        const { pieces } = generateJigsaw({ width, height, rows, cols, seed: SEED })

        const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

        const initial: PieceState[] = pieces.map(p => {
            const targetX = p.bbox.x
            const targetY = p.bbox.y
            const jx = (Math.random() * 2 - 1) * JITTER
            const jy = (Math.random() * 2 - 1) * JITTER
            const currentX = clamp(targetX + jx, 0, width - p.bbox.w)
            const currentY = clamp(targetY + jy, 0, height - p.bbox.h)
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
            }
        })

        return { meta, pieces: initial }
    }
}

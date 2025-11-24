export type PuzzleMeta = {
    imageUrl: string
    width: number
    height: number
    rows: number
    cols: number
    seed: number
    stageWidth: number
    stageHeight: number
}

export type PieceState = {
    id: string
    row: number
    col: number
    targetX: number
    targetY: number
    rotation: number
    currentX: number
    currentY: number
    currentRotation: number
    placed: boolean
    path: string
    clipBBox: { x: number; y: number; w: number; h: number }
}

export type LockInfo = { by: number; name: string; color: string; ts: number }
export type RemoteCursor = { id: number; x: number; y: number; name: string; color: string }

// Подпись меты — помогает детерминированно сбрасывать комнату при смене параметров
export const makeMetaSig = (m: PuzzleMeta) =>
    `${m.width}x${m.height}|${m.rows}x${m.cols}|seed=${m.seed}`

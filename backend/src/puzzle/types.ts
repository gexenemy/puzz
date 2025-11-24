export type EdgeType = 'flat' | 'tab' | 'blank'


export interface PuzzleMeta {
    imageUrl: string
    width: number
    height: number
    rows: number
    cols: number
    seed: number
    stageWidth: number
    stageHeight: number
}


export interface PieceState {
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
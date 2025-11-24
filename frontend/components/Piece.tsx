import { Group, Image as KonvaImage, Layer, Path, Rect, Text } from 'react-konva'
import { PieceState, LockInfo } from '@/lib/types'

type Props = {
    img: HTMLImageElement
    metaW: number
    metaH: number
    piece: PieceState
    lock: LockInfo | undefined
    isPanning: boolean
    myClientId: number | undefined
    onDragStart: (id: string, target: any, e: any) => void
    onDragMove: (id: string, x: number, y: number, e?: any) => void
    onDragEnd: (id: string, e?: any) => void
}

export default function Piece({
                                  img,
                                  metaW,
                                  metaH,
                                  piece,
                                  lock,
                                  isPanning,
                                  myClientId,
                                  onDragStart,
                                  onDragMove,
                                  onDragEnd,
                              }: Props) {
    const isMine = lock?.by === myClientId
    const isLocked = Boolean(lock)

    // базовая тонкая обводка: зелёная только когда piece.placed
    // когда кто-то тащит — делаем более толстую цветную рамку
    const strokeColor = piece.placed
        ? '#4ade80'
        : isLocked
            ? (lock!.color || '#f59e0b')
            : '#111'

    const strokeWidth = isLocked ? 2 : piece.placed ? 0.75 : 1

    // позиция бейджа (имя того, кто держит)
    const badgeX = -piece.clipBBox.x + piece.clipBBox.w * 0.5
    const badgeY = -piece.clipBBox.y - 18

    return (
        <Layer>
            <Group
                x={Math.round(piece.currentX)}
                y={Math.round(piece.currentY)}
                draggable={!isPanning && (!isLocked || isMine)}
                rotation={piece.currentRotation}
                onDragStart={(e) => onDragStart(piece.id, e.target, e.evt)}
                onDragMove={(e) => onDragMove(piece.id, e.target.x(), e.target.y(), e.evt)}
                onDragEnd={(e) => onDragEnd(piece.id, e.evt)}
            >
                {/* текстура */}
                <KonvaImage
                    image={img}
                    x={-piece.clipBBox.x}
                    y={-piece.clipBBox.y}
                    width={metaW}
                    height={metaH}
                    listening={false}
                />

                {/* маска-обрезка */}
                <Path
                    x={-piece.clipBBox.x}
                    y={-piece.clipBBox.y}
                    data={piece.path}
                    fill="black"
                    globalCompositeOperation="destination-in"
                    listening={false}
                    perfectDrawEnabled={false}
                />

                {/* обводка */}
                <Path
                    x={-piece.clipBBox.x}
                    y={-piece.clipBBox.y}
                    data={piece.path}
                    fillEnabled={false}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    perfectDrawEnabled={false}
                />

                {/* хит-область для drag; отключаем в режиме «руки» */}
                <Path
                    x={-piece.clipBBox.x}
                    y={-piece.clipBBox.y}
                    data={piece.path}
                    fill={isPanning ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.001)'}
                    strokeEnabled={false}
                    listening={!isPanning}
                    perfectDrawEnabled={false}
                />

                {/* бейдж «кто тащит» — показываем только если есть lock */}
                {isLocked && (
                    <Group x={badgeX} y={badgeY} listening={false}>
                        <Rect
                            x={-40}
                            y={-14}
                            width={80}
                            height={18}
                            cornerRadius={9}
                            fill="rgba(255,255,255,0.9)"
                            stroke={lock!.color || '#f59e0b'}
                            strokeWidth={1}
                        />
                        <Text
                            x={-38}
                            y={-12}
                            text={lock!.name || 'User'}
                            fontSize={12}
                            fill={lock!.color || '#111'}
                            align="center"
                            width={76}
                        />
                    </Group>
                )}
            </Group>
        </Layer>
    )
}

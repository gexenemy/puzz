import { Layer, Rect } from 'react-konva'

export default function Pocket({
                                   boardW,
                                   viewH,
                                   boardH,
                               }: {
    boardW: number
    viewH: number
    boardH: number
}) {
    return (
        <Layer listening={false}>
            <Rect
                x={0}
                y={boardH + 8}
                width={boardW}
                height={Math.max(viewH - boardH - 8, 0)}
                stroke="#ddd"
                dash={[4, 4]}
            />
        </Layer>
    )
}

import { Group, Layer, Path, Text } from 'react-konva'
import { RemoteCursor } from '@/lib/types'

export default function CursorLayer({ cursors }: { cursors: RemoteCursor[] }) {
    if (!cursors.length) return null
    return (
        <Layer listening={false}>
            {cursors.map((c) => (
                <Group key={c.id} x={c.x} y={c.y}>
                    <Path data="M 0 0 L 12 24 L 16 16 Z" fill={c.color} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                    <Text x={20} y={8} text={c.name} fontSize={12} fill={c.color} />
                </Group>
            ))}
        </Layer>
    )
}

import { Layer, Image as KonvaImage } from 'react-konva'

export default function BackgroundPreview({
                                              img,
                                              width,
                                              height,
                                          }: {
    img: HTMLImageElement | undefined
    width: number
    height: number
}) {
    if (!img) return null
    return (
        <Layer listening={false}>
            <KonvaImage image={img} x={0} y={0} width={width} height={height} opacity={0.15} />
        </Layer>
    )
}

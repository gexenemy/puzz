import { MAX_SCALE, MIN_SCALE } from '@/lib/constants'

export default function Controls({
                                     setScale,
                                     resetView,
                                 }: {
    setScale: React.Dispatch<React.SetStateAction<number>>
    resetView: () => void
}) {
    return (
        <div style={{
            position: 'absolute', zIndex: 10, right: 12, top: 12, display: 'flex', gap: 8,
            background: 'rgba(255,255,255,0.8)', borderRadius: 8, padding: 6, boxShadow: '0 2px 8px rgba(0,0,0,.15)'
        }}>
            <button onClick={() => setScale((s) => Math.max(MIN_SCALE, s / 1.05))} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }}>−</button>
            <button onClick={() => setScale((s) => Math.min(MAX_SCALE, s * 1.05))} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }}>+</button>
            <button onClick={resetView} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }}>Reset view</button>
            <div style={{ marginLeft: 8, fontSize: 12, opacity: .7 }}>(Hold <b>Space</b> to pan)</div>
        </div>
    )
}

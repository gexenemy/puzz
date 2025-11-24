'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage } from 'react-konva'
import useImage from 'use-image'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import BackgroundPreview from './BackgroundPreview'
import Piece from './Piece'
import CursorLayer from './CursorLayer'
import Pocket from './Pocket'
import Controls from './Controls'

import { useZoomPan } from '@/lib/hooks/useZoomPan'
import { rafThrottle } from '@/lib/helpers/rafThrottle'
import { ROT_SNAP_DEG, SNAP_PX } from '@/lib/constants'
import { LockInfo, PieceState, PuzzleMeta, RemoteCursor, makeMetaSig } from '@/lib/types'
import { randomColor, randomName } from '@/lib/random'

type Props = {
    sessionId: string
    meta: PuzzleMeta
    initialPieces: PieceState[]
}

export default function PuzzleBoard({ sessionId, meta, initialPieces }: Props) {
    const [img] = useImage(meta.imageUrl, 'anonymous')

    const [pieces, setPieces] = useState<PieceState[]>(initialPieces)
    const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([])
    const [locksView, setLocksView] = useState<Map<string, LockInfo>>(new Map())

    // viewport
    const [viewport, setViewport] = useState({ w: 0, h: 0 })
    useEffect(() => {
        const upd = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
        upd()
        window.addEventListener('resize', upd)
        return () => window.removeEventListener('resize', upd)
    }, [])

    // stage + зум/панорамирование
    const stageRef = useRef<any>(null)
    const zp = useZoomPan(stageRef)

    // Yjs
    const docRef = useRef<Y.Doc>()
    const providerRef = useRef<WebsocketProvider>()
    const yPiecesRef = useRef<Y.Array<PieceState>>()
    const yLocksRef = useRef<Y.Map<LockInfo>>()
    const yMetaRef = useRef<Y.Map<any>>()
    const initedRef = useRef(false)

    // local awareness
    const myNameRef = useRef<string>(randomName())
    const myColorRef = useRef<string>(randomColor())

    useEffect(() => {
        const doc = new Y.Doc()
        const yws = process.env.NEXT_PUBLIC_YWS_URL || 'ws://localhost:1234'
        const provider = new WebsocketProvider(yws, `room:${sessionId}`, doc, { connect: true })

        const yPieces = doc.getArray<PieceState>('pieces')
        const yLocks = doc.getMap<LockInfo>('locks')
        const yMeta = doc.getMap<any>('meta')

        docRef.current = doc
        providerRef.current = provider
        yPiecesRef.current = yPieces
        yLocksRef.current = yLocks
        yMetaRef.current = yMeta
        initedRef.current = false

        provider.awareness.setLocalState({ name: myNameRef.current, color: myColorRef.current, x: null, y: null })

        provider.once('sync', () => {
            if (initedRef.current) return
            initedRef.current = true

            const expectedCount = meta.rows * meta.cols
            const currentCount = yPieces.length
            const currentSig = (yMeta.get('sig') as string) || ''
            const newSig = makeMetaSig(meta)
            const mustReset = currentSig !== newSig || currentCount !== expectedCount

            doc.transact(() => {
                if (mustReset) {
                    if (currentCount > 0) yPieces.delete(0, currentCount)
                    initialPieces.forEach(p => yPieces.push([p]))
                    yLocks.clear()
                    yMeta.set('sig', newSig)
                }
            })

            setPieces(yPieces.toArray())
            setLocksView(new Map(Array.from(yLocks.entries()) as any))
        })

        const subPieces = () => setPieces(yPieces.toArray())
        const subLocks = () => setLocksView(new Map(Array.from(yLocks.entries()) as any))
        yPieces.observe(subPieces)
        yLocks.observe(subLocks)

        const onAwarenessChange = () => {
            const states = provider.awareness.getStates()
            const mineId = provider.awareness.clientID
            const live = new Set<number>()
            states.forEach((_st: any, id: number) => live.add(id))

            const remotes: RemoteCursor[] = []
            states.forEach((st: any, id: number) => {
                if (id === mineId || !st || st.x == null || st.y == null) return
                remotes.push({ id, x: st.x, y: st.y, name: st.name ?? 'Guest', color: st.color ?? '#3b82f6' })
            })
            setRemoteCursors(remotes)

            // очистка зависших локов
            const yL = yLocksRef.current; if (!yL) return
            let changed = false
            yL.forEach((lock, pid) => {
                if (!live.has(lock.by)) { docRef.current?.transact(() => yL.delete(pid)); changed = true }
            })
            if (changed) setLocksView(new Map(Array.from(yL.entries()) as any))
        }
        provider.awareness.on('change', onAwarenessChange)

        return () => {
            yPieces.unobserve(subPieces)
            yLocks.unobserve(subLocks)
            provider.awareness.off('change', onAwarenessChange)
            provider.destroy()
            doc.destroy()
        }
    }, [sessionId, initialPieces, meta.width, meta.height, meta.rows, meta.cols, meta.seed])

    // pointer in world
    const pointerToWorld = useCallback(() => {
        const stage = stageRef.current
        if (!stage) return { x: 0, y: 0 }
        const p = stage.getPointerPosition()
        if (!p) return { x: 0, y: 0 }
        const sx = stage.scaleX(), sy = stage.scaleY()
        const tx = stage.x(), ty = stage.y()
        return { x: (p.x - tx) / sx, y: (p.y - ty) / sy }
    }, [])

    const updateMyCursor = rafThrottle(() => {
        const provider = providerRef.current
        if (!provider) return
        const { x, y } = pointerToWorld()
        provider.awareness.setLocalStateField('x', x)
        provider.awareness.setLocalStateField('y', y)
    })

    // yjs helpers
    const myId = () => providerRef.current?.awareness.clientID as number
    const acquireLock = (pieceId: string): boolean => {
        const yLocks = yLocksRef.current, doc = docRef.current
        const ownerId = myId()
        if (!yLocks || !doc || ownerId == null) return false
        const cur = yLocks.get(pieceId); if (cur && cur.by !== ownerId) return false
        const info: LockInfo = { by: ownerId, name: myNameRef.current, color: myColorRef.current, ts: Date.now() }
        doc.transact(() => yLocks.set(pieceId, info))
        return true
    }
    const releaseLock = (pieceId: string) => {
        const yLocks = yLocksRef.current, doc = docRef.current
        if (!yLocks || !doc) return
        const cur = yLocks.get(pieceId); if (cur && cur.by === myId()) doc.transact(() => yLocks.delete(pieceId))
    }
    const isLockedByOther = (pieceId: string) => {
        const cur = locksView.get(pieceId); return cur && cur.by !== myId() ? cur : null
    }

    const updatePieceAt = (idx: number, patch: Partial<PieceState>) => {
        const yPieces = yPiecesRef.current, doc = docRef.current
        if (!yPieces || !doc) return
        const cur = yPieces.get(idx); if (!cur) return
        const next = { ...cur, ...patch }
        doc.transact(() => { yPieces.delete(idx, 1); yPieces.insert(idx, [next]) })
    }

    // drag handlers
    const onDragStart = (id: string, target: any, e: any) => {
        if (zp.isPanning) { try { target.stopDrag() } catch {} ; return }
        const lock = isLockedByOther(id)
        if (lock) {
            try { target.stopDrag(); const x0 = target.x(); target.to({ x: x0 + 6, duration: .06 }); target.to({ x: x0, duration: .06 }) } catch {}
            return
        }
        if (e) e.cancelBubble = true
        acquireLock(id)
        updateMyCursor() // сразу обновим курсор в момент начала перетаскивания
    }
    const onDragMove = rafThrottle((id: string, x: number, y: number, e?: any) => {
        if (zp.isPanning) return
        if (isLockedByOther(id)) return
        const yPieces = yPiecesRef.current
        if (!yPieces) return
        const arr = yPieces.toArray()
        const idx = arr.findIndex(p => p.id === id); if (idx < 0) return
        if (e) e.cancelBubble = true
        updatePieceAt(idx, { currentX: x, currentY: y })
    })
    const onDragEnd = (id: string, e?: any) => {
        if (zp.isPanning) return
        if (isLockedByOther(id)) return
        const yPieces = yPiecesRef.current
        if (!yPieces) return
        const arr = yPieces.toArray()
        const idx = arr.findIndex(p => p.id === id); if (idx < 0) return
        const p = arr[idx]
        const near = Math.hypot(p.currentX - p.targetX, p.currentY - p.targetY)
        const rotOk = Math.abs((p.currentRotation || 0) - 0) <= ROT_SNAP_DEG
        if (near <= SNAP_PX && rotOk) {
            updatePieceAt(idx, {
                currentX: Math.round(p.targetX),
                currentY: Math.round(p.targetY),
                currentRotation: 0,
                placed: true,
            })
        }
        if (e) e.cancelBubble = true
        releaseLock(id)
    }

    if (viewport.w === 0 || viewport.h === 0) return null

    return (
        <div style={{ position: 'fixed', inset: 0, cursor: zp.cursor }}>
            <Controls setScale={zp.setScale} resetView={() => { zp.setScale(1); zp.setStagePos({ x: 0, y: 0 }) }} />

            <Stage
                width={viewport.w}
                height={viewport.h}
                ref={stageRef}
                draggable={zp.draggable}
                x={zp.stagePos.x}
                y={zp.stagePos.y}
                onDragStart={zp.onStageDragStart}
                onDragEnd={zp.onStageDragEnd}
                // ВАЖНО: это заставляет курсор «жить» во время drag
                onDragMove={updateMyCursor}
                scaleX={zp.scale}
                scaleY={zp.scale}
                onMouseMove={updateMyCursor}
                onTouchMove={updateMyCursor}
                onWheel={zp.onWheel}
            >
                <BackgroundPreview img={img as any} width={meta.width} height={meta.height} />

                {img && pieces.map((piece) => (
                    <Piece
                        key={piece.id}
                        img={img as any}
                        metaW={meta.width}
                        metaH={meta.height}
                        piece={piece}
                        lock={locksView.get(piece.id)}
                        isPanning={zp.isPanning}
                        myClientId={providerRef.current?.awareness.clientID as number | undefined}
                        onDragStart={onDragStart}
                        onDragMove={onDragMove}
                        onDragEnd={onDragEnd}
                    />
                ))}

                <CursorLayer cursors={remoteCursors} />
                <Pocket boardW={viewport.w} viewH={viewport.h} boardH={meta.height} />
            </Stage>
        </div>
    )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MAX_SCALE, MIN_SCALE, SCALE_BY } from '@/lib/constants'

export type ZoomPanApi = {
    scale: number
    stagePos: { x: number; y: number }
    setScale: (s: number) => void
    setStagePos: (p: { x: number; y: number }) => void

    isPanning: boolean
    isPanDragging: boolean
    cursor: 'default' | 'grab' | 'grabbing'
    onWheel: (e: any) => void

    // для Stage
    draggable: boolean
    onStageDragStart: (e: any) => void
    onStageDragEnd: (e: any) => void
}

export function useZoomPan(stageRef: React.RefObject<any>): ZoomPanApi {
    const [scale, setScale] = useState(1)
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 })

    const [isPanning, setIsPanning] = useState(false)
    const [isPanDragging, setIsPanDragging] = useState(false)

    // hotkeys (Space)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); setIsPanning(true) }
        }
        const up = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); setIsPanning(false); setIsPanDragging(false) }
        }
        window.addEventListener('keydown', down, { passive: false })
        window.addEventListener('keyup', up, { passive: false })
        return () => { window.removeEventListener('keydown', down as any); window.removeEventListener('keyup', up as any) }
    }, [])

    // wheel zoom around cursor
    const onWheel = useCallback((e: any) => {
        e.evt.preventDefault()
        const stage = stageRef.current
        if (!stage) return

        const oldScale = stage.scaleX()
        const pointer = stage.getPointerPosition()
        if (!pointer) return

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        }

        const dir = e.evt.deltaY > 0 ? 1 : -1
        let newScale = dir > 0 ? oldScale / SCALE_BY : oldScale * SCALE_BY
        newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        }

        setScale(newScale)
        setStagePos(newPos)
    }, [stageRef])

    const onStageDragStart = useCallback((e: any) => {
        if (!isPanning) return
        // важно: реагируем только на перетаскивание самого Stage
        if (e.target !== stageRef.current) return
        setIsPanDragging(true)
    }, [isPanning, stageRef])

    const onStageDragEnd = useCallback((e: any) => {
        if (!isPanning) return
        if (e.target !== stageRef.current) return
        setIsPanDragging(false)
        const st = stageRef.current
        setStagePos({ x: st.x(), y: st.y() })
    }, [isPanning, stageRef])

    const cursor = useMemo<'default' | 'grab' | 'grabbing'>(() => {
        return isPanning ? (isPanDragging ? 'grabbing' : 'grab') : 'default'
    }, [isPanning, isPanDragging])

    return {
        scale, stagePos, setScale, setStagePos,
        isPanning, isPanDragging, cursor,
        onWheel,
        draggable: isPanning,
        onStageDragStart,
        onStageDragEnd,
    }
}

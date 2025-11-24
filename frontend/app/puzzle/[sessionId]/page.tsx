'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { createYDoc } from '@/lib/yjsClient'
import type { PuzzleMeta, PieceState } from '@/lib/types'


const PuzzleBoard = dynamic(() => import('@/components/PuzzleBoard'), { ssr: false })


export default function PuzzlePage({ params:{ sessionId } }:{ params:{ sessionId:string } }) {
    const [meta, setMeta] = useState<PuzzleMeta | null>(null)
    const [initialPieces, setInitialPieces] = useState<PieceState[] | null>(null)


    useEffect(() => {
        (async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'}/puzzle/session/${sessionId}`)
            const data = await res.json()
            setMeta(data.meta)
            setInitialPieces(data.pieces)
        })()
    }, [sessionId])


    if (!meta || !initialPieces) return <div style={{padding:24}}>Загрузка…</div>


    return (
        <div style={{height:'100vh', display:'grid', gridTemplateRows:'auto 1fr'}}>
            <header style={{padding:12, borderBottom:'1px solid #eee', display:'flex', gap:16, alignItems:'center'}}>
                <strong>Комната:</strong> <code>{sessionId}</code>
                <span> | Кусочки: {meta.rows}×{meta.cols}</span>
            </header>
            <PuzzleBoard sessionId={sessionId} meta={meta} initialPieces={initialPieces} />
        </div>
    )
}
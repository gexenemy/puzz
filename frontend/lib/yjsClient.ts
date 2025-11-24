import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'


export function createYDoc(roomId: string) {
    const doc = new Y.Doc()
    const wsUrl = process.env.NEXT_PUBLIC_YWS_URL || 'ws://localhost:1234'
    const provider = new WebsocketProvider(wsUrl, roomId, doc, { connect: true })
    const awareness = provider.awareness
    return { doc, provider, awareness }
}
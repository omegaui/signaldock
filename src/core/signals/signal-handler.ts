
import WebSocket from "ws"
import { handleJoin } from "./method/join"
import { handleExchangeWorkspaceInfo } from "./method/exchange-workspace-info"

export function handleSignal(ws: WebSocket, message: WebSocket.RawData) {
    const data = JSON.parse(message.toString('utf8'))
    const method = data['method']
    if (method === 'join') {
        handleJoin(ws, data)
    } else if (method === 'workspace-info') {
        handleExchangeWorkspaceInfo(ws, data)
    }
}

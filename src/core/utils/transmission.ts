import WebSocket from "ws"
import { sideKickSockets } from "../commands/onactivate";

export function transmission(payload: any) {
    const stringified = JSON.stringify(payload)
    console.log("Transmitting: " + stringified)
    sideKickSockets.forEach((socket) => {
        if (socket.readyState == WebSocket.OPEN) {
            socket.send(stringified)
        }
    })
}

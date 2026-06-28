import * as vscode from 'vscode'
import { getConfiguration, sideKickSockets } from '../../commands/onactivate';
import { SideKickSocket } from "../../../signaldock";

export function handleJoin(ws: SideKickSocket, data: any) {
    const password = getConfiguration().get<string>("bridgePassword")
    if (data['method'] === 'join') {
        if (data['key'] === password || password === '') {
            vscode.window.setStatusBarMessage(
                `A sideKick joined the bridge network`,
                2000
            );
            sideKickSockets.push(ws)
            ws.send(JSON.stringify({
                "method": "join",
                "accepted": "yes"
            }))
        } else {
            ws.close()
        }
    }
}

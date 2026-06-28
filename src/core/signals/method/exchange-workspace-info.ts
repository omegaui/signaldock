import { SideKickSocket } from "../../../signaldock";
import * as vscode from 'vscode'

export function handleExchangeWorkspaceInfo(ws: SideKickSocket, data: any) {
    ws.send(JSON.stringify({
        "method": "workspace-info",
        "workspace": vscode.workspace.name,
        "folders": vscode.workspace.workspaceFolders?.map((e) => e.uri.fsPath),
    }))
}

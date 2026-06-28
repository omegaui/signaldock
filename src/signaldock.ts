import * as vscode from 'vscode';
import { onActivate } from './core/commands/onactivate';
import { onDeactivate } from './core/commands/ondeactivate';
import WebSocket from 'ws'

export interface SideKickSocket extends WebSocket {
    system?: any
}

export async function activate(context: vscode.ExtensionContext) {
    await onActivate(context)
}

export function deactivate() {
    onDeactivate()
}

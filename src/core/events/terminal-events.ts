
import * as vscode from 'vscode'
import { showNotification } from '../utils/desktop-nofication'
import { formatDuration } from '../utils/duration-format'
import { transmission } from '../utils/transmission'
import { getConfiguration } from '../commands/onactivate'

class TerminalExecution {
    id!: string
    workspace!: string
    command!: string
    startedAt!: number
    finishedAt!: number
    timeTook!: number
    exhaustedWaitTime!: boolean
    exitCode!: number
}

const executions: Map<String, TerminalExecution> = new Map()

function createExecutionID(shellProcessID: number, command: string) {
    const workspaceID = vscode.workspace.name
    return `${workspaceID}#${shellProcessID}#${command}`
}

function findExecution(executionID: string): TerminalExecution | undefined {
    return executions.get(executionID);
}

export function initializeTerminalEvents(context: vscode.ExtensionContext) {
    const configuration = getConfiguration()
    const enabled = configuration.get<boolean>('enableTerminalNotifier')
    if (enabled) {
        const threshold = parseInt(configuration.get<Number>('terminalNotifierWaitTime')!.toString());
        vscode.window.onDidStartTerminalShellExecution(async (e) => {
            const shellProcessID = await e.terminal.processId
            const id = createExecutionID(shellProcessID ?? 0, e.execution.commandLine.value)
            const execution = new TerminalExecution()
            execution.id = id
            execution.workspace = vscode.workspace.name ?? "-"
            execution.command = e.execution.commandLine.value
            execution.startedAt = Date.now()
            executions.set(id, execution)
            transmission({
                "method": "notify",
                "event": "terminal",
                "type": "command-execution",
                "command": execution
            })
        })
        vscode.window.onDidEndTerminalShellExecution(async (e) => {
            const shellProcessID = await e.terminal.processId
            const id = createExecutionID(shellProcessID ?? 0, e.execution.commandLine.value)
            const execution = findExecution(id)
            if (execution != null) {
                execution.finishedAt = Date.now()
                execution.timeTook = (execution.finishedAt - execution.startedAt) / 1000
                execution.exhaustedWaitTime = execution.timeTook > threshold
                execution.exitCode = e.exitCode ?? 0
                transmission({
                    "method": "notify",
                    "event": "terminal",
                    "type": "command-execution",
                    "command": execution,
                    "maxWaitTime": threshold,
                })
                if (execution.exhaustedWaitTime) {
                    const enableHostNotifications = configuration.get<boolean>('enableNotificationsOnHost')
                    if (enableHostNotifications) {
                        showNotification(
                            context,
                            `${execution.workspace}: ${execution.command}`,
                            `took: ${formatDuration(execution.timeTook)}, exit code: ${execution.exitCode}`, ""
                        )
                    }
                }
            }
        })
    }
}


import * as dgram from 'dgram'
import * as http from 'http'
import * as os from 'os'
import * as vscode from 'vscode'
import WebSocket, { WebSocketServer } from 'ws'
import { getAvailablePort } from '../utils/ports'
import { initializeTerminalEvents } from '../events/terminal-events'
import 'bonjour'
import bonjour from 'bonjour'
import { AddressInfo } from 'net'
import { handleSignal } from '../signals/signal-handler'


// loading configuration
export function getConfiguration() {
    return vscode.workspace.getConfiguration('signalDock')
}

function isUsablePrivateIPv4(addr: string): boolean {
    if (addr.startsWith('169.254.') || addr.startsWith('127.')) return false
    return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(addr)
}

// Ask the OS which interface it would use to reach the public internet.
// No packet is actually sent (dgram connect just sets routing).
async function getEgressIPv4(): Promise<string | null> {
    return await new Promise<string | null>((resolve) => {
        const sock = dgram.createSocket('udp4')
        const done = (val: string | null) => {
            try { sock.close() } catch { /* ignore */ }
            resolve(val)
        }
        sock.once('error', () => done(null))
        try {
            sock.connect(53, '8.8.8.8', () => {
                try {
                    const addr = sock.address().address
                    done(addr && addr !== '0.0.0.0' ? addr : null)
                } catch {
                    done(null)
                }
            })
        } catch {
            done(null)
        }
    })
}

async function resolveLanIP(): Promise<string> {
    const egress = await getEgressIPv4()
    if (egress && isUsablePrivateIPv4(egress)) return egress
    // Fallback: first usable private IPv4 from interface list.
    const ifaces = os.networkInterfaces()
    for (const list of Object.values(ifaces)) {
        for (const iface of list ?? []) {
            if (iface.family === 'IPv4' && !iface.internal && isUsablePrivateIPv4(iface.address)) {
                return iface.address
            }
        }
    }
    return '127.0.0.1'
}

// server defaults
const bindIP: string = '0.0.0.0'
let advertisedIP: string = '127.0.0.1'
let port: Number = 0
export let httpServer: http.Server
export let webSocketServer: WebSocketServer
export let sideKickSockets: WebSocket[] = []
let systemConnectionCapablity = 'automatically';

async function detectPort() {
    const bridgePortType = getConfiguration().get<String>('bridgePortType')
    let availablePort: Number | null = await getAvailablePort()
    if (bridgePortType === 'Custom') {
        port = getConfiguration().get('bridgePort') || 0
        if (port === 0) {
            if (!availablePort) {
                vscode.window.showInformationMessage("Custom port is not specified and there's no known available port, falling back to system alloted port. If you want to use SideKick, you need to connect via QR Code.")
            } else {
                port = availablePort
                vscode.window.showInformationMessage("Custom port is not specified, falling back to a known port. SideKick can detect it automatically.")
            }
        }
    } else if (bridgePortType === 'System Specified') {
        port = 0
    } else {
        if (!availablePort) {
            port = 0
            vscode.window.showInformationMessage("There's no known available port, falling back to system alloted port. If you want to use SideKick, you need to connect via QR Code.")
        } else {
            port = availablePort
        }
    }
}

async function startBridge() {
    try {
        httpServer = http.createServer()
        webSocketServer = new WebSocketServer({ server: httpServer })
        webSocketServer.on('connection', (ws) => {
            vscode.window.showInformationMessage(
                "Connection request received"
            );
            ws.on('message', (message) => {
                console.log(`Received: ${message}`)
                handleSignal(ws, message)
            })
            ws.send(JSON.stringify({"method": "handshake"}))
        })
        webSocketServer.on('error', () => { })
        httpServer.listen(parseInt(port.toString()), bindIP, () => {
            console.log(httpServer.address())
            console.log(`SignalDock advertising on ${advertisedIP}`)
            const serviceDiscovery = bonjour({ interface: advertisedIP } as any)
            serviceDiscovery.publish({
                name: `SignalDock-tstamp${Date.now()}`,
                type: 'signaldock',
                host: advertisedIP,
                port: port = (httpServer.address() as AddressInfo).port,
            })
            vscode.window.setStatusBarMessage(
                `SignalDock Started: SideKicks can connect ${systemConnectionCapablity}, port: ${port}`,
                3000
            );
        })
    } catch (e) {
        console.error(e)
        vscode.window.showInformationMessage("Failed to start the connection bridge, but this host still can receive events.")
    }
}

export async function onActivate(context: vscode.ExtensionContext) {
    advertisedIP = await resolveLanIP()
    await detectPort()
    await startBridge()
    initializeTerminalEvents(context)
}

# SignalDock

> ⚠️ **Alpha — v0.0.2.** Early preview. The end-to-end loop (VS Code →
> mobile) now works, but the surface area is small and rough edges remain.
> See [Current status](#current-status) for exactly what's wired up.

SignalDock is a developer awareness platform for Visual Studio Code that keeps
you informed about what's happening in your development environment, even when
you're away from your desk.

Unlike traditional terminal notifiers that only report when a command exits,
SignalDock observes your workflow in realtime and surfaces meaningful events
from across your development stack — and delivers them to **SideKick**, an
Android companion app, over your local network.

This release closes the loop: the VS Code extension publishes a discoverable
WebSocket bridge on your LAN, and the SideKick app finds it automatically and
mirrors long-running terminal events to your phone.

## Current status

### Working today

* **Long-running terminal command notifications.** SignalDock watches your
  integrated-terminal shell executions and, when a command runs longer than a
  configurable threshold (default **60 seconds**), sends a native desktop
  notification with the command, its exit code, and how long it took. Short
  commands stay silent.
* **Native OS desktop notifications**, including when VS Code isn't focused.
* **Local-network bridge.** On startup SignalDock opens a WebSocket server,
  selects a well-known port (or one you specify), and advertises itself over
  mDNS/Bonjour as `_signaldock._tcp.` so SideKick can discover it without a QR
  code.
* **Bridge password (optional).** Set `signalDock.bridgePassword` for use on
  untrusted networks. With a password set, automatic discovery is disabled and
  each SideKick must pair once.
* **Live SideKick delivery.** Connected SideKicks receive terminal start/finish
  events as they happen. Long-running commands trigger an Android notification
  on the device.
* **Workspace handshake.** SideKick requests `workspace-info` after joining so
  the phone UI can label which workspace each event came from.

### SideKick (Android companion)

SideKick lives in a separate repository
([`sidekick`](https://github.com/omegaui/sidekick)) and ships:

* Jetpack Compose UI showing connection state, active workspaces, and a live
  feed of terminal executions.
* A foreground `BridgeDetectionService` that keeps NSD discovery running so
  events arrive even when the app is backgrounded.
* Ktor WebSocket client with auto-reconnect for instances it has already seen.
* Android notifications for long-running command completions.
* `minSdk 34`, `targetSdk 37`.

### Not yet functional

* Everything in the [Roadmap](#roadmap) below (Docker, Git, deployments,
  persistent event feed, error analysis, etc.) is planned but **not implemented**
  in 0.0.2.

## Requirements

* Visual Studio Code **1.125.0** or newer.
* A shell that supports VS Code's
  [shell integration](https://code.visualstudio.com/docs/terminal/shell-integration)
  (required for terminal command detection).
* For mobile delivery: an Android **14+** device on the same LAN running
  SideKick.

## Settings

SignalDock contributes the following settings (Settings → Extensions → SignalDock):

| Setting | Default | Description |
| --- | --- | --- |
| `signalDock.enableTerminalNotifier` | `true` | Notify when a long-running terminal command finishes. |
| `signalDock.terminalNotifierWaitTime` | `60` | Only notify when a command takes longer than this many seconds. |
| `signalDock.enableNotificationsOnHost` | `true` | Show notifications on this device (the host running VS Code). |
| `signalDock.bridgePortType` | `Auto (Recommended)` | How the SideKick bridge port is chosen: `Auto (Recommended)`, `System Specified`, or `Custom`. Auto picks a known port so SideKick can connect without scanning a QR code. |
| `signalDock.bridgePort` | `0` | Custom port for the bridge. Used only when `bridgePortType` is set to `Custom`. |
| `signalDock.bridgePassword` | `""` | Optional password for the bridge. Recommended on public Wi-Fi. Setting a password disables automatic discovery — each SideKick must pair via QR code once. Leave empty on private networks. |

## How it works

1. The extension resolves the host's LAN IPv4 address and starts a WebSocket
   server bound to `0.0.0.0`.
2. It publishes a Bonjour/mDNS service of type `signaldock` on the chosen port.
3. SideKick discovers `_signaldock._tcp.` via Android NSD, connects, and the
   two perform a handshake → join → workspace-info exchange.
4. Terminal start/end events are pushed to every connected SideKick. The
   extension and the phone both decide independently whether a command exceeded
   the notification threshold.

## Roadmap

These are the goals SignalDock is working toward. They are **not** part of the
0.0.2 alpha:

* Intelligent build and script completion detection beyond raw exit codes
* Warning and error analysis from terminal output
* Docker and container status monitoring
* Git activity and remote repository change notifications
* Deployment and release workflow tracking
* Persistent event feed and development activity timeline on SideKick
* Rich notifications with contextual information (logs, links, retry actions)
* Pairing flow / QR code for password-protected bridges
* Extensible signal system for custom workflows

## Why SignalDock?

Modern development workflows span far beyond a terminal window. Important events
can originate from build tools, deployment pipelines, containers, version control
systems, and custom scripts. SignalDock's long-term aim is to bring these signals
together into a single stream that follows you — so you can spend less time
waiting for processes to finish and more time on meaningful work.

**Dock every signal from your workflow.**


import notifier from 'node-notifier'
import * as vscode from 'vscode'
import * as path from 'path'

export function showNotification(context: vscode.ExtensionContext, title: string, message: string, subtitle: string) {
    const iconPath = path.join(
        context.extensionPath,
        'resources',
        'vscode.png'
    )
    notifier.notify({
        title: title,
        message: message,
        subtitle: subtitle,
        icon: iconPath
    },
        (err, response, metadata) => {
            console.log('Notification err:', err);
            console.log('Response:', response);
            console.log('Metadata:', metadata);
        });
}

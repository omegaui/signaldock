import { httpServer } from "./onactivate";

export function onDeactivate() {
    httpServer.close()
}

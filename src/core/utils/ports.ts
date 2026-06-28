
export const PORTS = [
  38121,
  38122,
  38123,
  38124,
  38125,
  41234,
  41235,
  41236,
  44567,
  44568,
  44569,
  48123,
  48124,
  51234,
  51235,
  54321,
  54322,
  58123,
  58124,
  61234,
  61235,
  65001,
  65002,
  65003,
];

import net from 'node:net';

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

export async function getAvailablePort(): Promise<number | null> {
  for (const port of PORTS) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

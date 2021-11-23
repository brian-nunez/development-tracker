export default function normalizePort(port: number | string): number | string {
  const PORT = Number.parseInt(`${port}`, 10);

  if (Number.isNaN(PORT)) {
    return port;
  }

  if (PORT >= 0) {
    return PORT;
  }

  throw new Error('Invalid Port');
}

import http, { Server } from 'http';
import _debug from 'debug';
import { Application } from 'express';
import _app from '../app';
import normalizePort from './normalizePort';

const debug = _debug(`${process.env.npm_package_name}:production`);

(async () => {
  const app: Application = await _app();
  const PORT = normalizePort(process.env.PORT || 5000);

  const onListen = () => {
    debug(`Listening on port ${PORT}`);
  };

  const server: Server = http.createServer(app);

  server.listen(PORT, onListen);
})();

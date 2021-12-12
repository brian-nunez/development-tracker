import path from 'path';
import express, { Application } from 'express';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import ms from 'ms';

import createConfig, { ConfigObject } from './utils/createConfig';
import connectDatabase from './utils/connectDatabase';
import notFound from './middleware/notFound';
import * as routes from './routes';
import { buildErrorMessage, ErrorType } from './utils/errorBuilder';

let allowedOrigins = ['bjnunez.com'];

const localOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8080',
];

const app: Application = express();

async function application(config: ConfigObject) {
  const databaseConnection = await connectDatabase();

  const { client }: any = databaseConnection.connections[0];

  const sessionStore = MongoStore.create({
    client,
    collectionName: process.env.MONGO_USER_SESSION_COLLECTION,
  });

  app.set('trust proxy', 1);
  app.use(cors({
    origin(origin, callback) {
      if (process.env.NODE_ENV !== 'production') {
        allowedOrigins = [...allowedOrigins, ...localOrigins];
      }

      if (!origin) return callback(null, true);

      const hasOrigin = allowedOrigins.find((allowedOrigin) => origin.includes(allowedOrigin));
      if (!hasOrigin) {
        const error = buildErrorMessage(ErrorType.INVALID_REQUEST, 'CORS: Origin not allowed');
        return callback(
          new Error(error.error_message.error_message),
          false
        );
      }

      return callback(null, true);
    },
    credentials: true,
    exposedHeaders: ['Content-Type'],
  }));
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    cookie: {
      maxAge: ms('1 day'),
    },
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
  }));
  app.use(compression());
  app.use(express.static(path.join(__dirname, '../public')));
  app.set('config', config);
  app.use('/api/v1', routes.initRoutes());
  app.use(notFound);
}

async function bootstrappedApp(): Promise<Application> {
  const config: ConfigObject = await createConfig();
  await application(config);
  return app;
}

export default bootstrappedApp;

import path from 'path';
import { promisify } from 'util';
import handlers from 'shortstop-handlers';
import confit from 'confit';
import { buildErrorMessage, ErrorType } from './errorBuilder';

export type ConfigObject = {
  name: string,
  allowLocalOrigins: boolean,
};

const ENV_SET = new Set(['local', 'staging', 'production']);
const DEFAULT_ENV = 'production';

export default function createConfig(): Promise<ConfigObject> {
  const { ENV } = process.env;

  if (!ENV_SET.has(ENV)) {
    const error = buildErrorMessage(
      ErrorType.INTERNAL_SERVER_ERROR, `ENV was set to ${ENV}! It can only be one of ${[...ENV_SET]}`
    );
    return Promise.reject(new Error(error.error_message.error_message));
  }
  const options = {
    basedir: path.join(process.cwd(), '/config'),
    protocols: {
      file: handlers.file(path.join(process.cwd(), '/config')),
      require: handlers.require(path.join(process.cwd(), '/config')),
    },
  };

  const config = confit(options);
  config.addDefault(`${process.cwd()}/config/${DEFAULT_ENV}.json`);
  config.addOverride(`${process.cwd()}/config/${ENV}.json`);

  return promisify(config.create).call(config);
}

import { Config } from './config';

export type ServerConfigProperties = {
  port: string;
};

const CONFIG_NAME = 'server';
export class ServerConfig {
  private env: ServerConfigProperties = {
    port: process.env.RUN_JAMAICA_PORT,
  };

  config: Config<ServerConfigProperties> = new Config<ServerConfigProperties>(
    CONFIG_NAME,
    this.env,
  );
}

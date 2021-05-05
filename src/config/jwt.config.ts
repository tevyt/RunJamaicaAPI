import { Config } from './config';

export type JwtConfigProperties = {
  accessTokenExpiresIn?: string;
  refreshTokenExpiresIn?: string;
  accessTokenSecret?: string;
  refreshTokenSecret?: string;
};

const CONFIG_NAME = 'jwt';
export class JwtConfig {
  private env: { [k in keyof JwtConfigProperties]: string | undefined } = {
    accessTokenExpiresIn: process.env.RUN_JAMAICA_ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.RUN_JAMAICA_REFRESH_TOKEN_EXPIRES_IN,
    accessTokenSecret: process.env.RUN_JAMAICA_ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.RUN_JAMAICA_REFRESH_TOKEN_SECRET,
  };

  config: Config<JwtConfigProperties> = new Config<JwtConfigProperties>(
    CONFIG_NAME,
    this.env,
  );
}

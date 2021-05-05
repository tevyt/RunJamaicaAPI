import * as config from 'config';

export class Config<T> {
  mapping: T = <T>{};

  constructor(configName: string, env?: T) {
    const properties = config.get<T>(configName);
    Object.keys(properties).forEach((key) => {
      this.mapping[key] = env?.[key] || properties[key];
    });
  }
}

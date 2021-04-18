import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as config from 'config';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger: Logger = new Logger('bootstrap');

  const serverConfig = config.get('server');
  const port = process.env.PORT || serverConfig.port;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  logger.log(`Application start on ${port}.`);
}
bootstrap();

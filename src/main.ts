import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ServerConfig } from './config/server.config';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger: Logger = new Logger('bootstrap');

  const {
    config: {
      mapping: { port },
    },
  } = new ServerConfig();

  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Run Jamaica Web Service')
    .setDescription('Services supporting Run Jamaica Mobile Application.')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);

  logger.log(`Application start on ${port}.`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { CustomExceptionFilter } from './lib/utils/exceptionFilter';
import { initializeTransactionalContext } from 'typeorm-transactional';
import * as cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import * as csurf from 'csurf';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);

  // global filter
  app.useGlobalFilters(new CustomExceptionFilter());

  // app.use(helmet());
  // app.use(csurf());

  // swagger setting
  const config = new DocumentBuilder()
    .setTitle('WeatherBly')
    .setDescription('WeatherBly API Description')
    .setVersion('3.0')
    .addBearerAuth(
      {
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        name: 'JWT',
        bearerFormat: 'JWT',
      },
      'authorization',
    )
    .build();

  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, swaggerCustomOptions);

  app.use(cookieParser('dd'));
  try {
    await app.listen(3000);
  } catch (err) {
    console.log(err);
  }
}
bootstrap();

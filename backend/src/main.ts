import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { jwtCheck } from './auth/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(jwtCheck);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

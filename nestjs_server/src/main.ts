import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // DTO 에 적용되지 않은 프로퍼티 삭제
      whitelist: true,
      // 적용되지 않은 프로퍼티가 들어가면 에러발생
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();

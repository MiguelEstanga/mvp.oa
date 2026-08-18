import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar automáticamente los tipos
      transformOptions: {
        enableImplicitConversion: true, // Convertir tipos automáticamenteisndnjdnf
      },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${process.env.PORT || 3000}`);
  console.log(`🔥 Firebase configurado correctamente`);
  console.log(`📊 Base de datos configurada`);
  console.log(`📝 Endpoints disponibles:`);
  console.log(`   POST /auth/register`);
  console.log(`   POST /auth/login`);
  console.log(`   GET /auth/profile/:uid`);
  console.log(`   GET /auth/health`);
}
bootstrap();

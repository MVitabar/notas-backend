// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  
  // Enable CORS with proper headers
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });

  // Handle OPTIONS method for preflight requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', frontendUrl);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Add request logging middleware
  app.use((req, res, next) => {
    const { method, originalUrl, headers } = req;
    logger.debug(`[${new Date().toISOString()}] ${method} ${originalUrl}`);
    logger.debug(`Headers: ${JSON.stringify(headers, null, 2)}`);
    next();
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Add request logging middleware
  app.use((req, res, next) => {
    const { method, originalUrl, headers } = req;
    logger.debug(`[${new Date().toISOString()}] ${method} ${originalUrl}`);
    logger.debug(`Headers: ${JSON.stringify(headers, null, 2)}`);
    next();
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`CORS enabled for: ${frontendUrl}`);
  logger.log('Available routes:');
  logger.log('- POST   /auth/register');
  logger.log('- POST   /auth/login');
  logger.log('- GET    /auth/verify (requires JWT token)');
  logger.log('- GET    /auth/me (requires JWT token)');
  logger.log('- POST   /calificaciones (requires JWT token, DOCENTE role)');
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
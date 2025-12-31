import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MateriasModule } from '../materias/materias.module';
import { CalificacionesModule } from '../calificaciones/calificaciones.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    forwardRef(() => MateriasModule),
    forwardRef(() => CalificacionesModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '24h' as any, // Force type to any to bypass the type checking
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'JWT_SECRET',
      useFactory: (configService: ConfigService) => 
        configService.get<string>('JWT_SECRET') || 'your-secret-key',
      inject: [ConfigService],
    },
  ],
  controllers: [AuthController],
  exports: [
    AuthService, 
    JwtModule, 
    PassportModule,
  ],
})
export class AuthModule {}

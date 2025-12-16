import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
      passReqToCallback: true, // Add this to access the request in validate
    });
  }

  async validate(req: Request, payload: any) {
    this.logger.debug('Validating JWT payload:', JSON.stringify(payload));

    // Check if token exists and is valid
    if (!payload || !payload.sub) {
      this.logger.error('Invalid token payload');
      throw new UnauthorizedException('Invalid token');
    }

    // Return the user object that will be attached to the request
    return { 
      userId: payload.sub, // Changed from 'id' to 'userId' to match AuthController's expectation
      email: payload.email, 
      rol: payload.rol,
      requiresPasswordChange: payload.requiresPasswordChange || false 
    };
  }
}

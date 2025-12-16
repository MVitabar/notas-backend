import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No se proporcionó un token de autenticación');
    }

    try {
      // Verify the token
      const payload = await this.jwtService.verify(token);
      
      // Get the user to check if password change is required
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { 
          requiresPasswordChange: true,
          activo: true
        }
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (!user.activo) {
        throw new UnauthorizedException('Su cuenta está desactivada');
      }

      // If password change is required and the current route is not the change password route
      const isChangePasswordRoute = request.url.includes('/auth/change-password');
      if (user.requiresPasswordChange && !isChangePasswordRoute) {
        throw new UnauthorizedException({
          statusCode: 403,
          message: 'Se requiere cambio de contraseña',
          requiresPasswordChange: true
        });
      }

      // Attach the user to the request object
      request.user = payload;
      return true;
    } catch (error) {
      // If it's our custom unauthorized error, rethrow it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // For other errors (like JWT errors), return a generic unauthorized error
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

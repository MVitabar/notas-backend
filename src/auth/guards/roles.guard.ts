import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!requiredRoles) {
      this.logger.debug('No roles required, access granted');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error('No token provided');
      throw new ForbiddenException('No se proporcionó un token de autenticación');
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
      // Decodificar el token sin verificar la firma (ya que ya fue verificada por el JwtAuthGuard)
      decodedToken = this.jwtService.decode(token);
      this.logger.debug(`Decoded token: ${JSON.stringify(decodedToken)}`);
    } catch (error) {
      this.logger.error('Error decoding token', error);
      throw new ForbiddenException('Token inválido');
    }

    if (!decodedToken) {
      this.logger.error('Empty decoded token');
      throw new ForbiddenException('Token inválido');
    }

    // Extraer el rol del token decodificado (puede estar en 'rol' o 'role')
    const userRole = decodedToken.rol || decodedToken.role;

    if (!userRole) {
      this.logger.error('No role found in token');
      throw new ForbiddenException('No se encontró el rol en el token de autenticación');
    }

    this.logger.debug(`User role from token: ${userRole}, Required roles: ${requiredRoles.join(', ')}`);

    // Case-insensitive role comparison
    const hasRole = requiredRoles.some(role => 
      role.toString().toUpperCase() === userRole.toString().toUpperCase()
    );
    
    if (!hasRole) {
      const errorMsg = `Acceso denegado. Rol del usuario: ${userRole}, Roles requeridos: ${requiredRoles.join(', ')}`;
      this.logger.error(errorMsg);
      throw new ForbiddenException(errorMsg);
    }

    // Añadir el rol al objeto de usuario para su uso posterior si es necesario
    if (!request.user) {
      request.user = {};
    }
    request.user.rol = userRole;

    return true;

    // Original role check (commented out for now)
    /*
    const hasRole = requiredRoles.some((role) => user.rol === role);
    
    if (!hasRole) {
      const errorMsg = `Access denied. User role: ${user.rol}, Required roles: ${requiredRoles.join(', ')}`;
      this.logger.error(errorMsg);
      throw new ForbiddenException(errorMsg);
    }

    return true;
    */
  }
}

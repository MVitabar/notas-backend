// src/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Req, 
  Request as NestRequest,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  HttpCode,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import type { AuthRequest } from './interfaces/auth-request.interface';
import { Public } from './decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { RegisterTeacherDto } from '../types/teacher.types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(@Body() body: any) {
    try {
      // Map the request body to our DTO, forcing role to be ADMIN
      const registerDto: RegisterDto = {
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        rol: 'ADMIN'  // Force role to be ADMIN for all registrations
      };
      
      console.log('Registering new admin user:', { email: body.email });

      // Register the user
      const user = await this.authService.register(registerDto);
      
      // Generate JWT token
      const payload = { 
        sub: user.id, 
        email: user.email, 
        rol: user.rol, 
        requiresPasswordChange: user.requiresPasswordChange 
      };
      
      const token = this.jwtService.sign(payload);
      
      // Return the user data and token
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            requiresPasswordChange: user.requiresPasswordChange
          },
          token
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  @Post('register/teacher')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  async registerTeacher(@Body() registerTeacherDto: RegisterTeacherDto) {
    return this.authService.registerTeacher(registerTeacherDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthRequest): Promise<any> {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthRequest,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    try {
      return await this.authService.changePassword(req.user.userId, changePasswordDto);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al cambiar la contraseña');
    }
  }

  @Get('check-password-change')
  @UseGuards(JwtAuthGuard)
  async checkPasswordChange(@Req() req: AuthRequest): Promise<any> {
    try {
      return await this.authService.checkPasswordChange(req.user.userId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error al verificar el estado de la contraseña');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AuthRequest): Promise<{ success: boolean; data: any }> {
    try {
      // Log the entire user object for debugging
      this.logger.verbose('Request user object:', JSON.stringify(req.user, null, 2));
      
      // Check if userId is available
      if (!req.user?.userId) {
        this.logger.error('User ID is missing in the request');
        throw new UnauthorizedException('User ID is missing in the token');
      }

      // Get the user by ID from the JWT token
      const user = await this.authService.getMe(req.user.userId);
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      this.logger.error(`Error in /auth/me: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener información del usuario');
    }
  }

  @Get('teachers')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async getTeachers() {
    try {
      const teachers = await this.authService.getTeachers();
      return {
        success: true,
        data: teachers
      };
    } catch (error) {
      console.error('Error al obtener la lista de docentes:', error);
      throw new InternalServerErrorException('Error al obtener la lista de docentes');
    }
  }
}
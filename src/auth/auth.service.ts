import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  BadRequestException, 
  InternalServerErrorException,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma, User, UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MateriasService } from '../materias/materias.service';
import { 
  UserWithoutPassword, 
  TeacherProfile, 
  RegisterTeacherDto 
} from '../types/teacher.types';

type UserWithTeacherProfile = Prisma.UserGetPayload<{
  include: {
    perfilDocente: true;
    materias: {
      include: {
        materia: true;
      };
    };
  };
}>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private materiasService: MateriasService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.debug(`Validating user with email: ${email}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          nombre: true,
          rol: true,
          activo: true,
          requiresPasswordChange: true
        }
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        this.logger.warn(`Invalid credentials for user: ${email}`);
        return null;
      }

      // Don't include password in the result
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validating user ${email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateUserByEmail(email: string): Promise<any> {
    this.logger.debug(`Validating user by email: ${email}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          activo: true
        }
      });
      
      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        return null;
      }
      
      this.logger.debug(`User validated successfully: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Error validating user by email ${email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(user: { 
    id: string; 
    email: string; 
    rol: UserRole; 
    requiresPasswordChange: boolean;
    nombre: string;
  }) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      rol: user.rol,
      requiresPasswordChange: user.requiresPasswordChange
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        requiresPasswordChange: user.requiresPasswordChange
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, userId: payload.sub };
    } catch (error) {
      return { valid: false };
    }
  }

  async register(
    registerDto: RegisterDto & { 
      role?: UserRole;
      password: string;
    }
  ): Promise<UserWithoutPassword> {
    try {
      console.log('Registering user with data:', JSON.stringify(registerDto, null, 2));
      
      // Validate required fields
      if (!registerDto.nombre || !registerDto.email || !registerDto.password) {
        throw new BadRequestException('Nombre, email y contraseña son campos obligatorios');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerDto.email)) {
        throw new BadRequestException('El formato del correo electrónico no es válido');
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      // Split the full name into first and last names
      const nameParts = registerDto.nombre.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Normalize role to uppercase and ensure it's a valid UserRole
      let role: UserRole = UserRole.USUARIO; // Default role
      if (registerDto.rol) {
        const normalizedRole = registerDto.rol.toUpperCase();
        if (Object.values(UserRole).includes(normalizedRole as UserRole)) {
          role = normalizedRole as UserRole;
        } else {
          console.warn(`Invalid role '${registerDto.rol}' provided, defaulting to USUARIO`);
        }
      }

      // Prepare base user data
      const userData: Prisma.UserCreateInput = {
        email: registerDto.email.toLowerCase().trim(),
        password: hashedPassword,
        nombre: firstName,
        apellido: lastName,
        telefono: registerDto.phone?.trim(),
        direccion: registerDto.address?.trim(),
        fechaNacimiento: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : undefined,
        dni: registerDto.nationalId,
        rol: role,
        activo: registerDto.status !== 'inactive',
        requiresPasswordChange: true, // Force password change on first login
      };
      
      console.log('Creating user with data:', JSON.stringify(userData, null, 2));

      // Add teacher profile if role is 'DOCENTE'
      if (registerDto.rol === UserRole.DOCENTE) {
        userData.perfilDocente = {
          create: {
            contactoEmergencia: registerDto.emergencyContact || null,
            telefonoEmergencia: registerDto.emergencyPhone || null,
            grados: Array.isArray(registerDto.grades) ? registerDto.grades : [],
            status: registerDto.status || 'active',
          }
        };
      }

      // Create the user with the teacher profile
      const newUser = await this.prisma.user.create({
        data: userData,
        include: {
          perfilDocente: true,
          materias: {
            include: {
              materia: true,
            },
          },
        },
      }) as unknown as UserWithTeacherProfile;

      // Remove password from the returned object
      const { password, ...result } = newUser;
      console.log('User registered successfully:', JSON.stringify(result, null, 2));
      return result as UserWithoutPassword;
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error.meta);
      }
      // Re-throw the error if it's already a known exception
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al registrar el usuario: ${error.message}`);
    }
  }

  async registerTeacher(registerTeacherDto: RegisterTeacherDto): Promise<UserWithoutPassword> {
    try {
      console.log('Registering teacher with data:', JSON.stringify(registerTeacherDto, null, 2));
      
      // Validate required fields
      if (!registerTeacherDto.nombre || !registerTeacherDto.apellido || 
          !registerTeacherDto.email || !registerTeacherDto.password) {
        throw new BadRequestException('Nombre, apellido, email y contraseña son campos obligatorios');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerTeacherDto.email)) {
        throw new BadRequestException('El formato del correo electrónico no es válido');
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerTeacherDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(registerTeacherDto.password, 10);

      // Prepare user data
      const userData: Prisma.UserCreateInput = {
        email: registerTeacherDto.email.toLowerCase().trim(),
        password: hashedPassword,
        nombre: registerTeacherDto.nombre.trim(),
        apellido: registerTeacherDto.apellido.trim(),
        telefono: registerTeacherDto.telefono?.trim(),
        direccion: registerTeacherDto.direccion,
        fechaNacimiento: registerTeacherDto.fechaNacimiento ? 
          new Date(registerTeacherDto.fechaNacimiento) : undefined,
        dni: registerTeacherDto.dni,
        rol: UserRole.DOCENTE,
        activo: registerTeacherDto.activo ?? true,
        requiresPasswordChange: registerTeacherDto.requiresPasswordChange ?? true,
        perfilDocente: {
          create: {
            contactoEmergencia: registerTeacherDto.contactoEmergencia || null,
            telefonoEmergencia: registerTeacherDto.telefonoEmergencia || null,
            grados: registerTeacherDto.grados || [],
            status: (registerTeacherDto.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
          }
        }
      };

      console.log('Creating teacher with data:', JSON.stringify(userData, null, 2));

      // Create the user with teacher profile
      const newUser = await this.prisma.user.create({
        data: userData,
        include: {
          perfilDocente: true,
          materias: {
            include: {
              materia: true,
            },
          },
        },
      }) as unknown as UserWithTeacherProfile;

      // Assign subjects if provided
      const materiasNombres = registerTeacherDto.materias || [];
      if (materiasNombres.length > 0) {
        // Find existing subjects
        const existingSubjects = await this.prisma.materia.findMany({
          where: {
            nombre: { in: materiasNombres }
          }
        });

        // Find which subjects need to be created
        const existingNames = new Set(existingSubjects.map(s => s.nombre));
        const newSubjects = materiasNombres
          .filter(name => !existingNames.has(name))
          .map(nombre => ({
            nombre, 
            codigo: `MAT-${nombre.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-4)}`,
            creditos: 1, 
            activa: true,
            descripcion: `Materia de ${nombre}`,
            // Don't include tipoMateria here as it's optional
          }));

        // Create new subjects one by one to handle potential validation errors
        for (const subject of newSubjects) {
          try {
            await this.prisma.materia.create({
              data: subject,
            });
          } catch (error) {
            console.error(`Error creating subject ${subject.nombre}:`, error);
            // Continue with other subjects even if one fails
          }
        }

        // Get all subjects (existing + new)
        const allSubjects = await this.prisma.materia.findMany({
          where: { 
            nombre: { in: materiasNombres } 
          }
        });

        // Create relationships for all subjects
        if (allSubjects.length > 0) {
          // Try to get the current academic period
          let currentPeriod = await this.prisma.periodoAcademico.findFirst({
            where: { isCurrent: true }
          });

          // If no current period exists, create a default one
          if (!currentPeriod) {
            this.logger.log('No active academic period found. Creating a default period...');
            currentPeriod = await this.prisma.periodoAcademico.create({
              data: { 
                name: 'Período Inicial',
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                isCurrent: true,
                description: 'Período creado automáticamente para asignaciones iniciales',
                status: 'active'
              }
            });
            this.logger.log(`Created default academic period: ${currentPeriod.name} (ID: ${currentPeriod.id})`);
          }

          // Create subject relationships with the period
          const subjectRelationships = allSubjects.map(materia => ({
            docenteId: newUser.id,
            materiaId: materia.id,
            seccion: 'A', // Default section
            horario: 'Por definir',
            periodo: currentPeriod.name,
            estado: 'activo',
            periodoAcademicoId: currentPeriod.id
          }));

          await this.prisma.userMateria.createMany({
            data: subjectRelationships,
            skipDuplicates: true
          });

          this.logger.log(`Assigned ${subjectRelationships.length} subjects to teacher ${newUser.email}`);
        }
      }

      // Get the updated user with relations
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: newUser.id },
        include: {
          perfilDocente: true,
          materias: {
            include: {
              materia: true,
            },
          },
        },
      });

      if (!updatedUser) {
        throw new InternalServerErrorException('Error al crear el usuario');
      }

      // Transform the response
      const { password, ...result } = updatedUser;
      const perfilDocente = result.perfilDocente ? {
        ...result.perfilDocente,
        materias: updatedUser.materias?.map(um => um.materiaId) || [],
      } : null;

      return {
        ...result,
        perfilDocente,
      } as UserWithoutPassword;

    } catch (error) {
      console.error('Error al registrar el docente:', error);
      if (error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al registrar el docente');
    }
  }

  async getProfile(userId: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        perfilDocente: true,
        materias: {
          include: {
            materia: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Transformar las materias al formato esperado
    const perfilDocente = user.perfilDocente ? {
      ...user.perfilDocente,
      status: (user.perfilDocente.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
      materias: user.materias?.map(um => um.materiaId) || [],
      grados: user.perfilDocente.grados || [], // Ensure grados is always an array
    } : null;

    // Eliminar la contraseña
    const { password, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      perfilDocente,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // For first-time login, we don't check the current password
    if (!user.requiresPasswordChange) {
      const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        requiresPasswordChange: false,
      }
    });

    return { success: true };
  }

  async checkPasswordChange(userId: string): Promise<{ requiresPasswordChange: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { requiresPasswordChange: true }
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return { requiresPasswordChange: user.requiresPasswordChange };
  }

  async getMe(userId: string) {
    try {
      this.logger.verbose(`=== START: getMe for userId: ${userId} ===`);
      
      if (!userId) {
        this.logger.error('No userId provided to getMe');
        throw new BadRequestException('User ID is required');
      }
      
      // Get user with relations
      this.logger.verbose(`Fetching user with ID: ${userId}`);
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          perfilDocente: true,
          materias: {
            where: { estado: 'activo' },
            include: {
              materia: {
                include: {
                  tipoMateria: true,
                },
              },
              periodoAcademico: true,
            },
          },
        },
      });
      if (!user) {
        this.logger.error(`User not found with ID: ${userId}`);
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Log user data
      this.logger.verbose('User found:', {
        id: user.id,
        email: user.email,
        hasPerfilDocente: !!user.perfilDocente,
        perfilDocenteId: user.perfilDocente?.id
      });
    // Get raw grados from database
    this.logger.verbose('Executing raw SQL query to get grados...');
    const rawGrados = await this.prisma.$queryRaw`
      SELECT "grados" FROM "TeacherProfile" WHERE "userId" = ${userId};
    `;
    // Log raw database result
    console.log('=== RAW GRADOS FROM DB ===');
    console.log(JSON.stringify(rawGrados, null, 2));
    
    this.logger.error('=== RAW GRADOS FROM DB ===');
    this.logger.error(JSON.stringify(rawGrados, null, 2));
    // Log perfilDocente details
    console.log('=== PERFIL DOCENTE ===');
    console.log('Has perfilDocente:', !!user.perfilDocente);
    console.log('perfilDocente:', JSON.stringify(user.perfilDocente, null, 2));
    
    this.logger.error('=== PERFIL DOCENTE ===');
    this.logger.error(`Has perfilDocente: ${!!user.perfilDocente}`);
    this.logger.error(JSON.stringify(user.perfilDocente, null, 2));
    // Parse grados
    const parseGrados = (grados: any): string[] => {
      if (!grados) {
        this.logger.warn('No grados found, returning empty array');
        return [];
      }
      try {
        // If it's already an array, return it
        if (Array.isArray(grados)) {
          this.logger.verbose('Grados is already an array');
          return grados;
        }
        // If it's a string, try to parse it
        if (typeof grados === 'string') {
          this.logger.verbose('Grados is a string, attempting to parse');
          try {
            // Handle the case where it's a JSON string
            if (grados.startsWith('{') || grados.startsWith('[')) {
              const parsed = JSON.parse(grados);
              this.logger.verbose('Successfully parsed JSON string');
              return Array.isArray(parsed) ? parsed : [parsed];
            }
            // Handle the case where it's a plain string
            this.logger.verbose('Grados is a plain string, wrapping in array');
            return [grados];
          } catch (e) {
            this.logger.error('Error parsing grados as JSON:', e);
            return [grados]; // Return as is if parsing fails
          }
        }
        // If it's an object, return its values
        if (typeof grados === 'object') {
          this.logger.verbose('Grados is an object, returning values');
          return Object.values(grados).map(String);
        }
        this.logger.warn(`Unexpected grados type: ${typeof grados}, value:`, grados);
        return [String(grados)];
      } catch (error) {
        this.logger.error('Unexpected error in parseGrados:', error);
        return [];
      }
    };
    // Prepare response
    const response = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      perfilDocente: user.perfilDocente ? {
        ...user.perfilDocente,
        grados: parseGrados(user.perfilDocente.grados)
      } : null,
      materias: user.materias,
    };
    // Log final response
    this.logger.verbose('=== FINAL RESPONSE ===');
    this.logger.verbose(JSON.stringify(response, null, 2));
    console.log('=== FINAL RESPONSE ===');
    console.log(JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    this.logger.error('Error in getMe:', error);
    throw error;
  } finally {
    this.logger.verbose(`=== END: getMe for userId: ${userId} ===`);
  }
}

  async getTeachers(): Promise<any[]> {
    try {
      const teachers = await this.prisma.user.findMany({
        where: {
          rol: 'DOCENTE',
        },
        include: {
          perfilDocente: {
            select: {
              grados: true
            }
          },
          materias: {
            include: {
              materia: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: {
          apellido: 'asc',
        },
      });

      return teachers.map(teacher => ({
        id: teacher.id,
        nombre: teacher.nombre,
        apellido: teacher.apellido,
        email: teacher.email,
        telefono: teacher.telefono,
        activo: teacher.activo,
        materias: teacher.materias.map(m => ({
          id: m.materia.id,
          nombre: m.materia.nombre
        })),
        grados: teacher.perfilDocente?.grados || []
      }));
    } catch (error) {
      console.error('Error al obtener la lista de docentes:', error);
      throw new InternalServerErrorException('Error al obtener la lista de docentes');
    }
  }
}

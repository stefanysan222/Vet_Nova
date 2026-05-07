import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { PrismaService } from '../prisma/prisma.service';
  
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  
  import * as bcrypt from 'bcrypt';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
    ) {}
  
    // REGISTER
    async register(dto: RegisterDto) {
      const existe = await this.prisma.usuarios.findUnique({
        where: {
          email: dto.email,
        },
      });
  
      if (existe) {
        throw new BadRequestException('El email ya existe');
      }
  
      const hashedPassword = await bcrypt.hash(dto.password, 10);
  
      const usuario = await this.prisma.usuarios.create({
        data: {
          nombre: dto.nombre,
          email: dto.email,
          password: hashedPassword,
          rol: dto.rol,
        },
      });
  
      return {
        message: 'Usuario creado',
        usuario,
      };
    }
  
    // LOGIN
    async login(dto: LoginDto) {
      const usuario = await this.prisma.usuarios.findUnique({
        where: {
          email: dto.email,
        },
      });
  
      if (!usuario) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
  
      const passwordValida = await bcrypt.compare(
        dto.password,
        usuario.password,
      );
  
      if (!passwordValida) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
  
      const payload = {
        sub: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.rol,
      };
  
      const token = await this.jwtService.signAsync(payload);
  
      return {
        access_token: token,
        usuario,
      };
    }
  }
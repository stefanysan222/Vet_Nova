import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // REGISTER
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'El email ya existe',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // LOGIN
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
  })
  
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
  })
  
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
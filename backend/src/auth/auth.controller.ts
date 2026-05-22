import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  // REGISTER
  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
  })

  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente',
  })

  @ApiResponse({
    status: 400,
    description: 'Ya existe un usuario con este correo',
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
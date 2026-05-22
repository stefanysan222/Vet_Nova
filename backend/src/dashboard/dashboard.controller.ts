// src/dashboard/dashboard.controller.ts

import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
    'CLIENTE',
  )
  @ApiOperation({
    summary: 'Obtener dashboard según rol',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard cargado correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado',
  })
  async getDashboard(
    @Request()
    req: {
      user: {
        rol: string;
        sub: string;
      };
    },
  ) {
    return await this.dashboardService.getDashboard(
      req.user,
    );
  }
}
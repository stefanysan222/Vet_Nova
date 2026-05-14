import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
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

  getDashboard(@Request() req) {
    return this.dashboardService.getDashboard(req.user);
  }
}
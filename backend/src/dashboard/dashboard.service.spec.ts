// src/dashboard/dashboard.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    mascotas: {
      count: jest.fn(),
    },
    propietarios: {
      count: jest.fn(),
    },
    citas: {
      count: jest.fn(),
    },
    usuarios: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          DashboardService,
          {
            provide: PrismaService,
            useValue: mockPrisma,
          },
        ],
      }).compile();

    service = module.get<DashboardService>(
      DashboardService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return admin dashboard data', async () => {
    mockPrisma.mascotas.count.mockResolvedValue(10);
    mockPrisma.propietarios.count.mockResolvedValue(5);

    mockPrisma.citas.count
      .mockResolvedValueOnce(20) // totalCitas
      .mockResolvedValueOnce(8) // citasPendientes
      .mockResolvedValueOnce(3); // citasHoy

    mockPrisma.usuarios.count.mockResolvedValue(12);

    const result = await service.getDashboard({
      rol: 'ADMIN',
      sub: '1',
    });

    expect(result).toEqual({
      totalMascotas: 10,
      totalPropietarios: 5,
      totalCitas: 20,
      citasPendientes: 8,
      usuarios: 12,
      citasHoy: 3,
    });
  });

  it('should return veterinarian dashboard data', async () => {
    mockPrisma.citas.count
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(2);

    const result = await service.getDashboard({
      rol: 'VETERINARIO',
      sub: '1',
    });

    expect(result).toEqual({
      misCitas: 6,
      citasPendientes: 2,
    });
  });

  it('should return client dashboard data', async () => {
    mockPrisma.mascotas.count.mockResolvedValue(2);

    mockPrisma.citas.count.mockResolvedValue(4);

    const result = await service.getDashboard({
      rol: 'CLIENTE',
      sub: '1',
    });

    expect(result).toEqual({
      misMascotas: 2,
      misCitas: 4,
    });
  });
});
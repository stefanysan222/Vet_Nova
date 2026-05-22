// src/dashboard/dashboard.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockDashboardService = {
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [DashboardController],
        providers: [
          {
            provide: DashboardService,
            useValue: mockDashboardService,
          },
        ],
      }).compile();

    controller = module.get<DashboardController>(
      DashboardController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getDashboard', async () => {
    const mockUser = {
      rol: 'ADMIN',
      sub: '1',
    };

    const mockResponse = {
      totalMascotas: 10,
      totalPropietarios: 5,
    };

    mockDashboardService.getDashboard.mockResolvedValue(
      mockResponse,
    );

    const result = await controller.getDashboard({
      user: mockUser,
    });

    expect(
      mockDashboardService.getDashboard,
    ).toHaveBeenCalledWith(mockUser);

    expect(result).toEqual(mockResponse);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MascotasService } from './mascotas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MascotasService', () => {
  let service: MascotasService;

  const mockPrismaService = {
    mascotas: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },

    propietarios: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          MascotasService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
        ],
      }).compile();

    service = module.get<MascotasService>(
      MascotasService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
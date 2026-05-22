import { Test, TestingModule } from '@nestjs/testing';
import { MascotasController } from './mascotas.controller';
import { MascotasService } from './mascotas.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('MascotasController', () => {
  let controller: MascotasController;
  let mascotasService: MascotasService;

  const mockMascotasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateMascota: jest.fn(),
    deleteMascota: jest.fn(),
    actualizarFoto: jest.fn(),
  };

  const mockCloudinaryService = {
    subirImagen: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [MascotasController],
        providers: [
          {
            provide: MascotasService,
            useValue: mockMascotasService,
          },
          {
            provide: CloudinaryService,
            useValue: mockCloudinaryService,
          },
        ],
      }).compile();

    controller =
      module.get<MascotasController>(
        MascotasController,
      );

    mascotasService =
      module.get<MascotasService>(
        MascotasService,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
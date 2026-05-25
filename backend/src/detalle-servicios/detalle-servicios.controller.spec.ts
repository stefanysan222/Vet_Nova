import { Test, TestingModule } from '@nestjs/testing';
import { DetalleServiciosController } from './detalle-servicios.controller';
import { DetalleServiciosService } from './detalle-servicios.service';

describe('DetalleServiciosController', () => {
  let controller: DetalleServiciosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleServiciosController],
      providers: [DetalleServiciosService],
    }).compile();

    controller = module.get<DetalleServiciosController>(DetalleServiciosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

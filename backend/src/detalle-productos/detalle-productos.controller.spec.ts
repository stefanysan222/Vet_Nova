import { Test, TestingModule } from '@nestjs/testing';
import { DetalleProductosController } from './detalle-productos.controller';
import { DetalleProductosService } from './detalle-productos.service';

describe('DetalleProductosController', () => {
  let controller: DetalleProductosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleProductosController],
      providers: [DetalleProductosService],
    }).compile();

    controller = module.get<DetalleProductosController>(DetalleProductosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

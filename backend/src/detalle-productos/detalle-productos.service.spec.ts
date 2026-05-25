import { Test, TestingModule } from '@nestjs/testing';
import { DetalleProductosService } from './detalle-productos.service';

describe('DetalleProductosService', () => {
  let service: DetalleProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleProductosService],
    }).compile();

    service = module.get<DetalleProductosService>(DetalleProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

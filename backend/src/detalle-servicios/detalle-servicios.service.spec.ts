import { Test, TestingModule } from '@nestjs/testing';
import { DetalleServiciosService } from './detalle-servicios.service';

describe('DetalleServiciosService', () => {
  let service: DetalleServiciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleServiciosService],
    }).compile();

    service = module.get<DetalleServiciosService>(DetalleServiciosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

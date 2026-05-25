import { Test, TestingModule } from '@nestjs/testing';
import { RegistroVacunasService } from './registro-vacunas.service';

describe('RegistroVacunasService', () => {
  let service: RegistroVacunasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistroVacunasService],
    }).compile();

    service = module.get<RegistroVacunasService>(RegistroVacunasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

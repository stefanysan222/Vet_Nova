import { Test, TestingModule } from '@nestjs/testing';
import { HistoriasClinicasService } from './historias-clinicas.service';

describe('HistoriasClinicasService', () => {
  let service: HistoriasClinicasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoriasClinicasService],
    }).compile();

    service = module.get<HistoriasClinicasService>(HistoriasClinicasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

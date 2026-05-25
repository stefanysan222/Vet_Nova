import { Test, TestingModule } from '@nestjs/testing';
import { HistoriasClinicasController } from './historias-clinicas.controller';
import { HistoriasClinicasService } from './historias-clinicas.service';

describe('HistoriasClinicasController', () => {
  let controller: HistoriasClinicasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoriasClinicasController],
      providers: [HistoriasClinicasService],
    }).compile();

    controller = module.get<HistoriasClinicasController>(HistoriasClinicasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RegistroVacunasController } from './registro-vacunas.controller';
import { RegistroVacunasService } from './registro-vacunas.service';

describe('RegistroVacunasController', () => {
  let controller: RegistroVacunasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistroVacunasController],
      providers: [RegistroVacunasService],
    }).compile();

    controller = module.get<RegistroVacunasController>(RegistroVacunasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

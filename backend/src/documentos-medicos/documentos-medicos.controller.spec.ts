import { Test, TestingModule } from '@nestjs/testing';

import { DocumentosMedicosController } from './documentos-medicos.controller';
import { DocumentosMedicosService } from './documentos-medicos.service';

describe('DocumentosMedicosController', () => {
  let controller: DocumentosMedicosController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          DocumentosMedicosController,
        ],

        providers: [
          {
            provide: DocumentosMedicosService,
            useValue: {},
          },
        ],
      }).compile();

    controller =
      module.get<DocumentosMedicosController>(
        DocumentosMedicosController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

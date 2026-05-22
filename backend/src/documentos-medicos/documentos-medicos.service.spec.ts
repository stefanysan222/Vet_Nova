import { Test, TestingModule } from '@nestjs/testing';

import { DocumentosMedicosService } from './documentos-medicos.service';

import { PrismaService } from '../prisma/prisma.service';

describe('DocumentosMedicosService', () => {
  let service: DocumentosMedicosService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          DocumentosMedicosService,
          {
            provide: PrismaService,
            useValue: {
              documentos_medicos: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
              },

              mascotas: {
                findUnique: jest.fn(),
              },
            },
          },
        ],
      }).compile();

    service =
      module.get<DocumentosMedicosService>(
        DocumentosMedicosService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
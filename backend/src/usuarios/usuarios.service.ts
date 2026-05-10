import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuarios.findMany();
  }

  findOne(id: number) {
    return this.prisma.usuarios.findUnique({
      where: {
        id_usuario: id,
      },
    });
  }

  remove(id: number) {
    return this.prisma.usuarios.delete({
      where: {
        id_usuario: id,
      },
    });
  }
}
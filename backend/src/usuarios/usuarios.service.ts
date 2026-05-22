import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // GET ALL
  async findAll() {
    return this.prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        rol: true,
      },
    });
  }

  // GET ONE
  async findOne(id: number) {

    const usuario =
      await this.prisma.usuarios.findUnique({
        where: {
          id_usuario: id,
        },

        select: {
          id_usuario: true,
          nombre: true,
          email: true,
          rol: true,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return usuario;
  }

  // DELETE
  async remove(id: number) {

    await this.findOne(id);

    return this.prisma.usuarios.delete({
      where: {
        id_usuario: id,
      },
    });
  }
}
import { Module } from '@nestjs/common';

import { PropietariosController } from './propietarios.controller';
import { PropietariosService } from './propietarios.service';

@Module({
  controllers: [
    PropietariosController,
  ],

  providers: [
    PropietariosService,
  ],
})
export class PropietariosModule {}
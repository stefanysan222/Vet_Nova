import { Module } from '@nestjs/common';

import { MascotasController } from './mascotas.controller';
import { MascotasService } from './mascotas.service';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    CloudinaryModule,
  ],

  controllers: [
    MascotasController,
  ],

  providers: [
    MascotasService,
  ],
})
export class MascotasModule {}
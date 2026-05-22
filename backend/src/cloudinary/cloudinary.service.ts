import { Injectable, Inject } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary,
  ) {}

  async subirImagen(archivo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder: 'vetnova/mascotas' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload fallido'));
          resolve(result.secure_url);
        },
      );

      Readable.from(archivo.buffer).pipe(uploadStream);
    });
  }
}
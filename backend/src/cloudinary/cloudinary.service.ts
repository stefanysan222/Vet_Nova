// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async subirImagen(archivo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'vetnova/mascotas' }, // carpeta en Cloudinary
        (error, result) => {
            if (error || !result) return reject(error ?? new Error('Upload fallido'));
            resolve(result.secure_url); // URL pública de la imagen
        },
      );
      Readable.from(archivo.buffer).pipe(uploadStream);
    });
  }
}
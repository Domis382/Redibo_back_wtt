// src/middleware/upload.ts

// src/middleware/upload.ts

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vehiculos'); // Carpeta donde se guardan las imágenes localmente
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const subirImagenesVehiculo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB por imagen
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen inválido'));
    }
  },
}).array('imagenes', 6); // Nombre del campo y máximo 6 archivos

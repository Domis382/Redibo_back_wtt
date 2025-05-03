import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Función para sanitizar el nombre (quita espacios y caracteres especiales)
const sanitize = (name: string) => {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
              .replace(/[^a-zA-Z0-9]/g, "_"); // reemplaza caracteres no válidos
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const user = req.user as { id_usuario: number; nombre_completo: string };
    const nombreSanitizado = sanitize(user.nombre_completo);
    const tipo = req.body.tipo === 'qr' ? 'qr' : 'vehiculo';

    const dir = path.join('uploads', `usuario_${user.id_usuario}_${nombreSanitizado}`, tipo);

    fs.mkdirSync(dir, { recursive: true }); // Crea la carpeta si no existe
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const subirImagenesVehiculo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen inválido'));
    }
  },
}).array('imagenes', 6);



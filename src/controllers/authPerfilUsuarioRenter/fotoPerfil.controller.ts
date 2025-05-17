// src/controllers/authPerfilUsuario/fotoPerfil.controller.ts

import { Request, Response } from 'express';
import multer from 'multer';
import { bucket } from '../../config/firebase';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const storage = multer.memoryStorage(); // 🔥 usa memoria para trabajar con buffer

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Formato de imagen no válido. Usa PNG.'));
    }
    cb(null, true);
  }
});

export const uploadProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const { id_usuario, nombre_completo } = req.user as { id_usuario: number, nombre_completo: string };

  if (!req.file) {
     res.status(400).json({ message: 'No se subió ninguna imagen.' });
     return;
  }

  const fileName = `FotoPerfil_${id_usuario}_${nombre_completo.trim().replace(/\s+/g, '_')}_${uuidv4()}.png`;
  const file = bucket.file(fileName);

  try {
    await file.save(req.file.buffer, {
      contentType: req.file.mimetype,
      public: true, // 🔥 hacerlo público
      metadata: {
        firebaseStorageDownloadTokens: uuidv4()
      }
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    await prisma.usuario.update({
      where: { id_usuario },
      data: { foto_perfil: publicUrl }
    });

     res.json({ message: 'Foto actualizada exitosamente.', foto_perfil: publicUrl });
  } catch (error) {
    console.error('Error al subir foto:', error);
     res.status(500).json({ message: 'Error al subir la foto a Firebase.' });
  }
};

export const deleteProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const { id_usuario } = req.user as { id_usuario: number };

  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { foto_perfil: true }
    });

    if (!user || !user.foto_perfil) {
      res.status(400).json({ message: 'No hay foto para eliminar.' });
      return;
    }

    // Extrae el nombre del archivo desde la URL
    const fileName = user.foto_perfil.split('/').pop();
    if (fileName) {
      await bucket.file(fileName).delete();
    }

    await prisma.usuario.update({
      where: { id_usuario },
      data: { foto_perfil: null },
    });

    res.json({ message: 'Foto eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar la foto:', error);
    res.status(500).json({ message: 'Error al eliminar la foto de Firebase.' });
  }
};
// src/controllers/vehiculo.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Instanciamos Prisma directamente en este archivo
const prisma = new PrismaClient();

export const registrarVehiculo = async (req: Request, res: Response) => {
  try {
    const { placa, soat } = req.body;
    const usuario = req.user as { id_usuario: number; nombre_completo: string }; // Extracting usuario from req.user

    // Tipamos req.files como arreglo de archivos Multer
    const imagenes = req.files as Express.Multer.File[];

    // Validación básica
    if (!placa || !soat || !imagenes || imagenes.length < 3) {
      res.status(400).json({
        message: 'Datos incompletos o inválidos. Se requieren placa, SOAT y al menos 3 imágenes.',
      });
      return;
    }

    // Guardamos solo el nombre de archivo en la base de datos
    const rutasImagenes = imagenes.map((file) => file.filename);

    // Registro en la base de datos
    const vehiculo = await prisma.vehiculo.create({
      data: {
        placa,
        soat,
        imagenes: rutasImagenes,
        usuario: {
          connect: { id_usuario: usuario.id_usuario }, // Assuming `usuario` is available in the request
        },
      },
    });
    res.status(201).json({
      message: 'Vehículo registrado correctamente',
      vehiculo,
    });
    return;
  }
  catch (error) {
    res.status(500).json({
      message: 'Error al registrar el vehículo',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export const eliminarVehiculo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const id_vehiculo = Number(id);
  const usuario = req.user as { id_usuario: number; nombre_completo: string };

  if (isNaN(id_vehiculo)) {
    res.status(400).json({ message: 'ID de vehículo inválido' });
    return;
  }

  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id_vehiculo },
    });

    if (!vehiculo) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    const folder = path.join(
      'uploads',
      `usuario_${usuario.nombre_completo.replace(/\s+/g, '_')}_${usuario.id_usuario}`,
      'vehiculo'
    );

    if (fs.existsSync(folder)) {
      fs.readdirSync(folder).forEach(file => {
        const filePath = path.join(folder, file);
        fs.unlinkSync(filePath);
      });
      fs.rmdirSync(folder, { recursive: true });
    }

    await prisma.vehiculo.delete({ where: { id_vehiculo } });

    res.status(200).json({ message: 'Vehículo y archivos eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ message: 'Error al eliminar el vehículo' });
  }
};

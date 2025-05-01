// src/controllers/vehiculo.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// Removed unused import

// Instanciamos Prisma directamente en este archivo
const prisma = new PrismaClient();

export const registrarVehiculo = async (req: Request, res: Response) => {
  try {
    const { placa, soat } = req.body;

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

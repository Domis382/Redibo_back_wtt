import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerRentersDisponibles = async (req: Request, res: Response) => {
  try {
    const renters = await prisma.usuario.findMany({
      where: {
        host: false,
        driver: null,
        isBlocked: false
      },
      select: {
        id_usuario: true,
        nombre_completo: true,
        email: true,
        telefono: true,
        foto_perfil: true
      }
    });

    res.json(renters);
  } catch (error) {
    console.error('Error al obtener renters:', error);
    res.status(500).json({ message: 'Error al obtener renters' });
  }
};

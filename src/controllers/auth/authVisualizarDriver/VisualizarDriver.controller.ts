/*import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";
// Ajusta la importación según el nombre correcto exportado desde authDriverMiddleware
import type { Request } from "express";
type AuthenticatedRequest = Request & { user?: { idUsuario: number } };

const prisma = new PrismaClient();

export const getDriverProfile: RequestHandler = async (req, res, next) => {
  const user = (req as any).user; // 👈 si necesitas el tipo exacto, puedes usar un cast

  if (!user?.idUsuario) {
    res.status(401).json({ message: "No autorizado: token inválido" });
    return;
  }

  try {
    const driver = await prisma.driver.findUnique({
      where: { idUsuario: user.idUsuario },
      include: { usuario: true },
    });

    if (!driver) {
      res.status(404).json({ message: "Driver no encontrado" });
      return;
    }

    res.json(driver);
  } catch (error) {
    console.error("Error al obtener perfil del driver:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};*/


// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id_usuario: number;
  email: string;
  nombre_completo: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return; // 🔥 Es necesario para evitar seguir la ejecución
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded; // ✅ Agrega el usuario al request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
    return; // 🔥 También aquí
  }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded; // Aquí solo ponemos el payload del token
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express";
import * as authService from "@/services/auth.service";
//Ingreso de token
import { generateToken } from '@/utils/generateToken';

import { updateGoogleProfile as updateGoogleProfileService } from "../services/auth.service";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { nombre_completo, email, contraseña, fecha_nacimiento, telefono } =
    req.body;

  try {
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    const newUser = await authService.createUser({
      nombre_completo,
      email,
      contraseña,
      fecha_nacimiento,
      telefono,
    });

    return res
      .status(201)
      .json({
        message: "Usuario registrado exitosamente",
        user: { email: newUser.email },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateGoogleProfile = async (req: Request, res: Response) => {
  const { nombre_completo, fecha_nacimiento } = req.body;
  const email = (req.user as { email: string }).email;
  //const email = req.user?.email;

  if (!email) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const updatedUser = await authService.updateGoogleProfile(email, nombre_completo, fecha_nacimiento);
    res.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error);
    res.status(400).json({
      message:
        error.message || "No se pudo actualizar el perfil con Google",
    });
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Correo ingresado no se encuentra en el sistema." });
    }

    const isValid = await authService.validatePassword(password, user.contraseña ?? "");

    if (!isValid) {
      return res.status(401).json({ message: "Los datos no son válidos" });
    }

    //Token
    const token = generateToken({
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_completo: user.nombre_completo
    });
    return res.json({
      message: "Login exitoso",
      token,
      user: {
        email: user.email,
        nombre_completo: user.nombre_completo
      }
    });
    //Cambios por si no funciona lo que implemente
    //return res.json({ message: "Login exitoso", user: { email: user.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};


export const me = async (req: Request, res: Response) => {
  const { id_usuario } = req.user as { id_usuario: number };

  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: {
        id_usuario: true,
        nombre_completo: true,
        email: true,
        telefono: true,
        fecha_nacimiento: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ user }); // 🔥 Ahora manda todos los datos al frontend
  } catch (error) {
    console.error('Error en /me:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};



export const getUserProfile = async (req: Request, res: Response) => {
  const id_usuario = Number(req.params.id_usuario); // Aseguramos que sea número

  if (isNaN(id_usuario)) {
    return res.status(400).json({ message: 'ID de usuario inválido' });
  }

  try {
    const user = await authService.getUserById(id_usuario); // Usamos el servicio

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Devolvemos los datos sin contraseña ni campos sensibles
    return res.status(200).json({
      id_usuario: user.id_usuario,
      nombre_completo: user.nombre_completo,
      email: user.email,
      telefono: user.telefono,
      fecha_nacimiento: user.fecha_nacimiento,
    });
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
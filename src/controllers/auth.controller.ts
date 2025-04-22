import {Request, Response } from 'express';
import * as authService from '@/services/auth.service';

export const register = async (req: Request, res: Response) => {
  const { nombre_completo, email, contraseña, fecha_nacimiento, telefono } = req.body;

  try {
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }

    const newUser = await authService.createUser({
      nombre_completo,
      email,
      contraseña,
      fecha_nacimiento,
      telefono,
    });

    return res.status(201).json({ message: "Usuario registrado exitosamente", user: { email: newUser.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Correo ingresado no se encuentra en el sistema.' });
    }

    const isValid = await authService.validatePassword(password, user.contraseña);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Los datos no son válidos' });
    }

    return res.json({ message: 'Login exitoso', user: { email: user.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const { id_usuario } = req.params; // Asumiendo que el ID del usuario se pasa en los parámetros

  try {
    // Llamamos al servicio para obtener el usuario por su ID
    const user = await authService.getUserById(Number(id_usuario));

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si el usuario existe, devolvemos sus datos
    return res.json({
      id_usuario: user.id_usuario,
      nombre_completo: user.nombre_completo,
      email: user.email,
      telefono: user.telefono,
      fecha_nacimiento: user.fecha_nacimiento,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
















/*import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

import bcrypt from 'bcryptjs'; // 👈 Importar bcrypt

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { nombre_completo, email, contraseña, fecha_nacimiento, telefono} = req.body;
  

  try {

    if (!nombre_completo || !email || !contraseña || !fecha_nacimiento) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar completos." });
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }

    // 🔒 ENCRIPTAR LA CONTRASEÑA AQUÍ
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // 🔥 GUARDAR LA CONTRASEÑA ENCRIPTADA
    const newUser = await prisma.usuario.create({
      data: {
        nombre_completo,
        email,
        contraseña: hashedPassword, // 👈 Aquí guardamos la contraseña encriptada
        fecha_nacimiento: new Date(fecha_nacimiento),
        telefono: telefono ? Number(telefono) : null,
        registrado_con: "email",
        verificado: false,
        host: false,
        driver: false,
      },
    });

    return res.status(201).json({ message: "Usuario registrado exitosamente", user: { email: newUser.email } });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};


//Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const allowedDomains = [
    '@gmail.com',
    '@outlook.com',
    '@hotmail.com',
    '@live.com',
    '@yahoo.com',
    '@icloud.com',
    '@proton.me'
  ];
  
  // Validar que email y password existan
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }
  // Validar que el correo no exceda los 70 caracteres
  if (email.length > 70) {
    return res.status(400).json({ message: 'La cantidad máxima es de 70 caracteres' });
  }

  // Validar que el email contenga '@'
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Incluye un signo @ en el correo electrónico.' });
  }
  // Validar que haya texto antes del @
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) {
    return res.status(400).json({ message: 'Ingresa nombre de usuario antes del signo @' });
  }
  // Validar que haya un dominio después del @
  const domainPart = email.substring(atIndex + 1);
  if (!domainPart || domainPart.trim() === '') {
    return res.status(400).json({ message: 'Ingresa un dominio después del signo @' });
  }
  
  const emailDomain = email.substring(email.indexOf('@'));
  // 🔥 Después validamos el dominio
  
  if (!allowedDomains.includes(emailDomain)) {
  return res.status(400).json({ message: 'Introduzca un dominio correcto' });
  }

  // Validar la longitud de la contraseña
 if (password.length < 8 || password.length > 25) {
    return res.status(400).json({ message: 'La contraseña debe tener entre 8 y 25 caracteres' });
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Correo ingresado no se encuentra en el sistema.' });
    }

    if (user.contraseña !== password) {
      return res.status(401).json({ message: 'Los datos no son válidos' });
    }

    return res.json({ message: 'Login exitoso', user: { email: user.email } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
*/
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

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
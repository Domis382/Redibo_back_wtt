import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return prisma.usuario.findUnique({ where: { email } });
};

export const createUser = async (data: {
  nombre_completo: string;
  email: string;
  contraseña: string;
  fecha_nacimiento: string;
  telefono?: number | null;
}) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.contraseña, salt);

  return prisma.usuario.create({
    data: {
      nombre_completo: data.nombre_completo,
      email: data.email,
      contraseña: hashedPassword,
      fecha_nacimiento: new Date(data.fecha_nacimiento),
      telefono: data.telefono ?? null,
      registrado_con: "email",
      verificado: false,
      host: false,
      driver: false,
    },
  });
};

export const validatePassword = async (inputPassword: string, hashedPassword: string) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};

export const getUserById = async (id_usuario: number) => {
  return await prisma.usuario.findUnique({
    where: { id_usuario }, // Asegúrate que en Prisma el campo se llame id_usuario
    select: { // Evita traer la contraseña u otros campos sensibles
      id_usuario: true,
      nombre_completo: true,
      email: true,
      telefono: true,
      fecha_nacimiento: true,
    },
  });
};

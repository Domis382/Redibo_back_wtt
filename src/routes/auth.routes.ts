// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login } from '@/controllers/auth.controller'; // 👈 IMPORTA BIEN AQUÍ
import { validateRegister } from '@/middlewares/validateRegister'; // 👈 IMPORTAR middleware de validación
import { validateLogin } from '@/middlewares/validateLogin'; 

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);


export default router;
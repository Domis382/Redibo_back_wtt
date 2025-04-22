// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, getUserProfile } from '@/controllers/auth.controller'; // 👈 IMPORTA BIEN AQUÍ

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user-profile/:id_usuario', getUserProfile);


export default router;
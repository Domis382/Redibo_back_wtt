import express from 'express';
import { upload } from '@/middlewares/multerConfig';
import { PagoController } from '@/controllers/authRegistroHost/pagos.controller';
import { requireAuth } from '@/middlewares/authMiddleware';

const router = express.Router();
const pagoController = new PagoController();

router.post(
  '/',
  requireAuth,
  upload.single('imagen_qr'),
  async (req, res, next) => {
    try {
      await pagoController.createMetodoPago(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

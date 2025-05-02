import express from 'express';
import { PagoController } from '@/controllers/pagos.controller';
import { authMiddleware } from '@/middlewares/authMiddleware';

const router = express.Router();
const pagoController = new PagoController();

// Middleware para vincular los métodos del controlador al contexto correcto
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn.call(pagoController, req, res, next)).catch(next);
};

// Rutas para métodos de pago
router.post('/',  asyncHandler(pagoController.createMetodoPago));
router.get('/usuario/:id_usuario',  asyncHandler(pagoController.getMetodosPagoByUsuario));
router.get('/predeterminado/:id_usuario', asyncHandler(pagoController.getMetodoPagoPredeterminado));
router.get('/:id',  asyncHandler(pagoController.getMetodoPagoById));
router.put('/:id',  asyncHandler(pagoController.updateMetodoPago));
router.patch('/:id/predeterminado', asyncHandler(pagoController.setMetodoPagoPredeterminado));
router.delete('/:id',  asyncHandler(pagoController.deleteMetodoPago));

export default router;
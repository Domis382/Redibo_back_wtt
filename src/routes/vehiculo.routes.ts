import { Router } from 'express';
import { registrarVehiculo, eliminarVehiculo } from '../controllers/authRegistroHost/vehiculo.controller';
import { subirImagenesVehiculo } from '../middlewares/upload';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Registro de vehículo (primer paso)
router.post(
  '/registro-vehiculo',
  requireAuth,
  subirImagenesVehiculo,
  registrarVehiculo
);

// Eliminación de vehículo si se cancela en el segundo paso
router.delete(
  '/eliminar-vehiculo/:id',
  requireAuth,
  eliminarVehiculo
);

export default router;




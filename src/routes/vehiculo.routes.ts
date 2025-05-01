import { Router } from 'express';
import { registrarVehiculo } from '../controllers/vehiculo.controller';
import { subirImagenesVehiculo } from '../middlewares/upload';

const router = Router();

router.post('/registro-vehiculo', subirImagenesVehiculo, registrarVehiculo);

export default router;


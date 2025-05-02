import { Request, Response } from 'express';
import { PagoService, CreateMetodoPagoDto, UpdateMetodoPagoDto } from '@/services/pago.service';
import { TipoMetodoPago } from '@prisma/client';

export class PagoController {
  private pagoService: PagoService;

  constructor() {
    this.pagoService = new PagoService();
  }

  /**
   * Crea un nuevo método de pago
   */
  async createMetodoPago(req: Request, res: Response): Promise<void> {
    try {
      const { 
        id_usuario, 
        tipo, 
        numero_tarjeta, 
        fecha_expiracion, 
        titular, 
        detalles_metodo, 
        imagen_qr, 
        predeterminado 
      } = req.body;

      // Validación básica
      if (!id_usuario || !tipo || !Object.values(TipoMetodoPago).includes(tipo)) {
        res.status(400).json({ 
          success: false, 
          message: 'Datos inválidos. El id_usuario y tipo son obligatorios.' 
        });
        return;
      }

      // Validación específica según el tipo de método de pago
      if (tipo === TipoMetodoPago.tarjeta && (!numero_tarjeta || !fecha_expiracion || !titular)) {
        res.status(400).json({ 
          success: false, 
          message: 'Para tarjetas, se requiere número, fecha de expiración y titular.' 
        });
        return;
      }

      if (tipo === TipoMetodoPago.qr && !imagen_qr) {
        res.status(400).json({ 
          success: false, 
          message: 'Para pagos QR, se requiere la imagen del código QR.' 
        });
        return;
      }

      const data: CreateMetodoPagoDto = {
        id_usuario,
        tipo,
        numero_tarjeta,
        fecha_expiracion,
        titular,
        detalles_metodo,
        imagen_qr,
        predeterminado
      };

      const metodoPago = await this.pagoService.createMetodoPago(data);
      res.status(201).json({ 
        success: true, 
        data: metodoPago 
      });
    } catch (error: any) {
      console.error('Error al crear método de pago:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear método de pago', 
        error: error.message 
      });
    }
  }

  /**
   * Obtiene todos los métodos de pago de un usuario
   */
  async getMetodosPagoByUsuario(req: Request, res: Response): Promise<void> {
    try {
      const id_usuario = parseInt(req.params.id_usuario);
      
      if (isNaN(id_usuario)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID de usuario inválido' 
        });
        return;
      }

      const metodosPago = await this.pagoService.getMetodosPagoByUsuario(id_usuario);
      res.status(200).json({ 
        success: true, 
        data: metodosPago 
      });
    } catch (error: any) {
      console.error('Error al obtener métodos de pago:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener métodos de pago', 
        error: error.message 
      });
    }
  }

  /**
   * Obtiene un método de pago por su ID
   */
  async getMetodoPagoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID inválido' 
        });
        return;
      }

      const metodoPago = await this.pagoService.getMetodoPagoById(id);
      
      if (!metodoPago) {
        res.status(404).json({ 
          success: false, 
          message: 'Método de pago no encontrado' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        data: metodoPago 
      });
    } catch (error: any) {
      console.error('Error al obtener método de pago:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener método de pago', 
        error: error.message 
      });
    }
  }

  /**
   * Obtiene el método de pago predeterminado de un usuario
   */
  async getMetodoPagoPredeterminado(req: Request, res: Response): Promise<void> {
    try {
      const id_usuario = parseInt(req.params.id_usuario);
      
      if (isNaN(id_usuario)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID de usuario inválido' 
        });
        return;
      }

      const metodoPago = await this.pagoService.getMetodoPagoPredeterminado(id_usuario);
      
      if (!metodoPago) {
        res.status(404).json({ 
          success: false, 
          message: 'No se encontró método de pago predeterminado' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        data: metodoPago 
      });
    } catch (error: any) {
      console.error('Error al obtener método de pago predeterminado:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener método de pago predeterminado', 
        error: error.message 
      });
    }
  }

  /**
   * Actualiza un método de pago
   */
  async updateMetodoPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID inválido' 
        });
        return;
      }

      const { 
        tipo, 
        numero_tarjeta, 
        fecha_expiracion, 
        titular, 
        detalles_metodo, 
        imagen_qr, 
        activo, 
        predeterminado 
      } = req.body;

      const updateData: UpdateMetodoPagoDto = {
        tipo,
        numero_tarjeta,
        fecha_expiracion,
        titular,
        detalles_metodo,
        imagen_qr,
        activo,
        predeterminado
      };

      // Eliminar propiedades indefinidas
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateMetodoPagoDto] === undefined) {
          delete updateData[key as keyof UpdateMetodoPagoDto];
        }
      });

      // Si actualizamos el tipo, validamos que los campos correspondientes estén presentes
      if (tipo === TipoMetodoPago.tarjeta && (updateData.numero_tarjeta === '' || updateData.fecha_expiracion === '' || updateData.titular === '')) {
        res.status(400).json({ 
          success: false, 
          message: 'Para tarjetas, se requiere número, fecha de expiración y titular.' 
        });
        return;
      }

      if (tipo === TipoMetodoPago.qr && updateData.imagen_qr === '') {
        res.status(400).json({ 
          success: false, 
          message: 'Para pagos QR, se requiere la imagen del código QR.' 
        });
        return;
      }

      const metodoPago = await this.pagoService.updateMetodoPago(id, updateData);
      res.status(200).json({ 
        success: true, 
        data: metodoPago 
      });
    } catch (error: any) {
      console.error('Error al actualizar método de pago:', error);
      
      if (error.message === 'Método de pago no encontrado') {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Error al actualizar método de pago', 
          error: error.message 
        });
      }
    }
  }

  /**
   * Establece un método de pago como predeterminado
   */
  async setMetodoPagoPredeterminado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID inválido' 
        });
        return;
      }

      const metodoPago = await this.pagoService.setMetodoPagoPredeterminado(id);
      res.status(200).json({ 
        success: true, 
        data: metodoPago 
      });
    } catch (error: any) {
      console.error('Error al establecer método de pago predeterminado:', error);
      
      if (error.message === 'Método de pago no encontrado') {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Error al establecer método de pago predeterminado', 
          error: error.message 
        });
      }
    }
  }

  /**
   * Elimina (desactiva) un método de pago
   */
  async deleteMetodoPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID inválido' 
        });
        return;
      }

      const metodoPago = await this.pagoService.deleteMetodoPago(id);
      res.status(200).json({ 
        success: true, 
        data: metodoPago,
        message: 'Método de pago eliminado correctamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar método de pago:', error);
      
      if (error.message === 'Método de pago no encontrado') {
        res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Error al eliminar método de pago', 
          error: error.message 
        });
      }
    }
  }
}
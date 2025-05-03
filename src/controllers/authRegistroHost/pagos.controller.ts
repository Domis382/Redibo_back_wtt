import { Request, Response } from 'express';
import { PagoService } from '@/services/pago.service';

export class PagoController {
  private pagoService = new PagoService();

  async createMetodoPago(req: Request, res: Response) {
    const {
      tipo,
      numero_tarjeta,
      fecha_expiracion,
      titular,
      detalles_metodo,
    } = req.body;

    const imagen_qr = req.file ? req.file.filename : undefined;

    const usuario = req.user as { id_usuario: number };

    if (!usuario || !usuario.id_usuario) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    // ✅ Convertir tipo desde frontend ("card", "qr", "other") a enum válido ("tarjeta", "qr", "efectivo")
    let tipoFinal: "tarjeta" | "efectivo" | "qr";
    if (tipo === "card") tipoFinal = "tarjeta";
    else if (tipo === "other") tipoFinal = "efectivo";
    else if (tipo === "qr") tipoFinal = "qr";
    else {
      return res.status(400).json({ success: false, message: 'Tipo de método de pago inválido' });
    }

    // 🧾 Log para depurar
    console.log('🧾 Datos enviados a actualizarMetodoPago:', {
      id_usuario: usuario.id_usuario,
      tipo: tipoFinal,
      numero_tarjeta,
      fecha_expiracion,
      titular,
      imagen_qr,
      detalles_metodo_pago: detalles_metodo,
    });

    try {
      const metodoPago = await this.pagoService.actualizarMetodoPago({
        id_usuario: usuario.id_usuario,
        tipo: tipoFinal,
        numero_tarjeta,
        fecha_expiracion,
        titular,
        imagen_qr,
        detalles_metodo_pago: detalles_metodo,
      });

      return res.status(201).json({ success: true, data: metodoPago });
    } catch (error) {
      console.error("❌ Error al guardar método de pago:", error);
      return res.status(500).json({ success: false, message: 'Error al crear método de pago' });
    }
  }
}


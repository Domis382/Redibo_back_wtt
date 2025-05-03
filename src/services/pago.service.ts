import { PrismaClient, TipoMetodoPago } from '@prisma/client';

const prisma = new PrismaClient();

export interface MetodoPagoDto {
  id_usuario: number;
  tipo: TipoMetodoPago;
  numero_tarjeta?: string;
  fecha_expiracion?: string;
  titular?: string;
  imagen_qr?: string;
  detalles_metodo_pago?: string;
}

export class PagoService {
  async actualizarMetodoPago(data: MetodoPagoDto) {
    return prisma.usuario.update({
      where: { id_usuario: data.id_usuario },
      data: {
        metodo_pago_tipo: data.tipo,
        numero_tarjeta: data.numero_tarjeta,
        fecha_expiracion: data.fecha_expiracion,
        titular: data.titular,
        imagen_qr: data.imagen_qr,
        detalles_metodo_pago: data.detalles_metodo_pago,
        host: true,
      },
    });
  }

  async obtenerMetodoPago(id_usuario: number) {
    return prisma.usuario.findUnique({
      where: { id_usuario },
      select: {
        metodo_pago_tipo: true,
        numero_tarjeta: true,
        fecha_expiracion: true,
        titular: true,
        imagen_qr: true,
        detalles_metodo_pago: true,
      },
    });
  }
}
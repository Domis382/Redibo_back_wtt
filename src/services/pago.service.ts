import { PrismaClient, MetodoPago, TipoMetodoPago } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMetodoPagoDto {
  id_usuario: number;
  tipo: TipoMetodoPago;
  numero_tarjeta?: string;
  fecha_expiracion?: string;
  titular?: string;
  detalles_metodo?: string;
  imagen_qr?: string;
  predeterminado?: boolean;
}

export interface UpdateMetodoPagoDto {
  tipo?: TipoMetodoPago;
  numero_tarjeta?: string;
  fecha_expiracion?: string;
  titular?: string;
  detalles_metodo?: string;
  imagen_qr?: string;
  activo?: boolean;
  predeterminado?: boolean;
}

export class PagoService {
  /**
   * Crea un nuevo método de pago
   */
  async createMetodoPago(data: CreateMetodoPagoDto): Promise<MetodoPago> {
    // Si el nuevo método es predeterminado, desactivamos cualquier otro método predeterminado del usuario
    if (data.predeterminado) {
      await prisma.metodoPago.updateMany({
        where: {
          id_usuario: data.id_usuario,
          predeterminado: true,
        },
        data: {
          predeterminado: false,
        },
      });
    }

    return prisma.metodoPago.create({
      data: {
        id_usuario: data.id_usuario,
        tipo: data.tipo,
        numero_tarjeta: data.numero_tarjeta,
        fecha_expiracion: data.fecha_expiracion,
        titular: data.titular,
        detalles_metodo: data.detalles_metodo,
        imagen_qr: data.imagen_qr,
        predeterminado: data.predeterminado || false,
      },
    });
  }

  /**
   * Obtiene todos los métodos de pago de un usuario
   */
  async getMetodosPagoByUsuario(id_usuario: number): Promise<MetodoPago[]> {
    return prisma.metodoPago.findMany({
      where: {
        id_usuario,
        activo: true,
      },
      orderBy: {
        predeterminado: 'desc',
      },
    });
  }

  /**
   * Obtiene un método de pago por su ID
   */
  async getMetodoPagoById(id: number): Promise<MetodoPago | null> {
    return prisma.metodoPago.findUnique({
      where: { id },
    });
  }

  /**
   * Obtiene el método de pago predeterminado de un usuario
   */
  async getMetodoPagoPredeterminado(id_usuario: number): Promise<MetodoPago | null> {
    return prisma.metodoPago.findFirst({
      where: {
        id_usuario,
        predeterminado: true,
        activo: true,
      },
    });
  }

  /**
   * Actualiza un método de pago
   */
  async updateMetodoPago(id: number, data: UpdateMetodoPagoDto): Promise<MetodoPago> {
    const metodoPago = await prisma.metodoPago.findUnique({
      where: { id },
    });

    if (!metodoPago) {
      throw new Error('Método de pago no encontrado');
    }

    // Si estamos configurando este método como predeterminado, desactivamos cualquier otro método predeterminado
    if (data.predeterminado) {
      await prisma.metodoPago.updateMany({
        where: {
          id_usuario: metodoPago.id_usuario,
          predeterminado: true,
          id: { not: id },
        },
        data: {
          predeterminado: false,
        },
      });
    }

    return prisma.metodoPago.update({
      where: { id },
      data,
    });
  }

  /**
   * Establece un método de pago como predeterminado
   */
  async setMetodoPagoPredeterminado(id: number): Promise<MetodoPago> {
    const metodoPago = await prisma.metodoPago.findUnique({
      where: { id },
    });

    if (!metodoPago) {
      throw new Error('Método de pago no encontrado');
    }

    // Desactivar el método de pago predeterminado actual
    await prisma.metodoPago.updateMany({
      where: {
        id_usuario: metodoPago.id_usuario,
        predeterminado: true,
      },
      data: {
        predeterminado: false,
      },
    });

    // Establecer el nuevo método como predeterminado
    return prisma.metodoPago.update({
      where: { id },
      data: {
        predeterminado: true,
      },
    });
  }

  /**
   * Desactiva (elimina lógicamente) un método de pago
   */
  async deleteMetodoPago(id: number): Promise<MetodoPago> {
    const metodoPago = await prisma.metodoPago.findUnique({
      where: { id },
    });

    if (!metodoPago) {
      throw new Error('Método de pago no encontrado');
    }

    // Si el método a eliminar es el predeterminado y hay otros métodos activos,
    // establecemos otro como predeterminado
    if (metodoPago.predeterminado) {
      const otroMetodo = await prisma.metodoPago.findFirst({
        where: {
          id_usuario: metodoPago.id_usuario,
          id: { not: id },
          activo: true,
        },
      });

      if (otroMetodo) {
        await prisma.metodoPago.update({
          where: { id: otroMetodo.id },
          data: { predeterminado: true },
        });
      }
    }

    // Desactivamos el método de pago (eliminación lógica)
    return prisma.metodoPago.update({
      where: { id },
      data: { activo: false },
    });
  }
}
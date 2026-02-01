import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, assetIds: string[]) {
    // Get assets with prices
    const assets = await this.prisma.asset.findMany({
      where: { id: { in: assetIds } },
    });

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
        items: {
          create: assets.map(asset => ({
            assetId: asset.id,
            price: asset.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            asset: true,
          },
        },
      },
    });

    return order;
  }

  async getOrder(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            asset: true,
          },
        },
        user: true,
      },
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            asset: {
              include: {
                previews: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: 'PENDING' | 'PAID' | 'FAILED', stripeSessionId?: string) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        ...(stripeSessionId && { stripeSessionId }),
      },
    });
  }

  async getOrderByStripeSession(stripeSessionId: string) {
    return this.prisma.order.findFirst({
      where: { stripeSessionId },
      include: {
        items: {
          include: {
            asset: true,
          },
        },
      },
    });
  }
}
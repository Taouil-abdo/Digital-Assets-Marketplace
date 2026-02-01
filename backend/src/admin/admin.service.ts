import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllAssets() {
    return this.prisma.asset.findMany({
      include: {
        seller: { select: { name: true, email: true } },
        previews: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAssetStatus(assetId: string, status: 'ACTIVE' | 'INACTIVE') {
    return this.prisma.asset.update({
      where: { id: assetId },
      data: { status },
    });
  }

  async deleteAsset(assetId: string) {
    return this.prisma.asset.delete({
      where: { id: assetId },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        assets: true,
        orders: true,
      },
    });
  }

  async updateUserRole(userId: string, role: 'BUYER' | 'SELLER' | 'ADMIN') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async getMarketplaceStats() {
    const [totalAssets, totalUsers, totalOrders, totalRevenue] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.orderItem.aggregate({
        where: { order: { status: 'PAID' } },
        _sum: { price: true },
      }),
    ]);

    return {
      totalAssets,
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.price || 0,
    };
  }
}
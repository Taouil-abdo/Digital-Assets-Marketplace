import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AssetsService {
  private s3Client: S3Client;

  constructor(private prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async createAsset(data: {
    title: string;
    description: string;
    price: number;
    category: string;
    sellerId: string;
    privateFileKey: string;
  }) {
    return this.prisma.asset.create({
      data,
      include: {
        seller: true,
        previews: true,
      },
    });
  }

  async getAssets(filters?: { category?: string; search?: string }) {
    const where: any = { status: 'ACTIVE' };
    
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.asset.findMany({
      where,
      include: {
        seller: { select: { name: true } },
        previews: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssetById(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        seller: { select: { name: true } },
        previews: true,
      },
    });
  }

  async getSellerAssets(sellerId: string) {
    return this.prisma.asset.findMany({
      where: { sellerId },
      include: {
        previews: true,
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });
  }

  async generateDownloadUrl(assetId: string, userId: string): Promise<string> {
    // Check if user has purchased this asset
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'PAID',
        items: {
          some: { assetId },
        },
      },
    });

    if (!order) {
      throw new Error('Asset not purchased');
    }

    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Generate presigned URL valid for 5 minutes
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_PRIVATE_BUCKET,
      Key: asset.privateFileKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 300 });
  }

  async addPreview(assetId: string, url: string, type: string) {
    return this.prisma.assetPreview.create({
      data: {
        assetId,
        url,
        type,
      },
    });
  }

  async updateAsset(id: string, data: Partial<{
    title: string;
    description: string;
    price: number;
    category: string;
    status: 'ACTIVE' | 'INACTIVE';
  }>) {
    return this.prisma.asset.update({
      where: { id },
      data,
    });
  }
}
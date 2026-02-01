import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  async getAssets(@Query() filters: { category?: string; search?: string }) {
    return this.assetsService.getAssets(filters);
  }

  @Get(':id')
  async getAsset(@Param('id') id: string) {
    return this.assetsService.getAssetById(id);
  }

  @Post()
  async createAsset(@Body() createAssetDto: {
    title: string;
    description: string;
    price: number;
    category: string;
    sellerId: string;
    privateFileKey: string;
  }) {
    return this.assetsService.createAsset(createAssetDto);
  }

  @Get('seller/:sellerId')
  async getSellerAssets(@Param('sellerId') sellerId: string) {
    return this.assetsService.getSellerAssets(sellerId);
  }

  @Post(':id/download')
  async getDownloadUrl(@Param('id') assetId: string, @Body() body: { userId: string }) {
    const url = await this.assetsService.generateDownloadUrl(assetId, body.userId);
    return { downloadUrl: url };
  }

  @Post(':id/previews')
  async addPreview(@Param('id') assetId: string, @Body() body: { url: string; type: string }) {
    return this.assetsService.addPreview(assetId, body.url, body.type);
  }

  @Put(':id')
  async updateAsset(@Param('id') id: string, @Body() updateData: any) {
    return this.assetsService.updateAsset(id, updateData);
  }
}
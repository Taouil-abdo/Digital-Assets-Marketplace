import { Controller, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('assets')
  async getAllAssets() {
    return this.adminService.getAllAssets();
  }

  @Put('assets/:id/status')
  async updateAssetStatus(@Param('id') id: string, @Body() body: { status: 'ACTIVE' | 'INACTIVE' }) {
    return this.adminService.updateAssetStatus(id, body.status);
  }

  @Delete('assets/:id')
  async deleteAsset(@Param('id') id: string) {
    return this.adminService.deleteAsset(id);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role: 'BUYER' | 'SELLER' | 'ADMIN' }) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getMarketplaceStats();
  }
}
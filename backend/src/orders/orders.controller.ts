import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: { userId: string; assetIds: string[] }) {
    return this.ordersService.createOrder(createOrderDto.userId, createOrderDto.assetIds);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    return this.ordersService.getUserOrders(userId);
  }
}
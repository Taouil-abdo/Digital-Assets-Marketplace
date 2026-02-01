import { Controller, Post, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { orderId: string }) {
    return this.paymentsService.createCheckoutSession(body.orderId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }
}
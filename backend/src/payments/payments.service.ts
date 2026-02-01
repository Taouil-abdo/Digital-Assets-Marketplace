import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private ordersService: OrdersService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createCheckoutSession(orderId: string) {
    const order = await this.ordersService.getOrder(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const totalAmount = order.items.reduce((sum, item) => sum + item.price, 0);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: order.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.asset.title,
            description: item.asset.description,
          },
          unit_amount: item.price,
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        orderId: order.id,
      },
    });

    // Update order with Stripe session ID
    await this.ordersService.updateOrderStatus(orderId, 'PENDING', session.id);

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await this.ordersService.updateOrderStatus(orderId, 'PAID');
      }
    }

    return { received: true };
  }
}
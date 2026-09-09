import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entities/order.entity';
import { Model } from 'mongoose';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../user/entities/user.entity';
import Stripe from 'stripe';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {
  private stripe: Stripe;
  constructor
    (@InjectModel(Order.name) private readonly orderModel: Model<Order>,
      @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
      @InjectModel(User.name) private readonly usertModel: Model<User>,
      @InjectModel(Product.name) private readonly productModel: Model<Product>,
      @Inject('STRIPE_SECRET_KEY') private readonly apiKey: string
    ) {
    this.stripe = new Stripe(this.apiKey, { apiVersion: "2026-08-26.dahlia" });
  }

  async create(userId: string, paymentType: 'cash' | 'card', createOrderDto: CreateOrderDto) {

    const cart = await this.cartModel.findOne({ user: userId }).populate<{ user: User }>('user')
      .populate<{ 'cartItems.productId': Product }[]>('cartItems.productId');

    if (!cart)
      throw new NotFoundException(`Cart not found for user ${userId}`);

    const data = {
      userId,
      cartItems: cart.cartItems,
      totalOrderPrice: cart.totalPrice,
      paymentMethod: paymentType,
      shippingAddress: cart.user.address,
    }

    if (paymentType === 'cash') {
      //insert order in db
      const order = await this.orderModel.create({
        ...data,
        isPaid: data.totalOrderPrice === 0 ? true : false,
        paidAt: data.totalOrderPrice === 0 ? new Date() : undefined,
        isDeliverd: false
      });

      // update product quantity and sold
      if (data.totalOrderPrice === 0) {
        cart.cartItems.forEach(async (item) => {
          await this.productModel.findByIdAndUpdate(
            item.productId,
            { $inc: { quantity: -item.quantity, sold: item.quantity } },
            { new: true },
          );
        });
        // reset Cart
        await this.cartModel.findOneAndUpdate({ user: userId }, { cartItems: [], totalPrice: 0 });
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Order created successfully',
        data: order,
      };
    }

    // if user choose card payment method
    const session = await this.stripe.checkout.sessions.create({
      metadata: {
        address: data.shippingAddress ?? "",
      },
      line_items: cart.cartItems.map((item) => {
        const product = item.productId as Product;
        return {
          price_data: {
            currency: 'egp',
            product_data: {
              name: product.title,
              description: product.description,
              images: [product.imageCover, ...product.images ?? []],
              metadata: {
                //metadata must be string not null value
                color: item.color ?? "null"
              },
            },
            unit_amount: Math.round(Number(item.price * 100)),
          },
          // I should choose between price and price_data
          // price: item.price.toString(),
          quantity: item.quantity,
        }
      }),
      client_reference_id: userId,
      customer_email: cart.user.email,
      mode: 'payment',
      success_url: 'https://example.com/success', //frontend url
      cancel_url: 'https://example.com/cancel', //frontend url
    });
    // inser order in db
    const order = await this.orderModel.create({
      ...data,
      sessionId: session.id,
      isPaid: false,
      isDeliverd: false,
    });
    return {
      status: 200,
      message: 'Order created successfully',
      data: {
        url: session.url,
        success_url: `${session.success_url}?session_id=${session.id}`,
        cancel_url: session.cancel_url,
        expires_at: new Date(session.expires_at * 1000),
        sessionId: session.id,
        totalPrice: session.amount_total,
        data: order,
      }
    };
  }

  async findAllOrdersOnUser(user_id: string) {
    return await this.orderModel.find({ user: user_id });
  }


  //TODO Pagination
  async findAllOrders() {
    return await this.orderModel.find({});
  }
}


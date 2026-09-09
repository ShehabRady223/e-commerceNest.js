import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, orderSchema } from './entities/order.entity';
import { Cart, CartSchema } from '../cart/entities/cart.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Product, ProductSchema } from '../product/entities/product.entity';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Order.name, schema: orderSchema },
    { name: Cart.name, schema: CartSchema },
    { name: User.name, schema: UserSchema },
    { name: Product.name, schema: ProductSchema },
  ])],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: 'STRIPE_SECRET_KEY',
      useFactory: async (configService: ConfigService) =>
        configService.get('STRIPE_SECRET_KEY'),
      inject: [ConfigService],
    },
  ],
})
export class OrderModule { }

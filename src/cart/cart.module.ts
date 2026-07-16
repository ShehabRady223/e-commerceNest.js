import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './entities/cart.entity';
import { Product, ProductSchema } from '../product/entities/product.entity';
import { Coupon, CouponScheam } from '../coupon/entities/coupon.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Coupon.name, schema: CouponScheam },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }

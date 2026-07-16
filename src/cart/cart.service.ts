import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon } from '../coupon/entities/coupon.entity';
import { Product } from '../product/entities/product.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) { }

  /**
   * Validate MongoDB object IDs early so malformed requests fail fast.
   * This keeps the database layer clean and the API easier to reason about.
   */
  private validateObjectId(id: string, name: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${name} ID`);
    }
  }

  /**
   * Verify that the authenticated user is the owner of the cart.
   * This prevents unauthorized access to other users' carts.
   * SECURITY: Must be called before any update, delete, or removeItem operation.
   */
  private async verifyCartOwnership(cartId: string, userId: string): Promise<Cart> {
    const cart = await this.cartModel.findById(cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartOwnerId = cart.user.toString();
    const requestUserId = userId.toString();

    if (cartOwnerId !== requestUserId) {
      throw new ForbiddenException('You do not have permission to modify this cart. Carts can only be modified by their owner.');
    }

    return cart;
  }

  /**
   * Normalize cart items, validate referenced products, and calculate totals.
   * Reusing this logic keeps create and update flows consistent.
   */
  private async buildCartTotals(
    cartItemsInput: Array<{ productId: string; quantity: number; color?: string }>,
    couponsInput?: Array<{ couponId: string }>,
  ) {
    if (!cartItemsInput?.length) {
      throw new BadRequestException('Cart must contain at least one item');
    }

    cartItemsInput.forEach((item, index) => {
      if (!Types.ObjectId.isValid(item.productId)) {
        throw new BadRequestException(`Invalid product ID at cart item ${index + 1}`);
      }

      if (item.quantity < 1) {
        throw new BadRequestException(`Quantity for product ${item.productId} must be at least 1`);
      }
    });

    const productIds = [...new Set(cartItemsInput.map((item) => item.productId))];
    const products = await this.productModel.find({ _id: { $in: productIds } }).select('price title imageCover');

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    const productMap = new Map<string, Product>(products.map((product) => [product._id.toString(), product]));

    const normalizedCartItems = cartItemsInput.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
      price: productMap.get(item.productId)?.price ?? 0
    }));

    const totalPrice = normalizedCartItems.reduce((sum, item) => {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} was not found`);
      }

      return sum + product.price * item.quantity;
    }, 0);

    let totalPriceAfterDiscount = totalPrice;

    if (couponsInput?.length) {
      const couponIds = couponsInput.map((coupon) => coupon.couponId);
      couponIds.forEach((id, index) => this.validateObjectId(id, `coupon ${index + 1}`));

      const coupons = await this.couponModel.find({ _id: { $in: couponIds } });
      if (coupons.length !== couponIds.length) {
        throw new NotFoundException('One or more coupons were not found');
      }

      const expiredCoupon = coupons.find((coupon) => coupon.expirdate < new Date());
      if (expiredCoupon) {
        throw new BadRequestException(`Coupon '${expiredCoupon.name}' is expired`);
      }

      const totalDiscount = coupons.reduce((sum, current) => sum + current.discount, 0);
      totalPriceAfterDiscount = Math.max(0, totalPrice - totalDiscount);
    }

    return {
      normalizedCartItems,
      totalPrice,
      totalPriceAfterDiscount,
      coupon: couponsInput ?? [],
    };
  }

  /**
   * Create or update the authenticated user's cart.
   * This prevents duplicate carts and keeps the cart lifecycle simple for the client.
   */
  async create(createCartDto: CreateCartDto, userId: string) {
    this.validateObjectId(userId, 'user');

    const cartItems = createCartDto.cartItems ?? [];
    const { normalizedCartItems, totalPrice, totalPriceAfterDiscount, coupon } = await this.buildCartTotals(
      cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.color
      })),
      createCartDto.coupon
    );

    const existingCart = await this.cartModel.findOne({ user: userId });
    const cartData = {
      user: userId,
      cartItems: normalizedCartItems,
      coupon,
      totalPrice,
      totalPriceAfterDiscount,
    };

    if (existingCart) {
      return this.cartModel.findByIdAndUpdate(existingCart._id, cartData, { new: true });
    }

    const cart = new this.cartModel(cartData);
    return cart.save();
  }

  /**
   * Fetch the current user's cart.
   * This is more user-friendly than exposing a raw cart ID in the API.
   */
  async findUserCart(userId: string) {
    this.validateObjectId(userId, 'user');

    return this.cartModel.findOne({ user: userId }).populate('cartItems.productId', 'title price imageCover');
  }

  /**
   * Update the authenticated user's cart contents.
   * SECURITY: Verifies the user is the cart owner before allowing modifications.
   * This is helpful for quantity changes or coupon updates without recreating the cart.
   */
  async update(userId: string, updateCartDto: UpdateCartDto) {
    this.validateObjectId(userId, 'user');

    const existingCart = await this.cartModel.findOne({ user: userId });
    if (!existingCart) {
      throw new NotFoundException('Cart not found for this user');
    }

    // SECURITY: Verify owner before update
    await this.verifyCartOwnership(existingCart._id.toString(), userId);

    const cartItems = updateCartDto.cartItems?.length
      ? updateCartDto.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.color,
      }))
      : existingCart.cartItems.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        color: item.color,
      }));

    const { normalizedCartItems, totalPrice, totalPriceAfterDiscount, coupon } = await this.buildCartTotals(
      cartItems,
      updateCartDto.coupon ?? existingCart.coupon,
    );

    return this.cartModel.findByIdAndUpdate(
      existingCart._id,
      {
        cartItems: normalizedCartItems,
        coupon,
        totalPrice,
        totalPriceAfterDiscount,
      },
      { new: true },
    );
  }

  /**
   * Remove the whole cart for the authenticated user.
   * SECURITY: Verifies the user is the cart owner before allowing deletion.
   * This is useful when checkout completes or the user wants to clear their cart.
   */
  async remove(userId: string) {
    this.validateObjectId(userId, 'user');

    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found for this user');
    }

    // SECURITY: Verify owner before delete
    await this.verifyCartOwnership(cart._id.toString(), userId);

    const deletedCart = await this.cartModel.findByIdAndDelete(cart._id);
    return deletedCart;
  }
  /**
   * Remove a single product from the authenticated user's cart.
   * SECURITY: Verifies the user is the cart owner before allowing item removal.
   * This is more convenient than clearing the whole cart for one-item updates.
   */
  async removeItem(userId: string, productId: string) {
    this.validateObjectId(userId, 'user');
    this.validateObjectId(productId, 'product');

    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found for this user');
    }

    // SECURITY: Verify owner before removing item
    await this.verifyCartOwnership(cart._id.toString(), userId);

    const remainingItems = cart.cartItems.filter((item) => item.productId.toString() !== productId);

    if (!remainingItems.length) {
      return this.cartModel.findByIdAndDelete(cart._id);
    }

    const { normalizedCartItems, totalPrice, totalPriceAfterDiscount } = await this.buildCartTotals(
      remainingItems.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        color: item.color,
      })),
      cart.coupon,
    );

    return this.cartModel.findByIdAndUpdate(
      cart._id,
      {
        cartItems: normalizedCartItems,
        totalPrice,
        totalPriceAfterDiscount,
      },
      { new: true },
    );
  }
}

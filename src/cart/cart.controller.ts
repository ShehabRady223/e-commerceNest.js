import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  /**
   * Create or update the authenticated user's cart.
   * This is useful because a user should normally have only one active cart.
   */
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  async create(@Body() createCartDto: CreateCartDto, @Req() req: any) {
    const data = await this.cartService.create(createCartDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Cart created successfully',
      data,
    };
  }

  /**
   * Get the current user's cart.
   * This gives the client a stable endpoint without exposing cart IDs.
   */
  @UseGuards(AuthGuard)
  @Get()
  async findMyCart(@Req() req: any) {
    const data = await this.cartService.findUserCart(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cart fetched successfully',
      data,
    };
  }

  /**
   * Update the current user's cart items or coupons.
   * This helps clients adjust quantities without needing to recreate the whole cart.
   */
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @Put()
  async update(@Body() updateCartDto: UpdateCartDto, @Req() req: any) {
    const data = await this.cartService.update(req.user.id, updateCartDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cart updated successfully',
      data,
    };
  }

  /**
   * Remove the whole cart for the authenticated user.
   * This is useful for clear-cart actions after checkout or abandonment.
   */
  @UseGuards(AuthGuard)
  @Delete()
  async remove(@Req() req: any) {
    await this.cartService.remove(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cart removed successfully',
    };
  }

  /**
   * Remove one product from the current user's cart.
   * This is more convenient than deleting the entire cart for single-item changes.
   */
  @UseGuards(AuthGuard)
  @Delete('item/:productId')
  async removeItem(@Param('productId') productId: string, @Req() req: any) {
    const data = await this.cartService.removeItem(req.user.id, productId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cart item removed successfully',
      data,
    };
  }
}

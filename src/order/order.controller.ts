import { Controller, Get, Post, Body, Param, ValidationPipe, Req, UseGuards, NotFoundException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  /**
   * Creates an order from the authenticated user's cart at checkout.
   * HTTP POST `/order/checkout/:paymentType` (requires authentication).
   * Accepts `cash` or `card` as the payment type; optional `shippingAddress` in the request body.
   */
  @UseGuards(AuthGuard)
  @Post('checkout/:paymentType')
  async create(@Param('paymentType') paymentType: 'cash' | 'card',
    @Body(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
    createOrderDto: CreateOrderDto, @Req() req) {
    const userId = req.user.id;
    if (!['cash', 'card'].includes(paymentType)) {
      throw new NotFoundException(`Payment type ${paymentType} is not supported`);
    }
    this.orderService.create(userId, paymentType, createOrderDto);
  }

  /**
   * Retrieves all orders in the system.
   * HTTP GET `/order` (restricted to users with the `admin` role).
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  async findAllOrders() {
    const orders = await this.orderService.findAllOrders();
    return {
      status: HttpStatus.OK,
      message: 'Orders found successfully',
      length: orders.length,
      data: orders,
    };
  }

  /**
   * Retrieves all orders belonging to the authenticated user.
   * HTTP GET `/order/my-orders` (requires authentication).
   */
  @Get('my-orders')
  @UseGuards(AuthGuard)
  async findAllOrdersByUserId(@Req() req) {
    const orders = await this.orderService.findAllOrdersOnUser(req.user.id);
    return {
      status: HttpStatus.OK,
      message: 'Orders found successfully',
      length: orders.length,
      data: orders,
    };
  }

  /**
   * Retrieves all orders for a specific user by their ID.
   * HTTP GET `/order/:userId` (restricted to users with the `admin` role; the authenticated user must match `:userId`).
   */
  @Get(':userId')
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  async findAllOrdersOnUser(@Param('userId') userId: string, @Req() req) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException(`You are not authorized to view orders of user ${userId}`);
    }
    const orders = await this.orderService.findAllOrdersOnUser(userId);
    return {
      status: HttpStatus.OK,
      message: 'Orders found successfully',
      length: orders.length,
      data: orders,
    };
  }
}

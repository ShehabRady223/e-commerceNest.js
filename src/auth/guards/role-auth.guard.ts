import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Roles } from '../decorators/role.decorator';
import { JwtPayload } from '../dto/jwtPayload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return false;
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);
      // لازم نتأكد إن التوكن ده فعلاً access token مش refresh token
      // اتسرق أو اتبعت بالغلط في الهيدر
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }
      if (!roles.includes(payload.role)) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
      request['user'] = payload;
      return true;
    } catch (err) {
      // If the error is an instance of HttpException, rethrow it to preserve the original status code and message
      // to avoid overriding on my thowing error
      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

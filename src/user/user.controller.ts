import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryParams } from './dto/query-params';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';

@Controller('user')
//* user can edit his profile like delete or update (resetpassword) his account
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  /**
   * Creates a user record. Restricted to admin role.
   * Accepts validated user fields in the request body.
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      massage: 'user created successfully',
      user,
    };
  }

  /**
   * Lists users with optional pagination and filtering. Admin only.
   * Query parameters control page size, sort, and search criteria.
  */
  @Get()
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  async findAll(@Query() queryParams: QueryParams) {
    const users = await this.userService.findAll(queryParams);
    return {
      statusCode: HttpStatus.OK,
      message: 'users found successfully',
      users,
    };
  }

  /**
   * Retrieves a single user by MongoDB document ID. Admin only.
   * Returns 404 when no user exists for the given identifier.
  */
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'user found successfully',
      user,
    };
  }

  /**
   * Updates an existing user by ID with partial or full fields. Admin only.
   * Request body is validated before changes are applied to the database.
   */
  @Put(':id')
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'user updated successfully',
      user,
    };
  }

  /**
   * Permanently removes a user by ID. Admin only.
   * Responds with success when the record is deleted from the store.
   */
  //* and soft delete user account by set isActive to false instad of delete it hard
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'user deleted successfully',
    };
  }
}

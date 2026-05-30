import { Controller, Get, Post, Put, Body, Param, Delete, UsePipes, ValidationPipe, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryParams } from './dto/query-params';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto)
    return {
      statusCode: HttpStatus.CREATED,
      massage: 'user created successfully',
      user
    }
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(@Query() queryParams:QueryParams) {
    const users = await this.userService.findAll(queryParams);
    return {
      statusCode:HttpStatus.OK,
      message:'users found successfully',
      users
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'user found successfully',
      user
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      statusCode:HttpStatus.OK,
      message:'user updated successfully',
      user
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return{
      statusCode:HttpStatus.OK,
      message:'user deleted successfully'
    }
  }
}

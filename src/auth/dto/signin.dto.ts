import { CreateUserDto } from '../../user/dto/create-user.dto';
import { PickType } from '@nestjs/mapped-types';

export class SigninDto extends PickType(CreateUserDto, ['email', 'password']) {}

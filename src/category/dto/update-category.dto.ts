import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

// PartialType make all prop optional
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

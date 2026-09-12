import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import mongoose, { Model, Types } from 'mongoose';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { Brand } from '../brand/entities/brand.entity';
import { Category } from '../category/entities/category.entity';
import { QueryParams } from './dto/QueryParams';
import { ApiFeatures } from './dto/ApiFeatures';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>
    , @InjectModel(Category.name) private readonly categoryModel: Model<Category>
    , @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategory>,
    @InjectModel(Brand.name) private readonly brandModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService) { }

  async create(createProductDto: CreateProductDto, files: {
    imageCover?: Express.Multer.File[];
    images?: Express.Multer.File[];
  }) {
    const existingProduct = await this.productModel.findOne({ title: createProductDto.title });
    if (existingProduct)
      throw new BadRequestException("Product already exist.");
    const category = await this.categoryModel.findById(createProductDto.category)
    if (!category)
      throw new NotFoundException("Category Not found");
    //* brand
    if (createProductDto.brand) {
      console.log(createProductDto.brand);

      const brand = await this.brandModel.findById(createProductDto.brand)
      if (!brand)
        throw new NotFoundException("Brand Not found");
    }
    //* sub
    if (createProductDto.subCategory) {
      const subCategory = await this.subCategoryModel.findById(createProductDto.subCategory)
      if (!subCategory)
        throw new NotFoundException("SubCategory Not found");
    }
    if (!files.imageCover)
      throw new BadRequestException('imageCover is required.');
    const [coverUpload] = await this.cloudinaryService.uploadImages(files.imageCover);
    const imageUploads = files.images?.length
      ? await this.cloudinaryService.uploadImages(files.images) : [];
    createProductDto.imageCover = coverUpload.secure_url;
    createProductDto.images = imageUploads.map((upload) => upload.secure_url);
    const product = new this.productModel(createProductDto);
    return await product.save();
  }

  async findAll(queryParams: QueryParams) {
    /////TODO Filtration on Products
    // Searchable text fields
    const searchFields = ['title', 'description', 'color'];
    // Count total (before pagination, after filters + search)
    const countFeatures = new ApiFeatures(
      this.productModel.find(),
      queryParams,
    )
      .filter()
      .search(searchFields);
    const total = await this.productModel
      // .countDocuments(countFeatures.build().getFilter());
      .countDocuments(countFeatures.build());
    // Actual query with all stages
    const features = new ApiFeatures(
      this.productModel.find().populate('category subCategory subCategory'),
      // this.productModel.find().populate('category ').populate('brand').populate('subCategory'),
      queryParams
    )
      .filter()
      .search(searchFields)
      .sort()
      .paginate();
    const data = await features.build();
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 3;
    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      data
    };
  }

  async findOne(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException("Invalid Product ID")
    const product = await this.productModel.findById(_id);
    if (!product)
      throw new NotFoundException("Product Not found");
    return product;
  }

  async update(_id: string, updateProductDto: UpdateProductDto,
    files?: {
      imageCover?: Express.Multer.File[],
      images?: Express.Multer.File[]
    }) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException("Invalid Product ID")
    if (!files?.imageCover)
      throw new BadRequestException('imageCover is required.');
    const [coverUpload] = await this.cloudinaryService.uploadImages(files.imageCover);
    const imageUploads = files.images?.length
      ? await this.cloudinaryService.uploadImages(files.images) : [];
    updateProductDto.imageCover = coverUpload.secure_url;
    if (imageUploads.length) {
      updateProductDto.images = imageUploads.map((upload) => upload.secure_url);
    }
    const newProduct = await this.productModel.findByIdAndUpdate(_id, updateProductDto, { new: true });
    if (!newProduct)
      throw new NotFoundException("Product Not found");
    return newProduct;
  }

  async remove(_id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if (!isValid)
      throw new BadRequestException("Invalid Product ID")
    const deletedProduct = await this.productModel.findByIdAndDelete(_id);
    if (!deletedProduct)
      throw new NotFoundException("Product Not found");
    return deletedProduct;
  }
}













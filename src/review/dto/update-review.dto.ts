// import { IsNumber, Max, Min } from "class-validator";
import { CreateReviewDto } from "./create-review.dto";
import { OmitType, PartialType } from "@nestjs/mapped-types";

export class UpdateReviewDto extends PartialType(OmitType(CreateReviewDto, ['product'])) {
    
}

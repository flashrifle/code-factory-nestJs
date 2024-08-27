import { IsOptional, IsString } from 'class-validator';
import { PostsModel } from '../entities/post.entity';
import { PickType } from '@nestjs/mapped-types';

// Pick, Omit, Partial -> Type 반환
// PickType, OmitType, PartialType -> 값 반환

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString()
  @IsOptional()
  image?: string;
}

import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entity/post.entity';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ImageModel } from '../common/entity/image.entity';
import { PostsImagesService } from './image/images.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel, ImageModel]), CommonModule, AuthModule, UsersModule],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule {}

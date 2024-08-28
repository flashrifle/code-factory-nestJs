import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/post.entity';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ImageModel } from '../common/entity/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel, ImageModel]), CommonModule, AuthModule, UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

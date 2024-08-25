import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/post.entity';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH } from '../common/const/path.const';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    CommonModule,
    AuthModule,
    UsersModule,
    MulterModule.register({
      // 파일 크기 제한
      limits: {
        // 바이트 단위로 입력
        fileSize: 10000000,
      },
      fileFilter: (req, file, cb) => {
        /*
      cb(에러 | bool)
      첫번쨰 파라미터는 에러가 있을경우 에러를 넣어줌
      두번째는 파일을 받을지 말지 boolean 을 넣어줌
       */
        // xxx.jpg -> .jpg
        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(new BadRequestException('jpg, jpeg, png 파일만 업로드 가능'), false);
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, POST_IMAGE_PATH);
        },
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

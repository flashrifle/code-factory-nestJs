import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { UsersModel } from '../users/entities/users.entity';
import { User } from '../users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from '../common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { LogInterceptor } from '../common/interceptor/log.interceptor';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  // 1) GET /posts 모든 게시물을 가져온다
  @Get()
  @UseInterceptors(LogInterceptor)
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  // 2) GET /posts/:id
  // id에 해당하는 게시물을 가져온다
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel) {
    await this.postsService.generatePost(user.id);
    return true;
  }

  // 3) POST /posts 게시물을 생성
  /*
  DTO - Data Transfer Object
  A Model, B Model
  Post API -> A 모델을 저장하고, B 모델을 저장한다.
  await repository.save(a);
  await repository.save(b);

  만약에 a를 저장하다 실패하면 b를 저장하면 안될 경우
  all or nothing. - transaction.

  transaction
  start -> 시작
  commit -> 저장
  rollback -> 원상 복구
   */
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPost(@User('id') userId: number, @Body() body: CreatePostDto) {
    // 트랜젝션과 관련된 모든 쿼리를 담당한 쿼리 러너를 생성
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결한다
    await qr.connect();
    // 쿼리 러너에서 트랜잭션을 시작한다
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜잭션 안에서 데이터베이스 액션을 실행할 수 있다.
    await qr.startTransaction();

    // 로직 실행
    try {
      const post = await this.postsService.createPost(userId, body, qr);

      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }

      await qr.commitTransaction();
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (e) {
      // 어떤 에러든 에러가 던져지면 트랜잭션을 종료하고 원래 상태로 되돌린다
      await qr.rollbackTransaction();
      await qr.release();

      throw new InternalServerErrorException(e, '에러가 났습니다.');
    }
  }

  // 4) Patch /posts/:id id에 해당하는 개시물을 변경한다
  @Patch(':id')
  patchPost(@Param('id', ParseIntPipe) id: number, @Body() body: CreatePostDto) {
    return this.postsService.updatePost(id, body);
  }

  // 5) DELETE /posts/:id id에 해당하는 개시물을 삭제
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}

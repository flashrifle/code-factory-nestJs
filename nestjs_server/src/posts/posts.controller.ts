import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Request,
  Patch,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { UsersModel } from '../users/entities/users.entity';
import { User } from '../users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts 모든 게시물을 가져온다
  @Get()
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
    await this.postsService.createPostImage(body);
    return this.postsService.createPost(userId, body);
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

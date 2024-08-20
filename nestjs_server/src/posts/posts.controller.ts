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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { UsersModel } from '../users/entities/users.entity';
import { User } from '../users/decorator/user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts 모든 게시물을 가져온다
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  // id에 해당하는 게시물을 가져온다
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts 게시물을 생성
  @Post('')
  @UseGuards(AccessTokenGuard)
  postPost(@User('id') userId: number, @Body('title') title: string, @Body('content') content: string) {
    return this.postsService.createPost(userId, title, content);
  }

  // 4) PUT /posts/:id id에 해당하는 개시물을 변경한다
  @Put(':id')
  putPost(@Param('id', ParseIntPipe) id: number, @Body('title') title?: string, @Body('content') content?: string) {
    return this.postsService.updatePost(id, title, content);
  }

  // 5) DELETE /posts/:id id에 해당하는 개시물을 삭제
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}

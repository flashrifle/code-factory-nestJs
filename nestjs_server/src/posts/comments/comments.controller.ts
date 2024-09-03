import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from '../../users/decorator/user.decorator';
import { UsersModel } from '../../users/entity/users.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IsPublic } from '../../common/decorator/is-public.decorator';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /*
    1. entity 생성
    author -> 작성자
    post -> 귀속되는 포스트
    comment -> 실제 댓글 내용
    likeCount -> 좋아요 갯수

    id -> primary
    createdAt
    updatedAt

    2. GET() pagination
    3. GET(':commentId') 특정 comment만 하나 가져오는 기능
    4. POST() 코맨트 생성
    5. PATCH(':commentId') 특정 comment 업데이트 하는 기능
    6. DELETE(':commentId') 특정 코맨트만 삭제하는 기능
     */

  @Get()
  @IsPublic()
  getComments(@Param('postId', ParseIntPipe) postId: number, @Query() query: PaginateCommentsDto) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @IsPublic()
  getComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  postComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentsDto,
    @User() user: UsersModel,
  ) {
    return this.commentsService.createComment(body, postId, user);
  }

  @Patch(':commentId')
  async patchComment(@Param('commentId', ParseIntPipe) commentId: number, @Body() body: UpdateCommentDto) {
    return this.commentsService.updateComment(body, commentId);
  }

  @Delete(':commentId')
  async deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.deleteComment(commentId);
  }
}

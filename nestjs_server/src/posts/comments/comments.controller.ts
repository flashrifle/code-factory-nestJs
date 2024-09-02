import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {
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
  }
}

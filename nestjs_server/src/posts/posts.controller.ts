import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PostsService } from './posts.service';

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'author_test',
    title: 'title_test',
    content: 'title_test',
    likeCount: 0,
    commentCount: 0,
  },
  {
    id: 2,
    author: 'author_test2',
    title: 'title_test2',
    content: 'title_test2',
    likeCount: 1,
    commentCount: 1,
  },
  {
    id: 3,
    author: 'author_test3',
    title: 'title_test3',
    content: 'title_test3',
    likeCount: 3,
    commentCount: 3,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts 모든 게시물을 가져온다
  @Get()
  getPosts() {
    return posts;
  }

  // 2) GET /posts/:id
  // id에 해당하는 게시물을 가져온다
  @Get(':id')
  getPost(@Param('id') id: string) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    } else {
      return post;
    }
  }

  // 3) POST /posts 게시물을 변경한다

  // 4) PUT /posts/:id id에 해당하는 개시물을 변경한다

  // 5) DELETE /posts/:id id에 해당하는 개시물을 삭제
}

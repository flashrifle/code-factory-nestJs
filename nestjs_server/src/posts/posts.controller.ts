import { Body, Controller, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
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
  @Post('')
  postPost(@Body('author') author: string, @Body('title') title: string, @Body('content') content: string) {
    const post = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };
    posts = [...posts, post];

    return post;
  }

  // 4) PUT /posts/:id id에 해당하는 개시물을 변경한다
  @Put(':id')
  putPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }
    if (author) {
      post.author = author;
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    posts = posts.map((prevPost) => (prevPost.id === +id ? post : prevPost));
    return post;
  }

  // 5) DELETE /posts/:id id에 해당하는 개시물을 삭제
}

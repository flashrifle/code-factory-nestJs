import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/*
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
 */

interface Post {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

@Controller('post')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('post')
  getPost(): Post {
    return {
      author: 'author_test',
      title: 'title_test',
      content: 'title_test',
      likeCount: 0,
      commentCount: 0,
    };
  }
}

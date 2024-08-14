import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entities/post.entity';

export interface PostModel {
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

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}
  async getAllPosts() {
    return this.postsRepository.find();
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException();
    } else {
      return post;
    }
  }

  async createPost(author: string, title: string, content: string) {
    // 1. create -> 저장할 객체 생성
    // 2. save -> 객체를 저장한다. (create 매서드에서 생성한 객체로)
    const post = this.postsRepository.create({
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });
    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  updatePost(postId: Number, author: string, title: string, content: string) {
    const post = posts.find((post) => post.id === postId);

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

    posts = posts.map((prevPost) => (prevPost.id === postId ? post : prevPost));
    return post;
  }

  deletePost(postId: Number) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }
    posts = posts.filter((post) => post.id !== postId);

    return postId;
  }
}

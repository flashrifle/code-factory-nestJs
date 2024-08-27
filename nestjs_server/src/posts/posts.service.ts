import { BadRequestException, Get, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from '../common/const/env-keys.const';
import { ConfigService } from '@nestjs/config';
import { join, basename } from 'path';
import { POST_IMAGE_PATH, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from '../common/const/path.const';
import { promises } from 'fs';

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}
  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async generatePost(userId: number) {
    {
      for (let i = 0; i < 100; i++) {
        await this.createPost(userId, {
          title: `임의로 생성된 제목 ${i}`,
          content: `임의로 생성된 콘텐츠 ${i}`,
        });
      }
    }
  }

  // 오름차 순으로 정렬하는 페이지네이션만 구현한다.
  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(dto, this.postsRepository, { relations: ['author'] }, 'posts');
    // if (dto.page) {
    //   return this.pagePaginatePosts(dto);
    // } else {
    //   return this.cursorPaginatePosts(dto);
    // }
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    /*
    data: Data[],
    total: number,

    [1],[2],[3],[4]
     */
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};
    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }
    // 1, 2, 3, 4, 5
    const posts = await this.postsRepository.find({
      where,
      // order__createdAt
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    // 해당되는 포스트가 0개 이상이면
    // 마지막 포스트를 가져오고
    // 아니면 null을 반환
    const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);
    if (nextUrl) {
      /*
      DTO 의 키값들을 루핑하면서
      키값에 해당되는 벨류가 존재하면
      param에 그대로 붙여넣는다.

      단 where__id_more_than 값만 lastItem의 마지막 값으로 넣어준다.
       */
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id_more_than';
      } else {
        key = 'where__id_less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }
    /*
    Response

    data : Data[],
    cursor: {
      after: 마지막 데이터의 ID
    },
    count: 응답한 데이터의 갯수
    next: 다음 요청을 할 때 사용할 URL
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({ where: { id }, relations: ['author'] });
    if (!post) {
      throw new NotFoundException();
    } else {
      return post;
    }
  }

  async createPostImage(dto: CreatePostDto) {
    // dto의 이미지 이름을 기반으로 파일의 경로를 생선한다.
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.image);

    try {
      // 파일이 존재하는지 확인
      // 만약 존재하지 않으면 에러르 ㄹ던짐
      await promises.access(tempFilePath);
    } catch (err) {
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }
    //파일의 이름만 가져오기
    // /Users/aaa/bbb/ccc/asdf.jpg => asdf.jpg
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
    // 프로직트경로/public/posts/asdf.jpg
    const newPath = join(POST_IMAGE_PATH, fileName);

    // 파일 옮기기
    await promises.rename(tempFilePath, newPath);
    return true;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    // 1. create -> 저장할 객체 생성
    // 2. save -> 객체를 저장한다. (create 매서드에서 생성한 객체로)
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });
    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;
    // save 의 기능
    // 1. 만약 데이터가 존재하지 않는다면 ( id 기준 ) 새로 생성한다.
    // 2. 만약 데이터가 존재한다면 ( 같은 id 값이 존재 ) 존재하던 값을 업데이트.
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException();
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException();
    }

    const deletePost = await this.postsRepository.delete(postId);

    return deletePost;
  }
}

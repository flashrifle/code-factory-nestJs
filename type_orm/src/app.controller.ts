import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, UserModel } from './entity/user.entity';
import {
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { ProfileModel } from './entity/profile.entity';
import { PostModel } from './entity/post.entity';
import { TagModel } from './entity/tag.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  @Get('users')
  getUsers() {
    return this.userRepository.find({
      // 어떤 프로퍼티를 선택할지
      // select 를 정의하지 않으면 모든 프로퍼티를 가져옴
      // select 를 정의하면 정의된 프로퍼티만 가져옴
      // select: {
      //   id: true,
      //   createAt: true,
      //   updateAt: true,
      //   version: true,
      // },
      // 필터링할 조건을 입력
      // { id: 조건, name: 조건 } => AND
      // [{} , {}] => OR
      where: {
        // ~ 가 아닌 경우
        // id: Not(2),
        // ~ 보다 작은 경우
        // id: LessThan(5),
        // ~ 보다 적거나 같은 경우
        // id: LessThanOrEqual(5),
        // ~ 보다 큰 경우
        // id: MoreThan(5),
        // ~ 보다 같거나 많은 경우
        // id: MoreThanOrEqual(5),
        // 같은 경우
        // id: Equal(5),
        // 유사 값
        // email: Like('%0%'),
        // 대문자 소문자 구분 안하는 유사값
        // email: ILike('%GMAIL%'),
        // 사이 값
        // id: Between(10, 30),
        // 해당되는 여러가지 값
        // id: In([1, 3, 5]),
        // Null인 경우
        // id: IsNull(),
      },
      // 관계를 가져오는 법
      // relations: ['profile'],
      // relations: {
      //   profile: true,
      // },
      // 오름차 ASC 내림차 DESC
      order: {
        id: 'ASC',
      },
      // 처음 몇개를 제외할지
      // skip: 0,
      // 처음부터 몇개를 가져올지
      // take: 1,
    });
  }

  @Post('sample')
  async sample() {
    // 모델에 해당되는 객체 생성 - 저장은 X
    // new UserModel({email : '123124@asdf.com'})
    // const user1 = await this.userRepository.create({
    //   email: 'test@test.com',
    // });

    // DB 저장
    // const user2 = await this.userRepository.save({
    //   email: 'test@test.com',
    // });

    // preload
    // 입력된 값을 기반으로 데이터베이스에 있는 데이터를 불러오고
    // 추가 입력된 값으로 데이터 베이스에서 가져온 값들을 대체
    // 저장하지는 않음
    // const user3 = await this.userRepository.preload({
    //   id: 101,
    //   email: 'example@example.com',
    // });

    // 삭제하기
    // await this.userRepository.delete(101);

    // 숫자 증가
    // await this.userRepository.increment(
    //   {
    //     id: 2,
    //   },
    //   'count',
    //   2,
    // );

    // 숫자 감소
    // await this.userRepository.decrement(
    //   {
    //     id: 2,
    //   },
    //   'count',
    //   2,
    // );

    // 갯수 카운팅
    // const count = await this.userRepository.count({
    //   where: {
    //     email: ILike('%0%'),
    //   },
    // });

    // sum
    // const sum = await this.userRepository.sum('count', {
    //   email: ILike('%0%'),
    // });

    // average
    // const average = await this.userRepository.average('count', {
    //   id: LessThan(5),
    // });

    // 최소값
    // const min = await this.userRepository.minimum('count', {
    //   id: LessThan(5),
    // });

    // 최대 값
    // const max = await this.userRepository.maximum('count', {
    //   id: LessThan(5),
    // });

    // const user = await this.userRepository.find({})

    // const userOne = await this.userRepository.findOne({ where: { id: 3 } });

    // const usersAndCount = await this.userRepository.findAndCount({
    //   take: 3,
    // });
    return true;
  }

  @Post('users')
  async postUser() {
    for (let i = 0; i < 100; i++) {
      await this.userRepository.save({
        email: `user-${i}@gmail.com`,
      });
    }
  }

  @Patch('users/:id')
  async patchUser(@Param('id') id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: parseInt(id),
      },
    });

    return this.userRepository.save({
      ...user,
      email: user.email + 0,
    });
  }
  @Delete('user/profile/:id')
  async deleteUser(@Param('id') id: string) {
    await this.profileRepository.delete(+id);
  }

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: 'flashrifle@gmail.com',
      profile: {
        profileImg: 'asdf.png',
      },
    });
    // const profile = await this.profileRepository.save({
    //   profileImg: 'asdf.jpg',
    //   user,
    // });

    return user;
  }

  @Post('user/post')
  async createUserAndPost() {
    const user = await this.userRepository.save({
      email: 'postuser@gmail.com',
    });

    await this.postRepository.save({
      author: user,
      title: 'post1',
    });

    await this.postRepository.save({
      author: user,
      title: 'post2',
    });

    return user;
  }

  @Post('posts/tags')
  async createPostsTags() {
    const post1 = await this.postRepository.save({
      title: 'Express',
    });

    const post2 = await this.postRepository.save({
      title: 'NestJS',
    });

    const tag1 = await this.tagRepository.save({
      name: 'javascript',
      posts: [post1, post2],
    });

    const tag2 = await this.tagRepository.save({
      name: 'typescript',
      posts: [post2],
    });

    const post3 = await this.postRepository.save({
      title: 'Next.js',
      tags: [tag1, tag2],
    });
    return true;
  }

  @Get('posts')
  getPosts() {
    return this.postRepository.find({
      relations: ['tags'],
    });
  }

  @Get('tags')
  getTags() {
    return this.tagRepository.find({
      relations: ['posts'],
    });
  }
}

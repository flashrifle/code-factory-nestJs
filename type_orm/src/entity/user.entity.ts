import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ProfileModel } from './profile.entity';
import { PostModel } from './post.entity';
import { TagModel } from './tag.entity';

// 특정값 제한
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class UserModel {
  // ID
  //@PrimaryGeneratedColumn() // 자동 ID 생성
  // Primary Column
  // Primary Column 은 모든 테이블에서 기본적으로 존재해야한다.
  // 테이블 안에서 각각의 Row를 구분 할 수 있는 칼럼
  // @PrimaryColumn()

  //@PrimaryGeneratedColumn('uuid)
  // PrimaryGeneratedColumn -> 순서대로 값이 올라감 ex) 1, 2, 3, 4 ~

  // UUID
  // asdfa1234asdf-asdf2234asdf-2324asdfdd-asdfsdf32
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // 제목
  // @Column({
  //   // 데이터베이스에서 인지하는 칼럼 타입
  //   // 자동 유추, 특정 값이 필요하면 넣는다
  //   type: 'varchar',
  //   // 데이터베이스 칼럼 이름
  //   // 프로퍼티 이름으로 자동 유추
  //   name: 'title',
  //   // 값의 길이
  //   // 실제 입력 할 수 있는 글자의 길이가 300
  //   length: 300,
  //   // null 이 가능한지
  //   nullable: true,
  //   // true면 처음 저장할 때만 값 지정 가능
  //   // 이후엔 불가능
  //   update: true,
  //   // find()를 실행할 때 기본으로 값을 불러올지
  //   // 기본값이 true
  //   select: false,
  //   // 기본 값
  //   // 아무것도 입력 안했을 때 들어가는 값
  //   default: 'default value',
  //   // 칼럼 중 유일무이한 값이 돼야 하는지 ex) 이메일 ..
  //   unique: false,
  // })
  // title: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  // 데이터 생성일자
  // 데이터가 생성되는 날짜와 시간이 자동으로 찍힘
  @CreateDateColumn()
  createAt: Date;

  // 데이터 수정일자
  // 데이터가 수정되는 날짜와 시간이 자동으로 찍힘
  @UpdateDateColumn()
  updateAt: Date;

  // 데이터가 업데이트 될 때마다 1씩 올라간다.
  // 처음 생성되면 값은 1
  // save() 함수가 몇 번 불렸는지 기억한다.
  @VersionColumn()
  version: number;

  @Column()
  @Generated('uuid') // auto increment
  additionalId: string;

  @OneToOne(() => ProfileModel, (profile) => profile.user)
  profile: ProfileModel;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel;
}

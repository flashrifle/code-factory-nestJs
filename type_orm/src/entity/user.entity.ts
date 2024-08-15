import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

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

  // 제목
  @Column()
  title: string;

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
  additionalId: number;
}

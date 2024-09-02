import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UsersModel } from '../../users/entity/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { ImageModel } from '../../common/entity/image.entity';
import { CommentsModel } from '../comments/entity/comments.entity';

@Entity()
export class PostsModel extends BaseModel {
  // 1. UsersModel과 연동 한다 외래키를 이용해서
  // 2. null 이 될 수 없다
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @IsString({
    message: stringValidationMessage,
  })
  @Column()
  title: string;

  @IsString({
    message: stringValidationMessage,
  })
  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany(() => ImageModel, (image) => image.post)
  images: ImageModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];
}

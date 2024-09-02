import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { PostsModel } from '../../entity/post.entity';
import { UsersModel } from '../../../users/entity/users.entity';
import { IsNumber, IsString } from 'class-validator';

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.postComments)
  author: UsersModel;

  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;

  @IsString()
  @Column()
  comment: string;

  @IsNumber()
  @Column({
    default: 0,
  })
  likeCount: number;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from '../../posts/entity/post.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsEmail, IsString, Length, ValidationArguments } from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { Exclude, Expose } from 'class-transformer';
import { ChatsModel } from '../../chats/entity/chats.entity';
import { MessagesModel } from '../../chats/messages/entity/messages.entity';
import { CommentsModel } from '../../posts/comments/entity/comments.entity';
import { UserFollowersModel } from './user-followers.entity';

@Entity()
@Exclude()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  @Expose()
  // 1. 길이가 20을 넘지 않을 것
  // 2. 유일무이한 값이 될 것
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString()
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  // 1. 유일무이한 값이 될 것
  email: string;

  @Column()
  @IsString()
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /*
      Request
      frontend -> backend
      plain object (JSON) -> class instance (dto)

      Response
      backend -> frontend
      class instance -> plain object (JSON)

      toClassOnly -> class instance로 변환될 때만
      toPlainOnly -> plain object로 변환될 때만
   */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;

  @OneToMany(() => CommentsModel, (comment) => comment.author)
  postComments: CommentsModel[];

  // 내가 팔로우 하는 사람들
  @OneToMany(() => UserFollowersModel, (ufm) => ufm.follower)
  followers: UsersModel[];

  // 나를 팔로우 하는 사람들
  @OneToMany(() => UserFollowersModel, (ufm) => ufm.followee)
  followees: UsersModel[];
}

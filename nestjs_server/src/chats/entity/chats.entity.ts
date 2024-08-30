import { BaseModel } from '../../common/entity/base.entity';
import { Entity, ManyToMany } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, (user) => user.chats)
  users: UsersModel[];
}

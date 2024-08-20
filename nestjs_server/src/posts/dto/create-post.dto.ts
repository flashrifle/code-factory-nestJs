import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({
    message: 'title은 string타입을 입력해야합니다.',
  })
  title: string;
  @IsString({
    message: 'content는 string타입을 입력해야합니다.',
  })
  content: string;
}

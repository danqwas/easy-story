import { IsString } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  post: string;
}

import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  title: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @IsOptional()
  content: string;

  @IsUrl()
  @IsOptional()
  imageUrl: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @IsOptional()
  description: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @IsOptional()
  slug: string;
}

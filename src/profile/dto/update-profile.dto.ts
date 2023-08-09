import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  biography: string;

  @IsUrl()
  @IsOptional()
  url: string;
}

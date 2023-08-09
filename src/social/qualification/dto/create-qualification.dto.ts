import { IsEnum, IsNumber } from 'class-validator';
import { QualificationValue } from '../interfaces/qualification-value.interface';

export class CreateQualificationDto {
  @IsNumber()
  @IsEnum(QualificationValue)
  value: number;
}

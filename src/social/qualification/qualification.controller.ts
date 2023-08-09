import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { CreateQualificationDto } from './dto/create-qualification.dto';
import { UpdateQualificationDto } from './dto/update-qualification.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Qualifications')
@Controller({
  version: 'v1',
})
export class QualificationController {
  constructor(private readonly qualificationService: QualificationService) {}

  @Post('/posts/:slug/qualifications')
  @Auth()
  create(
    @Body() createQualificationDto: CreateQualificationDto,
    @GetUser() user: User,
    @Param('slug') slug: string,
  ) {
    return this.qualificationService.create(createQualificationDto, user, slug);
  }

  @Get('/posts/:slug/qualifications')
  findAll(@Param('slug') slug: string, @Query() paginationDto: PaginationDto) {
    return this.qualificationService.findAllQualificationsByPost(
      slug,
      paginationDto,
    );
  }

  @Get('/qualifications/:id')
  findOne(@Param('id') id: string) {
    return this.qualificationService.findOnePlain(id);
  }

  @Patch('/qualifications/:id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateQualificationDto: UpdateQualificationDto,
    @GetUser() user: User,
  ) {
    return this.qualificationService.update(id, updateQualificationDto, user);
  }

  @Delete('/qualifications/:id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.qualificationService.remove(id, user);
  }
}

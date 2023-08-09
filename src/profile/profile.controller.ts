import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { ProfileService } from './profile.service';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Profiles')
@Controller({
  path: 'profiles',
  version: 'v1',
})
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':term')
  @Auth()
  findUserProfile(@Param('term') term: string) {
    return this.profileService.findOne(term);
  }

  @Get()
  findAllProfiles(@Query() paginationDto: PaginationDto) {
    return this.profileService.findAllProfiles(paginationDto);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,

    @Body() updateProfileDto: UpdateProfileDto,

    @GetUser() user: User,
  ) {
    return this.profileService.update(id, updateProfileDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.profileService.remove(id, user);
  }
}

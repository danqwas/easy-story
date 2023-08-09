import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Bookmarks')
@Controller({
  path: 'bookmarks',
  version: 'v1',
})
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post('/posts/:slug/bookmarks')
  @Auth()
  create(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @GetUser() user: User,
    @Param('slug') slug: string,
  ) {
    return this.bookmarkService.create(createBookmarkDto, user, slug);
  }

  @Get('/my-bookmarks')
  @Auth()
  findAllByUser(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.bookmarkService.findAllByUser(paginationDto, user);
  }

  @Delete('/bookmarks/:id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.bookmarkService.remove(id, user);
  }
}

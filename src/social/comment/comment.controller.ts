import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Comments')
@Controller({
  version: 'v1',
})
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Post('posts/:slug/comments')
  @Auth()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
    @Param('slug') slug: string,
  ) {
    return this.commentService.create(createCommentDto, user, slug);
  }

  @Get('/posts/:slug/comments')
  findAllByPost(
    @Query() paginationDto: PaginationDto,
    @Param('slug') slug: string,
  ) {
    return this.commentService.findAllByPost(paginationDto, slug);
  }

  @Get('/comments/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentService.findOnePlain(id);
  }

  @Patch('/comments/:id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentService.update(id, updateCommentDto, user);
  }

  @Delete('/comments/:id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.commentService.remove(id, user);
  }
}

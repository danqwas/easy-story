import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PostService } from '../post/post.service';

@Injectable()
export class CommentService {
  private readonly logger = new Logger('CommentService');
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly dataSource: DataSource,
    private readonly postsService: PostService,
  ) {}
  async create(createCommentDto: CreateCommentDto, user: User, slug: string) {
    try {
      const post = await this.postsService.findOne(slug);
      const comment = await this.commentRepository.create({
        ...createCommentDto,
        user,
        post,
      });
      await this.commentRepository.save(comment);
      return comment;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllByPost(pagination: PaginationDto, slug: string) {
    const { limit = 10, offset = 0 } = pagination;
    const comments = await this.commentRepository.find({
      take: limit,
      skip: offset,
      where: {
        post: {
          slug,
        },
      },
      relations: {
        user: true,
      },
    });
    return comments.map((comment) => {
      return {
        ...comment,
        post: {
          title: comment.post.title,
          slug: comment.post.slug,
        },
        user: {
          fullName: comment.user.fullName,
        },
      };
    });
  }

  async findOne(id: string) {
    let comment: Comment;
    try {
      comment = await this.commentRepository.findOne({
        where: { id },
        relations: {
          user: true,
          post: true,
        },
      });
      if (!comment) {
        throw new NotFoundException(`Comment #${id} not found`);
      }
      return comment;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment_data = await this.findOne(id);
    if (comment_data.user.id !== user.id) {
      throw new BadRequestException(`User is not the owner of this post`);
    }
    const comment = await this.commentRepository.preload({
      id,
      ...updateCommentDto,
      user,
    });
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(comment);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, user: User) {
    try {
      const comment = await this.findOne(id);

      if (comment.user.id !== user.id) {
        throw new BadRequestException(`User is not the owner of this comment`);
      }
      await this.commentRepository.remove(comment);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOnePlain(id: string) {
    const { user, post, ...comment } = await this.findOne(id);
    return {
      ...comment,
      post: {
        title: post.title,
        slug: post.slug,
      },
      user: {
        fullName: user.fullName,
      },
    };
  }
  handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.status === 404)
      throw new NotFoundException(error.response.message);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class PostService {
  private readonly logger = new Logger('PostService');

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createPostDto: CreatePostDto, user: User) {
    try {
      const post = await this.postRepository.create({
        ...createPostDto,
        user,
      });
      await this.postRepository.save(post);
      return post;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const posts = await this.postRepository.find({
      take: limit,
      skip: offset,
      relations: {
        user: true,
      },
    });
    return posts.map((post) => {
      return {
        ...post,
        user: {
          fullName: post.user.fullName,
        },
      };
    });
  }

  async findOne(term: string) {
    let post: Post;
    if (isUUID(term)) {
      return await this.postRepository.findOne({
        where: { id: term },
        relations: {
          user: true,
        },
      });
    } else {
      const queryBuilder = await this.postRepository.createQueryBuilder('post');
      post = await queryBuilder
        .where('UPPER(title) = :title or post.slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('post.user', 'user')
        .getOne();
    }
    if (!post) {
      throw new NotFoundException(`Post not found`);
    }
    return post;
  }

  async findOnePlain(term: string) {
    const { user, ...post } = await this.findOne(term);
    return {
      ...post,
      user: {
        fullName: user.fullName,
      },
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User) {
    const post = await this.postRepository.preload({
      id,
      ...updatePostDto,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      post.user = user;
      await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, user: User) {
    try {
      const post = await this.findOne(id);
      if (post.user.id !== user.id) {
        throw new BadRequestException(`User is not the owner of this post`);
      }
      await this.postRepository.remove(post);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}

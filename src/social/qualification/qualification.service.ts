import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateQualificationDto } from './dto/create-qualification.dto';
import { UpdateQualificationDto } from './dto/update-qualification.dto';
import { User } from 'src/auth/entities/user.entity';

import { Qualification } from './entities/qualification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../post/entities/post.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class QualificationService {
  private readonly logger = new Logger('QualificationService');
  constructor(
    @InjectRepository(Qualification)
    private readonly qualificationRepository: Repository<Qualification>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createQualificationDto: CreateQualificationDto,
    user: User,
    slug: string,
  ) {
    try {
      const post = await this.postRepository.findOne({
        where: { slug: slug },
        relations: {
          qualifications: { user: true },
        },
      });
      if (post.qualifications.some((q) => q.user.id === user.id)) {
        throw new BadRequestException('User already has a qualification');
      }
      const qualification = await this.qualificationRepository.create({
        ...createQualificationDto,
        user,
        post,
      });
      await this.qualificationRepository.save(qualification);
      return qualification;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllQualificationsByPost(
    slug: string,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;
    const qualifications = await this.qualificationRepository.find({
      take: limit,
      skip: offset,
      where: {
        post: {
          slug,
        },
      },
      relations: {
        user: true,
        post: true,
      },
    });
    return qualifications.map((qualification) => {
      return {
        ...qualification,
        post: {
          title: qualification.post.title,
          slug: qualification.post.slug,
        },
        user: {
          fullName: qualification.user.fullName,
        },
      };
    });
  }

  async findOne(id: string) {
    let qualification: Qualification;
    try {
      qualification = await this.qualificationRepository.findOne({
        where: { id },
        relations: {
          user: true,
          post: true,
        },
      });
      if (!qualification) {
        throw new NotFoundException(`Qualification #${id} not found`);
      }
      return qualification;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOnePlain(id: string) {
    const { user, post, ...qualification } = await this.findOne(id);
    return {
      ...qualification,
      post: {
        title: post.title,
        slug: post.slug,
      },
      user: {
        fullName: user.fullName,
      },
    };
  }
  async update(
    id: string,
    updateQualificationDto: UpdateQualificationDto,
    user: User,
  ) {
    const qualificationData = await this.findOne(id);

    if (qualificationData.user.id !== user.id) {
      throw new BadRequestException(`User is not the owner of this post`);
    }
    const qualification = await this.qualificationRepository.preload({
      id,
      ...updateQualificationDto,
      user,
    });
    if (!qualification) {
      throw new NotFoundException(`Qualification #${id} not found`);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(qualification);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, user: User) {
    try {
      const qualification = await this.findOne(id);
      if (qualification.user.id !== user.id) {
        throw new BadRequestException(
          `User is not the owner of this qualification`,
        );
      }
      await this.qualificationRepository.remove(qualification);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.status === 404)
      throw new NotFoundException(error.response.message);
    if (error.status === 400)
      throw new BadRequestException(error.response.message);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}

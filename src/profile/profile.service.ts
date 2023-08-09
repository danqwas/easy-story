import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/auth/entities/user.entity';
import { Profile } from './entities/profile.entity';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger('ProfileService');
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findOne(term: string) {
    let profile: Profile;
    if (isUUID(term)) {
      profile = await this.profileRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = await this.profileRepository.createQueryBuilder(
        'profile',
      );

      profile = await queryBuilder
        .where('profile.userName = :userName', { userName: term })
        .leftJoinAndSelect('profile.user', 'user')
        .getOne();
    }
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto, user: User) {
    const profile = await this.profileRepository.preload({
      id,
      ...updateProfileDto,
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      profile.user = user;
      await queryRunner.manager.save(profile);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      delete profile.user;

      return profile;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllProfiles(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const profiles = await this.profileRepository.find({
      take: limit,
      skip: offset,
      relations: {
        user: true,
      },
    });
    return profiles.map((profile) => {
      return {
        ...profile,
        user: profile.user.fullName,
      };
    });
  }
  async remove(id: string, user: User) {
    const profile = await this.findOne(id);

    try {
      if (profile.user.id !== user.id) {
        throw new BadRequestException('You can not delete this profile');
      }

      await Promise.all([
        this.profileRepository.remove(profile),
        this.userRepository.remove(profile.user),
      ]);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  private handleDBExceptions(error: any) {
    if (error.status === 400)
      throw new BadRequestException(error.response.message);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}

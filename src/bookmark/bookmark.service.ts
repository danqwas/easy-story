import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { PostService } from 'src/social/post/post.service';

@Injectable()
export class BookmarkService {
  private readonly logger = new Logger('BookmarkService');
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    private readonly postsService: PostService,
  ) {}
  async create(createBookmarkDto: CreateBookmarkDto, user: User, slug: string) {
    try {
      const bookmarkExists = await this.bookmarkRepository.findOne({
        where: {
          post: {
            slug,
          },
          user: {
            id: user.id,
          },
        },
      });
      if (bookmarkExists) {
        throw new BadRequestException('Bookmark already exists');
      }
      const bookmark = await this.bookmarkRepository.create({
        ...createBookmarkDto,
        user,
        post: await this.postsService.findOne(slug),
      });
      await this.bookmarkRepository.save(bookmark);
      return bookmark;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllByUser(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
    const bookmarks = await this.bookmarkRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: {
        post: true,
      },

      take: limit,
      skip: offset,
    });
    return bookmarks.map((bookmark) => {
      return {
        ...bookmark,
        post: {
          title: bookmark.post.title,
          slug: bookmark.post.slug,
          content: bookmark.post.content,
          imageUrl: bookmark.post.imageUrl,
          description: bookmark.post.description,
        },
      };
    });
  }

  async remove(id: string, user: User) {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: {
          id: id,
          user: {
            id: user.id,
          },
        },
      });
      if (!bookmark) {
        throw new BadRequestException(`Bookmark #${id} not found`);
      }
      await this.bookmarkRepository.remove(bookmark);
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

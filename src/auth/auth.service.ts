import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, userName, biography, ...userData } = createUserDto;
      const profileData = { userName, biography, url: '' };

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      const createdUser = await this.createUserAndProfile(user, profileData);

      return {
        ...createdUser,
        token: this.getJsonWebToken({ id: createdUser.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private async createUserAndProfile(
    user: User,
    profileData: Partial<Profile>,
  ) {
    return this.entityManager.transaction(async (transactionManager) => {
      const profile = new Profile();
      Object.assign(profile, profileData);
      user.profile = profile;

      await transactionManager.save(profile);
      return transactionManager.save(user);
    });
  }
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!user)
      throw new UnauthorizedException('Credentials are not Valid (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not Valid (password)');

    return { ...user, token: this.getJsonWebToken({ id: user.id }) };
  }
  getJsonWebToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  checkAuthStatus(user: User) {
    return { ...user, token: this.getJsonWebToken({ id: user.id }) };
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}

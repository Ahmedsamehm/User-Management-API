import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

import { CryptoUtil } from 'src/common/utils/crypto.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from 'src/common/interfaces/user.interfaces';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoUtil: CryptoUtil,
  ) {}

  private async findUser(id: string): Promise<IUser> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async findOneByEmail(email: string): Promise<IUser> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new NotFoundException('email not found');
    return user;
  }
  async createUser(userData: CreateUserDto): Promise<IUser> {
    const emailExist = await this.findOneByEmail(userData.email);

    if (emailExist) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await this.cryptoUtil.hash(userData.password);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findAllUsers(): Promise<IUser[]> {
    const users = await this.userRepository.find();

    return users;
  }
  async findUserById(id: string): Promise<IUser> {
    const user = await this.findUser(id);
    return user;
  }
  async updateUser(id: string, userData: UpdateUserDto): Promise<IUser> {
    const user = await this.findUser(id);
    const updatedUser = this.userRepository.merge(user, userData);
    return await this.userRepository.save(updatedUser);
  }
}

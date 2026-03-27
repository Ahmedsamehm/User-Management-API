import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from 'src/common/interfaces/user.interfaces';
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: CreateUserDto): Promise<IUser> {
    return await this.userService.createUser(body);
  }

  @Get()
  async findAll(): Promise<IUser[]> {
    return await this.userService.findAllUsers();
  }
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<IUser> {
    return await this.userService.findUserById(id);
  }
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<IUser> {
    return await this.userService.updateUser(id, body);
  }
}

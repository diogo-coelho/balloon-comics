import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { AuthTokenGuard } from '../auth/guards/auth-token.guard';
import { TokenPayloadParam } from '../auth/decorators/token-payload.param';
import { TokenPayloadDto } from '../auth/dtos/request/token-payload.dto';

import { CreateUserDto } from './dtos/request/create-user.dto';
import { UpdateUserDto } from './dtos/request/update-user.dto';
import { ResponseUserDto } from './dtos/response/response-user.dto';
import { ResponseUpdatedUserDto } from './dtos/response/response-updated-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/me')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseUserDto> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthTokenGuard)
  @Patch('/me/:id')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ): Promise<ResponseUpdatedUserDto> {
    return this.userService.updateUser(id, updateUserDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete('/me/:id')
  async deleteUser(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ): Promise<void> {
    return this.userService.deleteUser(id, tokenPayload);
  }
}

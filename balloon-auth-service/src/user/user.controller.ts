import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseUserDto> {
    const responseData = await this.userService.createUser(createUserDto);

    response.cookie("accessToken", responseData.accessToken as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
    
    response.cookie("refreshToken", responseData.refreshToken as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
    });

    return responseData;
  }

  @UseGuards(AuthTokenGuard)
  @Patch('/:id')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ): Promise<ResponseUpdatedUserDto> {
    return this.userService.updateUser(id, updateUserDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete('/:id')
  async deleteUser(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ): Promise<void> {
    return this.userService.deleteUser(id, tokenPayload);
  }
}

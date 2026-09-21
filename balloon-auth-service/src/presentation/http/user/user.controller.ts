import type { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/user/use-cases/create-user.use-case';
import { ResponseUserDto } from './dtos/response/response-user.dto';
import { TokenPayloadParam } from '../decorators/token-payload.param';
import { UpdateUserUseCase } from '../../../application/user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../../application/user/use-cases/delete-user.use-case';
import { UpdateUserDto } from './dtos/request/update-user.dto';
import { AuthTokenGuard } from '../guards/auth-token.guard';
import { CreateUserDto } from './dtos/request/create-user.dto';
import { TokenPayloadDto } from '../auth/dtos/request/token-payload.dto';
import HttpCookies from '../cookies/http-cookies';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly httpCookies: HttpCookies,
  ) {}

  @Post('/me')
  async create(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseUserDto> {
    const { accessToken, refreshToken, user } = await this.createUser.execute({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    this.httpCookies.setAccessTokenCookie(response, accessToken);
    this.httpCookies.setRefreshTokenCookie(response, refreshToken);

    return {
      message: 'Usuário criado com sucesso',
      data: {
        user,
      },
    };
  }

  @UseGuards(AuthTokenGuard)
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.updateUser.execute({
      id,
      requesterId: tokenPayload.sub,
      ...updateUserDto,
    });

    return {
      message: 'Usuário atualizado com sucesso',
      data: {
        user,
      },
    };
  }

  @UseGuards(AuthTokenGuard)
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    await this.deleteUser.execute({ id, requesterId: tokenPayload.sub });

    return {
      message: 'Usuário deletado com sucesso',
    };
  }
}

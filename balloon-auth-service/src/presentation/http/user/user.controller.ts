import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserUseCase } from "../../../application/user/use-cases/create-user.use-case";
import { CreateUserDto } from "../../../user/dtos/request/create-user.dto";
import { ResponseUserDto } from "./dtos/response/response-user.dto";

@Controller('users')
export class UserController {

  constructor(
    private readonly createUser: CreateUserUseCase
  ) {}

  @Post('/me')
  async create(
    @Body() dto: CreateUserDto
  ): Promise<ResponseUserDto> {
    const user = await this.createUser.execute({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    return {
      message: 'Usuário criado com sucesso',
      data: {
        user,
      }
    }
  }
  
}
import { Controller, Post, Body } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos/request/create-user.dto";
import { ResponseUserDto } from "./dtos/response/response-user.dto";

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return this.userService.createUser(createUserDto);
  }

}
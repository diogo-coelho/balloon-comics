import { Controller, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { UserService } from "./user.service";

import { CreateUserDto } from "./dtos/request/create-user.dto";
import { ResponseUserDto } from "./dtos/response/response-user.dto";
import { ResponseUpdatedUserDto } from "./dtos/response/response-updated-user.dto";
import { UpdateUserDto } from "./dtos/request/update-user.dto";

@Controller('users')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return this.userService.createUser(createUserDto);
  }

  @Patch('update/:id')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto, 
    @Param('id') id: string): Promise<ResponseUpdatedUserDto> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }

}
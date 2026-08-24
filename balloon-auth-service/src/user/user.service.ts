import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClientProxy } from "@nestjs/microservices/client/client-proxy";
import { Repository } from "typeorm";

import { UserEntity } from "./entities/user.entity";
import { ResponseUserDto } from "./dtos/response/response-user.dto";
import { CreateUserDto } from "./dtos/request/create-user.dto";
import { HashingServiceProtocol } from "../auth/hashing/hashing.service";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly hashingService: HashingServiceProtocol,
    private readonly authService: AuthService,
    @Inject("RABBITMQ_SERVICE")
    private readonly client: ClientProxy, 
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    try {
      const user = {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash: await this.hashingService.hash(createUserDto.password),
      };

      const newUser = this.userRepository.create(user);
      await this.userRepository.save(newUser);

      const accessToken = await this.authService.getAccessToken(newUser.id!, newUser.username!, newUser.email!);
      const nextUrl = await this.authService.getNextUrl('\/reader\/create');

      this.client.emit('user_created', { 
        userId: newUser.id, 
        username: newUser.username, 
        email: newUser.email 
      });

      return { 
        message: 'Usuário criado com sucesso', 
        data: { 
          accessToken: accessToken,
        },
        next: nextUrl,
        statusCode: 201 
      };
    } catch (error: Error | undefined | any) {
      return Promise.reject({ 
        message: 'Erro ao tentar criar um usuário', 
        error,
        statusCode: error.status || 500
      }); 
    }
  }
  
}
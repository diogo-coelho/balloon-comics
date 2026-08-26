import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class PostgresConfigService implements TypeOrmOptionsFactory {

  constructor(private readonly configService: ConfigService) {}
  
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('PG_DATABASE_HOST'),
      port: this.configService.get<number>('PG_DATABASE_PORT'),
      username: this.configService.get<string>('PG_DATABASE_USERNAME'),
      password: this.configService.get<string>('PG_DATABASE_PASSWORD'),
      database: this.configService.get<string>('PG_DATABASE_NAME'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    };
  }
}
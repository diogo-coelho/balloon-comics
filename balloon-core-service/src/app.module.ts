import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReaderModule } from './reader/reader.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_DATABASE_HOST,
      port: Number(process.env.PG_DATABASE_PORT),
      database: process.env.PG_DATABASE_NAME,
      username: process.env.PG_DATABASE_USERNAME,
      password: process.env.PG_DATABASE_PASSWORD,
      autoLoadEntities: true,
    }),
    ReaderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

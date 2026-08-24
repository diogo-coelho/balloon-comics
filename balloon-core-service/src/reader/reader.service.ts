import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ReaderEntity } from "./entities/reader.entity";
import { CreateReaderDto } from "./dtos/request/create-reader.dto";
import { UserQueueDto } from "./dtos/request/user-queue.dto";

@Injectable()
export class ReaderService {
  
  constructor(
    @InjectRepository(ReaderEntity)
    private readonly readerRepository: Repository<ReaderEntity>
  ){}

  async createReaderByQueue(user: UserQueueDto): Promise<void> {
    try {
      const readerData: CreateReaderDto = {
        userId: user.userId,
        email: user.email,
        username: user.username
      };

      const reader = this.readerRepository.create(readerData);
      await this.readerRepository.save(reader);
    } catch (error: Error | any | undefined) {
      console.error('Erro ao criar leitor a partir da fila: ', error?.message || 'Erro desconhecido');
    }
  }

  async createReader(createReaderDto: CreateReaderDto): Promise<any> {
    try {
      const existingReader = await this.readerRepository.findOne({ where: { userId: createReaderDto.userId } });

      if (existingReader) {
        const updatedReader = await this.readerRepository.update(existingReader.id as string, { ...createReaderDto, updatedAt: new Date() });
        return {
          message: 'Leitor atualizado com sucesso',
          data: updatedReader.raw.affectedRows ? { ...existingReader, ...createReaderDto } : existingReader,
          statusCode: 200
        };
      }

      const reader = this.readerRepository.create(createReaderDto);
      const insertedReader = await this.readerRepository.save(reader);
      return {
        message: 'Leitor criado com sucesso',
        data: insertedReader,
        statusCode: 201
      };

    } catch (error: Error | any | undefined) {
      return {
        message: 'Erro ao criar ou atualizar leitor',
        error: error?.message || 'Erro desconhecido',
        statusCode: error?.status || 500
      };
    }
  }  
  
}
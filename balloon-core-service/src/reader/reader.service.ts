import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ReaderEntity } from "./entities/reader.entity";
import { CreateReaderDto } from "./dtos/request/create-reader.dto";

@Injectable()
export class ReaderService {
  
  constructor(
    @InjectRepository(ReaderEntity)
    private readonly readerRepository: Repository<ReaderEntity>
  ){}

  async createReader(createReaderDto: CreateReaderDto): Promise<any> {
    try {
      const existingReader = await this.readerRepository.findOne({ where: { userId: createReaderDto.userId } });

      if (existingReader) {
        const updatedReader = await this.readerRepository.update(existingReader.id as string, createReaderDto);
        return {
          message: 'Leitor atualizado com sucesso',
          data: updatedReader,
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
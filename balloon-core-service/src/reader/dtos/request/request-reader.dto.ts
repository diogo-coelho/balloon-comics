import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class RequestReaderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  readonly name?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Imagem inválida' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Descrição inválida' })
  readonly description?: string;
}

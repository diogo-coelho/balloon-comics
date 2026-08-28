import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
export class UploadReaderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  readonly name?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Descrição inválida' })
  readonly description?: string;
}

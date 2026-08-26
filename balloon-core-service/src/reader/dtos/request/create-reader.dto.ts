import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateReaderDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID é obrigatório' })
  readonly userId!: string;

  @IsEmail({}, { message: 'Email inválido' })
  readonly email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Username é obrigatório' })
  readonly username!: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  readonly name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL de imagem inválida' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Descrição não pode ser vazia' })
  readonly description?: string;
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateReaderDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID é obrigatório' })
  readonly userId?: string;

  @IsEmail({}, { message: 'Email inválido' })
  readonly email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Username é obrigatório' })
  readonly username?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  readonly name?: string;

  @IsString()
  @IsNotEmpty()
  readonly imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  readonly description?: string;
}
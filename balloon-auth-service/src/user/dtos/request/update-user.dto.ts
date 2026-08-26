import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nome de usuário não pode ser vazio' })
  readonly username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  readonly email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Senha não pode ser vazia' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Senha deve possuir pelo menos uma letra maiúscula, uma letra minúscula e um caractere especial',
  })
  readonly password?: string;
}

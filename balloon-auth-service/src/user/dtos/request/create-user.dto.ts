import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome de usuário não pode ser vazio' })
  @MinLength(3, { message: 'Nome de usuário deve ter no mínimo 3 caracteres' })
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, {
    message: 'O usuário deve ter entre 3 e 20 caracteres e pode conter apenas letras, números e underscores',
  })
  readonly username!: string;

  @IsEmail({}, { message: 'Email inválido' })
  readonly email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha não pode ser vazia' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Senha deve possuir pelo menos uma letra maiúscula, uma letra minúscula e um caractere especial',
  })
  readonly password!: string;
}

import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty({ message: "Senha não pode ser vazia" })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Senha deve possuir pelo menos uma letra maiúscula, uma letra minúscula e um caractere especial',
  })
  readonly password!: string;
}
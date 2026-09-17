export class TokenPayloadDto {
  readonly sub!: string;
  readonly email!: string;
  readonly username!: string;
  readonly iat!: number;
  readonly exp!: number;
  readonly aud!: string;
  readonly iss!: string;
}

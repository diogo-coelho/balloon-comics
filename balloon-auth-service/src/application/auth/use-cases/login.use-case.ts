import InvalidCredentialsError from "../../../domain/auth/errors/invalid-credentials.error";
import { PasswordHasherPort } from "../../ports/password-hasher.port";
import { TokenServicePort } from "../../ports/token-service.port";
import { UserRepositoryPort } from "../../ports/user.repository.port";
import { LoginInput, LoginOutput } from "../../types/auth";

export class LoginUseCase {  
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError('Email e/ou senha inválidos');
    const validPassword = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!validPassword) throw new InvalidCredentialsError('Email e/ou senha inválidos');

    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);
    user.setRefreshTokenHash(refreshToken);

    await this.users.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email
      }
    }
  }
}
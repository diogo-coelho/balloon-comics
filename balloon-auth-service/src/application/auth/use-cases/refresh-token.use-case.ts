import InvalidRefreshTokenError from '../../../domain/auth/errors/invalid-refresh-token.error';
import { User } from '../../../domain/user/entities/user';
import { AuthUnitOfWorkPort } from '../../ports/auth-unit-of-work.port';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { TokenServicePort } from '../../ports/token-service.port';
import {
  RefreshTokenInput,
  RefreshTokenOutput,
  TokenPayload,
} from '../../types/auth';

export class RefreshTokenUseCase {
  constructor(
    private readonly unitOfWork: AuthUnitOfWorkPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    let payload: TokenPayload;

    try {
      payload = await this.tokenService.verify(input.refreshToken);
    } catch (error: unknown) {
      throw new InvalidRefreshTokenError();
    }

    if (payload.tokenType !== 'refresh') throw new InvalidRefreshTokenError();

    const result = await this.unitOfWork.execute(async (transaction) => {
      const user: User = await transaction.users.findByIdForUpdate(payload.sub);

      if (!user) return { valid: false as const };
      const userRefreshTokenHash = user.getRefreshTokenHash();
      if (!userRefreshTokenHash) return { valid: false as const };

      const tokenMatches = await this.passwordHasher.compare(
        input.refreshToken,
        userRefreshTokenHash,
      );
      if (!tokenMatches) {
        user.clearRefreshTokenHash();
        await transaction.users.save(user);
        return { valid: false as const };
      }

      const accessToken = await this.tokenService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });
      const refreshToken = await this.tokenService.generateRefreshToken(
        user.id,
      );
      const refreshTokenHash = await this.passwordHasher.hash(refreshToken);
      user.setRefreshTokenHash(refreshTokenHash);
      await transaction.users.save(user);

      return {
        valid: true as const,
        accessToken,
        refreshToken,
      };
    });

    if (!result.valid) throw new InvalidRefreshTokenError();

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}

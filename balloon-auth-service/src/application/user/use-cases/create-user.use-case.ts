import { CreateUserInput, CreateUserOutput } from '../../types/user';
import { User } from '../../../domain/user/entities/user';
import { UserCreatedEvent } from '../../../domain/user/events/user-created.event';
import { AuthUnitOfWorkPort } from '../../ports/auth-unit-of-work.port';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import EmailAlreadyInUseError from '../../../domain/user/errors/email-already-in-use.error';
import { TokenServicePort } from '../../ports/token-service.port';

export class CreateUserUseCase {
  constructor(
    private readonly unitOfWork: AuthUnitOfWorkPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const passwordHash = await this.passwordHasher.hash(input.password);

    return await this.unitOfWork.execute(async (transaction) => {
      const existingUser = await transaction.users.findByEmail(input.email);

      if (existingUser)
        throw new EmailAlreadyInUseError('Email já existe no banco de dados');

      const user = User.create({
        username: input.username,
        email: input.email,
        passwordHash,
      });

      await transaction.users.save(user);

      const event = new UserCreatedEvent(user.id, user.eventVersion, {
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      await transaction.outbox.save(event);

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
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    });
  }
}

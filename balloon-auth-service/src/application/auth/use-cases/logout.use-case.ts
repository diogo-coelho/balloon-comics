import { UserRepositoryPort } from "../../ports/user.repository.port";

export class LogoutUseCase {
  
  constructor(
    private readonly users: UserRepositoryPort
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.users.findById(userId);

    if (!user) return;

    user.clearRefreshTokenHash();
    
    await this.users.save(user);
  }
}
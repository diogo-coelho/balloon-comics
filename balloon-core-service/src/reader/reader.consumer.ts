import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

import { ReaderService } from "./reader.service";
import { UserQueueDto } from "./dtos/request/user-queue.dto";

@Controller()
export class ReaderConsumer {

  constructor(private readonly readerService: ReaderService) {}

  @EventPattern('user.created')
  async createReaderByAuthUserCreated(user: UserQueueDto): Promise<void> {
    await this.readerService.createReaderByQueue(user);
  }

  @EventPattern('user.updated')
  async updateReaderByAuthUserUpdated(user: UserQueueDto): Promise<void> {
    await this.readerService.updateReaderByQueue(user);
  }

  @EventPattern('user.deleted')
  async deleteReaderByAuthUserDeleted(user: UserQueueDto): Promise<void> {
    await this.readerService.deleteReaderByQueue(user);
  }

}
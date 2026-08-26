import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";

import { ROUTING_KEYS } from "./constants/routing-keys.constant";
import { ReaderService } from "./reader.service";
import { UserQueueDto } from "./dtos/request/user-queue.dto";
import type { IntegrationEvent } from "./dtos/request/integration-event.dto";

@Controller()
export class ReaderConsumer {

  private readonly logger = new Logger(ReaderConsumer.name);

  constructor(private readonly readerService: ReaderService) {}

  @EventPattern(ROUTING_KEYS.USER_CREATED)
  async userCreated(@Payload() event: IntegrationEvent<UserQueueDto>, @Ctx()context: RmqContext): Promise<void> {
    await this.process(context, () => this.readerService.handleUserCreated(event));
  }

  @EventPattern(ROUTING_KEYS.USER_UPDATED)
  async userUpdated(@Payload() event: IntegrationEvent<UserQueueDto>, @Ctx() context: RmqContext): Promise<void> {
    await this.process(context, () => this.readerService.handleUserUpdated(event));
  }

  @EventPattern(ROUTING_KEYS.USER_DELETED)
  async userDeleted(@Payload() event: IntegrationEvent<UserQueueDto>, @Ctx() context: RmqContext): Promise<void> {
    await this.process(context, () => this.readerService.handleUserDeleted(event));
  }

  private async process(context: RmqContext, handler: () => Promise<void>): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await handler();
      channel.ack(message);
    } catch (error: Error | any | undefined) {
      this.logger.error('Erro ao processar mensagem RabbitMQ', error instanceof Error
          ? error.stack
          : undefined,
        );

      channel.nack(message, false, false);
    }
  }

}
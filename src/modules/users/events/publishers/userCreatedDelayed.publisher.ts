import { IRabbitMQPublisher } from "@src/packages/rabbitmq/interfaces/rabbitMQ.publisher";
import { UserCreatedEvent } from "../user.event";
import rabbitMQService, {
  RabbitMQService,
} from "@src/packages/rabbitmq/rabbitMQ.service";

export class UserCreatedDelayedPublisher
  implements IRabbitMQPublisher<UserCreatedEvent>
{
  exchange = "user-events";
  routingKey = "user.created";

  constructor(private readonly rabbitmq: RabbitMQService) {}

  async publish(
    data: UserCreatedEvent,
    options: { delayMs: number }
  ): Promise<void> {
    await this.rabbitmq.publishDelayed<UserCreatedEvent>(
      this.exchange,
      this.routingKey,
      data,
      options.delayMs
    );
  }
}

export default new UserCreatedDelayedPublisher(rabbitMQService);

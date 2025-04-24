import { IRabbitMQPublisher } from "@src/packages/rabbitmq/interfaces/rabbitMQ.publisher";
import { UserCreatedEvent } from "../user.event";
import rabbitMQService, {
  RabbitMQService,
} from "@src/packages/rabbitmq/rabbitMQ.service";

export class UserCreatedPluginDelayedPublisher
  implements IRabbitMQPublisher<UserCreatedEvent>
{
  exchange = "user-events-delayed";
  routingKey = "user.created";

  constructor(private readonly rabbitmq: RabbitMQService) {}

  async publish(
    data: UserCreatedEvent,
    options: { delayMs: number }
  ): Promise<void> {
    await this.rabbitmq.publishWithPluginDelay<UserCreatedEvent>(
      this.exchange,
      this.routingKey,
      data,
      options.delayMs
    );
  }
}

export default new UserCreatedPluginDelayedPublisher(rabbitMQService);

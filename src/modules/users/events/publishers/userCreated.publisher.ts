import { IRabbitMQPublisher } from "@src/packages/rabbitmq/interfaces/rabbitMQ.publisher";
import rabbitMQService, {
  RabbitMQService,
} from "@src/packages/rabbitmq/rabbitMQ.service";

import { UserCreatedEvent } from "@src/modules/users/events/user.event";

export class UserCreatedPublisher
  implements IRabbitMQPublisher<UserCreatedEvent>
{
  routingKey = "user.created";
  exchange = "user-events";

  constructor(private rabbitmq: RabbitMQService) {}

  async publish(data: UserCreatedEvent): Promise<void> {
    await this.rabbitmq.assertExchange(this.exchange, "topic");
    await this.rabbitmq.publish(this.exchange, this.routingKey, data);
  }
}

export default new UserCreatedPublisher(rabbitMQService);

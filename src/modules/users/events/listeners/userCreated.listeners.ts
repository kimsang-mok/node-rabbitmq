import { BaseRabbitMQListener } from "@src/packages/rabbitmq/baseRabbitMQ.listener";
import rabbitMQService, {
  RabbitMQService,
} from "@src/packages/rabbitmq/rabbitMQ.service";
import { UserCreatedEvent } from "@src/packages/rabbitmq/types/user.event";

export class UserCreatedListener extends BaseRabbitMQListener<UserCreatedEvent> {
  exchange = "user-events";
  queue = "user-created-worker";
  routingKey = "user.created";

  constructor(rabbitmq: RabbitMQService) {
    super(rabbitmq);
  }

  protected async onMessage(data: UserCreatedEvent): Promise<void> {
    console.log("[UserCreatedListener] Received:", data);

    if (data.name === "Fail Test") {
      throw new Error("Simulated failure for retry");
    }

    console.log("[UserCreatedListener] Processed successfully.");
  }
}

export default new UserCreatedListener(rabbitMQService);

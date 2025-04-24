import { BaseRabbitMQListener } from "@src/packages/rabbitmq/baseRabbitMQ.listener";
import { UserCreatedEvent } from "../user.event";
import rabbitMQService, {
  RabbitMQService,
} from "@src/packages/rabbitmq/rabbitMQ.service";

export class UserCreatedPluginDelayedListener extends BaseRabbitMQListener<UserCreatedEvent> {
  exchange = "user-events-delayed";
  queue = "user-created-plugin-delayed-worker";
  routingKey = "user.created";

  constructor(rabbitmq: RabbitMQService) {
    super(
      rabbitmq,
      {},
      {
        type: "x-delayed-message",
        arguments: { "x-delayed-type": "topic" },
      }
    );
  }

  protected async onMessage(data: UserCreatedEvent): Promise<void> {
    console.log("[UserCreatedListener] Received:", data);

    if (data.name === "Fail Test") {
      throw new Error("Simulated failure for retry");
    }

    console.log("[UserCreatedListener] Processed successfully.");
  }
}

export default new UserCreatedPluginDelayedListener(rabbitMQService);

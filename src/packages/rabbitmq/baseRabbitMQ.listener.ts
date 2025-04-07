import { RabbitMQService } from "./rabbitMQ.service";

export abstract class BaseRabbitMQListener<T> {
  protected abstract exchange: string;
  protected abstract queue: string;
  protected abstract routingKey: string;
  protected abstract onMessage(data: T): Promise<void>;

  constructor(
    protected readonly rabbitmq: RabbitMQService,
    private readonly retryOptions: {
      maxAttempts?: number;
      backoffInitial?: number;
      backoffMultiplier?: number;
      backoffMax?: number;
    } = {}
  ) {}

  public async listen(): Promise<void> {
    const {
      maxAttempts = 3,
      backoffInitial = 500,
      backoffMultiplier = 2,
      backoffMax = 10000,
    } = this.retryOptions;

    await this.rabbitmq.consumeWithRetry<T>(
      this.exchange,
      this.queue,
      this.routingKey,
      async (data, ack, nack) => {
        try {
          await this.onMessage(data);
          ack();
        } catch (error: any) {
          console.error(
            `[${this.constructor.name}] Error processing message:`,
            error.message
          );
          nack();
        }
      },
      {
        maxAttempts,
        backoffInitial,
        backoffMultiplier,
        backoffMax,
        retryExchange: `${this.exchange}.retry`,
        retryQueuePrefix: `${this.queue}.retry`,
        parkingLotQueue: `${this.queue}.parkinglot`,
      }
    );
  }
}

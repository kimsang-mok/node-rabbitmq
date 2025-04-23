import amqp, { Channel, ChannelModel } from "amqplib";

export class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(
    private url: string = process.env.RABBITMQ_URL || "amqp://localhost"
  ) {}

  async connect(): Promise<void> {
    if (this.connection && this.channel) return;

    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      this.connection.on("error", async (error) => {
        console.error("RabbitMQ connection error: ", error);
        await this.reconnect();
      });

      this.connection.on("close", async () => {
        console.warn("RabbitMQ connection closed. Attempting to reconnect...");
        await this.reconnect();
      });

      console.log("RabbitMQ connected");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ: ", error);
      throw error;
    }
  }

  async reconnect(): Promise<void> {
    this.connection = null;
    this.channel = null;
    setTimeout(() => this.connect(), 5000);
  }

  async assertExchange(
    exhange: string,
    type: "topic" | "direct" | "fanout" = "topic"
  ) {
    await this.connect();
    await this.channel!.assertExchange(exhange, type, { durable: true });
  }

  async publish<T>(
    exchange: string,
    routingKey: string,
    data: T
  ): Promise<void> {
    await this.connect();
    const payload = Buffer.from(JSON.stringify(data));
    this.channel!.publish(exchange, routingKey, payload, {
      persistent: true,
    });

    console.log(`[RabbitMQ] Published to "${exchange}" [${routingKey}]`, data);
  }

  async consume<T>(
    exchange: string,
    queue: string,
    routingKey: string,
    onMessage: (data: T, ack: () => void) => void
  ) {
    await this.connect();
    const ch = this.channel!;

    await ch.assertExchange(exchange, "topic", { durable: true });
    await ch.assertQueue(queue, { durable: true });
    await ch.bindQueue(queue, exchange, routingKey);

    await ch.consume(
      queue,
      (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString()) as T;

          const ack = () => ch.ack(msg);
          onMessage(data, ack);
        }
      },
      { noAck: false }
    );

    console.log(`[RabbitMQ] Listening on ${queue} (${exchange}:${routingKey})`);
  }

  async consumeWithRetry<T>(
    exchange: string,
    queue: string,
    routingKey: string,
    onMessage: (data: T, ack: () => void, nack: () => void) => void,
    options: {
      retryExchange?: string;
      retryQueuePrefix?: string;
      parkingLotQueue?: string;
      maxAttempts?: number;
      backoffInitial?: number;
      backoffMultiplier?: number;
      backoffMax?: number;
    }
  ) {
    await this.connect();
    const ch = this.channel!;

    const retryExchange = options.retryExchange || `${exchange}.retry`;
    const retryQueuePrefix = options.retryQueuePrefix || `${queue}.retry`;
    const parkingLotQueue = options.parkingLotQueue || `${queue}.parkinglot`;
    const maxAttempts = options.maxAttempts || 3;
    const backoffInitial = options.backoffInitial || 500;
    const backoffMultiplier = options.backoffMultiplier || 2;
    const backoffMax = options.backoffMax || 10000;

    // declare retry exchange and parking lot queue
    await ch.assertExchange(retryExchange, "direct", { durable: true });
    await ch.assertQueue(parkingLotQueue, { durable: true });
    await ch.bindQueue(
      parkingLotQueue,
      retryExchange,
      `${routingKey}.parkinglot`
    );

    // declare main exchange & queue with DLX to retry exchange
    await ch.assertExchange(exchange, "topic", { durable: true });
    await ch.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": retryExchange,
        "x-dead-letter-routing-key": routingKey,
      },
    });
    await ch.bindQueue(queue, exchange, routingKey);

    const retryDelays: number[] = [];
    let delay = backoffInitial;
    for (let i = 0; i < maxAttempts; i++) {
      retryDelays.push(Math.min(delay, backoffMax));
      delay *= backoffMultiplier;
    }

    for (const [i, ttl] of retryDelays.entries()) {
      const retryQueue = `${retryQueuePrefix}.${ttl}`;
      await ch.assertQueue(retryQueue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": exchange,
          "x-dead-letter-routing-key": routingKey,
          "x-message-ttl": ttl,
        },
      });
      await ch.bindQueue(
        retryQueue,
        retryExchange,
        `${routingKey}.retry.${ttl}`
      );
    }

    await ch.consume(queue, async (msg) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString()) as T;
      const deathHeader = msg.properties.headers?.["x-death"] as
        | any[]
        | undefined;
      const attempts = deathHeader?.[0]?.count || 0;

      const ack = () => ch.ack(msg);
      const nack = () => {
        if (attempts < maxAttempts) {
          const ttl = retryDelays[attempts];
          const retryRoutingKey = `${routingKey}.retry.${ttl}`;
          ch.publish(retryExchange, retryRoutingKey, msg.content, {
            headers: msg.properties.headers,
          });
          // ack original so it doesn't go to DLX
          ch.ack(msg);
        } else {
          // move to parking lot
          ch.publish(retryExchange, `${routingKey}.parkinglot`, msg.content, {
            headers: msg.properties.headers,
          });
          ch.ack(msg);
        }
      };

      try {
        await onMessage(data, ack, nack);
      } catch (error: any) {
        console.error(`[RabbitMQ] Message handling error:`, error.message);
        nack();
      }
    });
  }

  async publishDelayed<T>(
    targetExchange: string,
    routingKey: string,
    data: T,
    delayMs: number
  ): Promise<void> {
    const delayQueue = `${targetExchange}.${routingKey}.delay`;

    await this.connect();

    await this.channel!.assertQueue(delayQueue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": targetExchange,
        "x-dead-letter-routing-key": routingKey,
        "x-message-ttl": delayMs,
      },
    });

    const payload = Buffer.from(JSON.stringify(data));

    try {
      const success = this.channel!.sendToQueue(delayQueue, payload, {
        persistent: true,
      });

      if (!success) {
        throw new Error(`[RabbitMQ] Backpressure on queue: ${delayQueue}`);
      }

      console.log(
        `[RabbitMQ] Delayed publish to "${targetExchange}" [${routingKey}] in ${delayMs}ms`
      );
    } catch (error) {
      throw new Error(
        `[RabbitMQ] Failed to send message to ${delayQueue}: ${error}`
      );
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.channel = null;
    this.connection = null;
  }
}

export default new RabbitMQService();

export interface IRabbitMQPublisher<T> {
  routingKey: string;
  exchange: string;
  publish(data: T, options?: { delayMs?: number }): Promise<void>;
}

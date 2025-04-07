export interface IRabbitMQPublisher<T> {
  routingKey: string;
  exchange: string;
  publish(data: T): Promise<void>;
}

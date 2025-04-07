export interface IRabbitMQListener<T> {
  queue: string;
  routingKey: string;
  exhange: string;
  onMessage(data: T): Promise<void>;
}

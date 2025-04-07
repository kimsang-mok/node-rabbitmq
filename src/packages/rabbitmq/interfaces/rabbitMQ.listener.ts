export interface IRabbitMQListener<T> {
  queue: string;
  routingKey: string;
  exchange: string;
  onMessage(data: T): Promise<void>;
}

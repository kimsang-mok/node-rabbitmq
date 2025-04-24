export interface ExchangeOptions {
  type?: "topic" | "direct" | "fanout" | "x-delayed-message";
  arguments?: Record<string, any>;
}

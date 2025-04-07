import userCreatedPublisher, {
  UserCreatedPublisher,
} from "./events/publishers/userCreated.publisher";
import { UserCreatedEvent } from "@src/packages/rabbitmq/types/user.event";

export class UserService {
  constructor(private userCreatedPublisher: UserCreatedPublisher) {}

  async createUser(data: UserCreatedEvent) {
    return await this.userCreatedPublisher.publish(data);
  }
}

export default new UserService(userCreatedPublisher);

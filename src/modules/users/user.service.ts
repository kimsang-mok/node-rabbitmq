import userCreatedPublisher, {
  UserCreatedPublisher,
} from "./events/publishers/userCreated.publisher";
import { UserCreatedEvent } from "@src/modules/users/events/user.event";
import userCreatedDelayedPublisher, {
  UserCreatedDelayedPublisher,
} from "./events/publishers/userCreatedDelayed.publisher";

export class UserService {
  constructor(
    private userCreatedPublisher: UserCreatedPublisher,
    private userCreatedDelayedPublisher: UserCreatedDelayedPublisher
  ) {}

  async createUser(data: UserCreatedEvent) {
    return await this.userCreatedPublisher.publish(data);
  }

  async createUserWith5sDelay(data: UserCreatedEvent) {
    return await this.userCreatedDelayedPublisher.publish(data, {
      delayMs: 5000,
    });
  }
}

export default new UserService(
  userCreatedPublisher,
  userCreatedDelayedPublisher
);

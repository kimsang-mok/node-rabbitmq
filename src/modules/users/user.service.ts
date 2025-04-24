import userCreatedPublisher, {
  UserCreatedPublisher,
} from "./events/publishers/userCreated.publisher";
import { UserCreatedEvent } from "@src/modules/users/events/user.event";
import userCreatedDelayedPublisher, {
  UserCreatedDelayedPublisher,
} from "./events/publishers/userCreatedDelayed.publisher";
import userCreatedPluginDelayedPublisher, {
  UserCreatedPluginDelayedPublisher,
} from "./events/publishers/userCreatedPluginDelayed.publisher";

export class UserService {
  constructor(
    private userCreatedPublisher: UserCreatedPublisher,
    private userCreatedDelayedPublisher: UserCreatedDelayedPublisher,
    private userCreatedPluginDelatedPublisher: UserCreatedPluginDelayedPublisher
  ) {}

  async createUser(data: UserCreatedEvent) {
    return await this.userCreatedPublisher.publish(data);
  }

  async createUserWith5sDelay(data: UserCreatedEvent) {
    return await this.userCreatedDelayedPublisher.publish(data, {
      delayMs: 5000,
    });
  }

  async createUserWithDynamicDelay(data: UserCreatedEvent, delayMs: number) {
    return await this.userCreatedPluginDelatedPublisher.publish(data, {
      delayMs,
    });
  }
}

export default new UserService(
  userCreatedPublisher,
  userCreatedDelayedPublisher,
  userCreatedPluginDelayedPublisher
);

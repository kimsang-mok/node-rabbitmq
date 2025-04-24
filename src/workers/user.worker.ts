import rabbitMQService from "../packages/rabbitmq/rabbitMQ.service";
import userCreatedListeners from "../modules/users/events/listeners/userCreated.listener";

(async () => {
  console.log("User worker is running...");

  await rabbitMQService.connect();
  await userCreatedListeners.listen();
})();

import userCreatedPluginDelayedListener from "@src/modules/users/events/listeners/userCreatedPluginDelayed.listener";
import rabbitMQService from "@src/packages/rabbitmq/rabbitMQ.service";

(async () => {
  console.log("User delayed worker is running...");

  await rabbitMQService.connect();
  await userCreatedPluginDelayedListener.listen();
})();

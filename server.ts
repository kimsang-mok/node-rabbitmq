import { createServer } from "http";
import app from "./app";

const server = createServer(app);

server.listen(app.get("port"), () => {
  console.log(
    `Server running at http://localhost:${app.get("port")} in ${app.get(
      "env"
    )} mode`
  );
  console.log("Press Ctrl+C to stop");
});

export default server;
